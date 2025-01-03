class ResourceManager {
    constructor() {
        this.resources = new Map();
        this.loadingPromises = new Map();
        this.config = {
            maxCacheSize: 50 * 1024 * 1024, // 50MB
            maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7天
            preloadResources: ['defaultTemplate', 'defaultFonts']
        };
    }

    // 资源加载
    async loadResource(key, loader) {
        // 检查缓存
        if (this.resources.has(key)) {
            const cached = this.resources.get(key);
            if (!this.isExpired(cached)) {
                return cached.data;
            }
            this.resources.delete(key);
        }

        // 检查是否正在加载
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }

        // 开始加载
        const loadingPromise = (async () => {
            try {
                const data = await loader();
                const resource = {
                    key,
                    data,
                    size: this.getSize(data),
                    timestamp: Date.now()
                };

                // 缓存管理
                await this.manageCache();
                this.resources.set(key, resource);

                return data;
            } finally {
                this.loadingPromises.delete(key);
            }
        })();

        this.loadingPromises.set(key, loadingPromise);
        return loadingPromise;
    }

    // 预加载资源
    async preloadResources() {
        const promises = this.config.preloadResources.map(key => {
            const loader = this.getResourceLoader(key);
            return this.loadResource(key, loader);
        });
        await Promise.all(promises);
    }

    // 获取资源加载器
    getResourceLoader(key) {
        const loaders = {
            defaultTemplate: async () => {
                const response = await fetch('templates/default.json');
                return response.json();
            },
            defaultFonts: async () => {
                // 加载默认字体
                const fonts = [
                    { family: 'Noto Sans SC', url: 'fonts/NotoSansSC-Regular.woff2' },
                    { family: 'LXGW WenKai', url: 'fonts/LXGWWenKai-Regular.woff2' }
                ];
                return Promise.all(fonts.map(async font => {
                    const response = await fetch(font.url);
                    const buffer = await response.arrayBuffer();
                    return new FontFace(font.family, buffer);
                }));
            }
        };
        return loaders[key];
    }

    // 缓存管理
    async manageCache() {
        let totalSize = 0;
        const entries = Array.from(this.resources.entries());

        // 计算总大小
        for (const [_, resource] of entries) {
            totalSize += resource.size;
        }

        // 如果超出限制，删除旧的资源
        if (totalSize > this.config.maxCacheSize) {
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            while (totalSize > this.config.maxCacheSize && entries.length > 0) {
                const [key, resource] = entries.shift();
                totalSize -= resource.size;
                this.resources.delete(key);
            }
        }

        // 清理过期资源
        const now = Date.now();
        for (const [key, resource] of this.resources) {
            if (now - resource.timestamp > this.config.maxCacheAge) {
                this.resources.delete(key);
            }
        }
    }

    // 检查资源是否过期
    isExpired(resource) {
        return Date.now() - resource.timestamp > this.config.maxCacheAge;
    }

    // 获取数据大小
    getSize(data) {
        if (data instanceof ArrayBuffer) {
            return data.byteLength;
        }
        if (typeof data === 'string') {
            return data.length * 2;
        }
        return JSON.stringify(data).length * 2;
    }

    // 清理资源
    clear() {
        this.resources.clear();
        this.loadingPromises.clear();
    }
}

export default ResourceManager;
