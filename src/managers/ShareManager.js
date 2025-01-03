class ShareManager {
    constructor() {
        this.platforms = new Map();
        this.setupDefaultPlatforms();
    }

    // 注册分享平台
    registerPlatform(platform) {
        const { name, share, icon } = platform;
        this.platforms.set(name, { share, icon });
    }

    // 获取所有支持的平台
    getPlatforms() {
        return Array.from(this.platforms.keys());
    }

    // 格式化分享内容
    formatContent(data, platform) {
        const { text, image, title, author, url } = data;
        const templates = {
            wechat: {
                format: (data) => ({
                    title: title || '分享一段金句',
                    desc: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
                    link: url || window.location.href,
                    imgUrl: image,
                    type: 'link',
                    success: () => {
                        this.trackShare('wechat', data);
                    }
                })
            },
            weibo: {
                format: (data) => {
                    const content = `${text} ${author ? `—— ${author}` : ''} ${url || ''}`;
                    return {
                        text: content.slice(0, 140),
                        pic: image,
                        appkey: 'your_weibo_appkey'
                    };
                }
            },
            twitter: {
                format: (data) => {
                    const content = `${text} ${author ? `—— ${author}` : ''}`;
                    return {
                        text: content.slice(0, 280),
                        url: url,
                        hashtags: ['金句卡片']
                    };
                }
            }
        };

        return templates[platform]?.format(data) || data;
    }

    // 分享到指定平台
    async share(platform, data) {
        const handler = this.platforms.get(platform);
        if (!handler) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        try {
            const formattedData = this.formatContent(data, platform);
            await handler.share(formattedData);
            this.trackShare(platform, data);
            return true;
        } catch (error) {
            console.error(`Share to ${platform} failed:`, error);
            throw error;
        }
    }

    // 跟踪分享数据
    trackShare(platform, data) {
        // 记录分享事件
        const shareEvent = {
            platform,
            timestamp: Date.now(),
            contentType: 'quote-card',
            contentId: data.id,
            success: true
        };

        // 可以发送到分析系统
        console.log('Share tracked:', shareEvent);
    }

    // 设置默认平台
    setupDefaultPlatforms() {
        // 微信
        this.registerPlatform({
            name: 'wechat',
            icon: 'wechat',
            share: async (data) => {
                if (window.wx) {
                    await window.wx.ready(() => {
                        window.wx.updateAppMessageShareData(data);
                        window.wx.updateTimelineShareData(data);
                    });
                } else {
                    throw new Error('WeChat SDK not found');
                }
            }
        });

        // 微博
        this.registerPlatform({
            name: 'weibo',
            icon: 'weibo',
            share: async (data) => {
                const params = new URLSearchParams(data);
                const url = `http://service.weibo.com/share/share.php?${params}`;
                window.open(url, '_blank');
            }
        });

        // Twitter
        this.registerPlatform({
            name: 'twitter',
            icon: 'twitter',
            share: async (data) => {
                const { text, url, hashtags } = data;
                const params = new URLSearchParams({
                    text: encodeURIComponent(text),
                    url: url || '',
                    hashtags: hashtags.join(',')
                });
                window.open(`https://twitter.com/intent/tweet?${params}`, '_blank');
            }
        });
    }
}

export default new ShareManager();
