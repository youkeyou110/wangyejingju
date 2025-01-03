import { EventEmitter } from 'events';
import logManager from './LogManager';

class RecommendationManager extends EventEmitter {
    constructor() {
        super();
        this.userPreferences = new Map();
        this.usageHistory = new Map();
        this.recommendations = new Map();
        this.modelConfig = {
            minSamples: 5,
            maxHistory: 100,
            similarityThreshold: 0.6
        };
    }

    // 记录用户行为
    async trackUserAction(action) {
        const { type, data, timestamp = Date.now() } = action;

        try {
            // 更新使用历史
            if (!this.usageHistory.has(type)) {
                this.usageHistory.set(type, []);
            }
            const history = this.usageHistory.get(type);
            history.unshift({ ...data, timestamp });

            // 限制历史记录数量
            if (history.length > this.modelConfig.maxHistory) {
                history.pop();
            }

            // 更新用户偏好
            await this.updatePreferences(type, data);

            // 生成新的推荐
            await this.generateRecommendations(type);

        } catch (error) {
            logManager.error('Failed to track user action:', error);
        }
    }

    // 更新用户偏好
    async updatePreferences(type, data) {
        if (!this.userPreferences.has(type)) {
            this.userPreferences.set(type, new Map());
        }
        const preferences = this.userPreferences.get(type);

        switch (type) {
            case 'template':
                this.updateTemplatePreferences(preferences, data);
                break;
            case 'style':
                this.updateStylePreferences(preferences, data);
                break;
            case 'content':
                this.updateContentPreferences(preferences, data);
                break;
        }
    }

    // 更新模板偏好
    updateTemplatePreferences(preferences, data) {
        const { id, category, style } = data;

        // 更新类别偏好
        const categoryCount = preferences.get('category') || new Map();
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
        preferences.set('category', categoryCount);

        // 更新样式偏好
        const styleCount = preferences.get('style') || new Map();
        Object.entries(style).forEach(([key, value]) => {
            if (!styleCount.has(key)) {
                styleCount.set(key, new Map());
            }
            const valueCount = styleCount.get(key);
            valueCount.set(value, (valueCount.get(value) || 0) + 1);
        });
        preferences.set('style', styleCount);
    }

    // 更新样式偏好
    updateStylePreferences(preferences, data) {
        Object.entries(data).forEach(([key, value]) => {
            if (!preferences.has(key)) {
                preferences.set(key, new Map());
            }
            const valueCount = preferences.get(key);
            valueCount.set(value, (valueCount.get(value) || 0) + 1);
        });
    }

    // 更新内容偏好
    updateContentPreferences(preferences, data) {
        const { text, tags, source } = data;

        // 更新标签偏好
        const tagCount = preferences.get('tags') || new Map();
        tags.forEach(tag => {
            tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        });
        preferences.set('tags', tagCount);

        // 更新来源偏好
        const sourceCount = preferences.get('source') || new Map();
        sourceCount.set(source, (sourceCount.get(source) || 0) + 1);
        preferences.set('source', sourceCount);

        // 更新文本特征
        this.updateTextFeatures(preferences, text);
    }

    // 更新文本特征
    updateTextFeatures(preferences, text) {
        // 文本长度偏好
        const lengthCount = preferences.get('length') || new Map();
        const lengthRange = this.getTextLengthRange(text.length);
        lengthCount.set(lengthRange, (lengthCount.get(lengthRange) || 0) + 1);
        preferences.set('length', lengthCount);

        // 文本风格特征
        const styleFeatures = this.extractTextStyleFeatures(text);
        const styleCount = preferences.get('textStyle') || new Map();
        Object.entries(styleFeatures).forEach(([feature, value]) => {
            if (!styleCount.has(feature)) {
                styleCount.set(feature, new Map());
            }
            const valueCount = styleCount.get(feature);
            valueCount.set(value, (valueCount.get(value) || 0) + 1);
        });
        preferences.set('textStyle', styleCount);
    }

    // 生成推荐
    async generateRecommendations(type) {
        if (!this.hasEnoughData(type)) return;

        const preferences = this.userPreferences.get(type);
        const history = this.usageHistory.get(type);

        switch (type) {
            case 'template':
                await this.generateTemplateRecommendations(preferences, history);
                break;
            case 'style':
                await this.generateStyleRecommendations(preferences, history);
                break;
            case 'content':
                await this.generateContentRecommendations(preferences, history);
                break;
        }

        this.emit('recommendationsUpdated', type);
    }

    // 获取推荐
    getRecommendations(type, limit = 5) {
        const recommendations = this.recommendations.get(type) || [];
        return recommendations.slice(0, limit);
    }

    // 检查数据是否足够
    hasEnoughData(type) {
        const history = this.usageHistory.get(type) || [];
        return history.length >= this.modelConfig.minSamples;
    }

    // 计算相似度
    calculateSimilarity(a, b) {
        // 实现相似度计算逻辑
        return 0.8; // 示例返回值
    }

    // 获取文本长度范围
    getTextLengthRange(length) {
        if (length < 50) return 'short';
        if (length < 200) return 'medium';
        return 'long';
    }

    // 提取文本风格特征
    extractTextStyleFeatures(text) {
        return {
            hasEmoji: /[\u{1F300}-\u{1F9FF}]/u.test(text),
            hasPunctuation: /[。！？，、；：""''（）《》〈〉【】『』「」﹃﹄〔〕…—～﹏]/.test(text),
            hasQuote: /[""]/.test(text),
            // 可以添加更多特征
        };
    }
}

export default new RecommendationManager();
