// 模板版本
export const TEMPLATE_VERSION = '1.0.0';

// 模板类型
export const TEMPLATE_TYPES = {
    PRESET: 'preset',    // 预设模板
    CUSTOM: 'custom',    // 自定义模板
    MARKET: 'market'     // 市场模板
};

// 模板分类
export const TEMPLATE_CATEGORIES = {
    QUOTE: 'quote',          // 引用
    POETRY: 'poetry',        // 诗歌
    WISDOM: 'wisdom',        // 智慧
    MOTIVATION: 'motivation' // 励志
};

// 模板Schema
export const templateSchema = {
    type: 'object',
    required: ['id', 'version', 'type', 'name', 'style'],
    properties: {
        id: {
            type: 'string',
            description: '模板唯一标识'
        },
        version: {
            type: 'string',
            description: '模板版本号'
        },
        type: {
            type: 'string',
            enum: Object.values(TEMPLATE_TYPES),
            description: '模板类型'
        },
        name: {
            type: 'string',
            description: '模板名称'
        },
        description: {
            type: 'string',
            description: '模板描述'
        },
        category: {
            type: 'string',
            enum: Object.values(TEMPLATE_CATEGORIES),
            description: '模板分类'
        },
        author: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' }
            }
        },
        tags: {
            type: 'array',
            items: { type: 'string' }
        },
        style: {
            type: 'object',
            required: ['background', 'font', 'layout', 'effects'],
            properties: {
                background: {
                    type: 'object',
                    required: ['type', 'color'],
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['solid', 'gradient', 'image']
                        },
                        color: { type: 'string' },
                        gradient: {
                            type: 'object',
                            properties: {
                                start: { type: 'string' },
                                end: { type: 'string' }
                            }
                        },
                        image: { type: 'string' }
                    }
                },
                font: {
                    type: 'object',
                    required: ['family', 'size', 'color'],
                    properties: {
                        family: { type: 'string' },
                        size: { type: 'string' },
                        weight: { type: 'string' },
                        color: { type: 'string' },
                        lineHeight: { type: 'string' },
                        letterSpacing: { type: 'string' },
                        align: { type: 'string' }
                    }
                },
                layout: {
                    type: 'object',
                    properties: {
                        width: { type: 'string' },
                        height: { type: 'string' },
                        padding: { type: 'string' },
                        margin: { type: 'string' },
                        borderRadius: { type: 'string' }
                    }
                },
                effects: {
                    type: 'object',
                    properties: {
                        shadow: {
                            type: 'object',
                            properties: {
                                x: { type: 'string' },
                                y: { type: 'string' },
                                blur: { type: 'string' },
                                color: { type: 'string' }
                            }
                        },
                        border: {
                            type: 'object',
                            properties: {
                                width: { type: 'string' },
                                style: { type: 'string' },
                                color: { type: 'string' }
                            }
                        },
                        opacity: { type: 'string' },
                        watermark: {
                            type: 'object',
                            properties: {
                                text: { type: 'string' },
                                font: { type: 'string' },
                                color: { type: 'string' },
                                opacity: { type: 'number' }
                            }
                        }
                    }
                }
            }
        },
        preview: { type: 'string' },
        rating: { type: 'number' },
        downloads: { type: 'number' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
    }
};
