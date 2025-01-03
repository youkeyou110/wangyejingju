import semver from 'semver';

// 验证插件
export const validatePlugin = (plugin) => {
    const requiredFields = ['name', 'version', 'create'];
    const missingFields = requiredFields.filter(field => !plugin[field]);

    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (!semver.valid(plugin.version)) {
        throw new Error('Invalid version format');
    }

    if (typeof plugin.create !== 'function') {
        throw new Error('create must be a function');
    }

    return true;
};

// 创建插件构建器
export const createPluginBuilder = () => {
    const plugin = {
        name: '',
        version: '0.0.1',
        description: '',
        author: '',
        dependencies: {},
        defaultConfig: {},
        hooks: []
    };

    return {
        setName(name) {
            plugin.name = name;
            return this;
        },

        setVersion(version) {
            if (!semver.valid(version)) {
                throw new Error('Invalid version format');
            }
            plugin.version = version;
            return this;
        },

        setDescription(description) {
            plugin.description = description;
            return this;
        },

        setAuthor(author) {
            plugin.author = author;
            return this;
        },

        addDependency(name, version) {
            plugin.dependencies[name] = version;
            return this;
        },

        setDefaultConfig(config) {
            plugin.defaultConfig = config;
            return this;
        },

        addHook(name, handler, priority = 0) {
            plugin.hooks.push({ name, handler, priority });
            return this;
        },

        setCreate(createFn) {
            plugin.create = createFn;
            return this;
        },

        build() {
            validatePlugin(plugin);
            return plugin;
        }
    };
};

// 创建插件沙箱
export const createPluginSandbox = (plugin, context) => {
    // 基础API
    const api = {
        log: context.log,
        getConfig: context.getConfig,
        updateConfig: context.updateConfig,
        registerHook: context.registerHook,
        runHook: context.runHook
    };

    // 权限控制
    const permissions = plugin.permissions || [];
    const restrictedApi = {};

    for (const permission of permissions) {
        switch (permission) {
            case 'storage':
                restrictedApi.storage = {
                    get: context.storage.get,
                    set: context.storage.set
                };
                break;
            case 'network':
                restrictedApi.fetch = context.fetch;
                break;
            // 可以添加更多权限
        }
    }

    return {
        ...api,
        ...restrictedApi
    };
};

// 插件依赖排序
export const sortPluginsByDependencies = (plugins) => {
    const graph = new Map();
    const visited = new Set();
    const sorted = [];

    // 构建依赖图
    for (const plugin of plugins) {
        graph.set(plugin.name, plugin.dependencies || {});
    }

    // 深度优先搜索
    const visit = (name) => {
        if (visited.has(name)) return;
        visited.add(name);

        const dependencies = graph.get(name) || {};
        for (const dep of Object.keys(dependencies)) {
            visit(dep);
        }

        sorted.push(plugins.find(p => p.name === name));
    };

    // 遍历所有插件
    for (const plugin of plugins) {
        visit(plugin.name);
    }

    return sorted;
};

// 验证插件兼容性
export const checkPluginCompatibility = (plugin, system) => {
    const { requirements = {} } = plugin;

    // 检查系统版本
    if (requirements.system) {
        if (!semver.satisfies(system.version, requirements.system)) {
            return {
                compatible: false,
                reason: `Requires system version ${requirements.system}`
            };
        }
    }

    // 检查API版本
    if (requirements.api) {
        if (!semver.satisfies(system.apiVersion, requirements.api)) {
            return {
                compatible: false,
                reason: `Requires API version ${requirements.api}`
            };
        }
    }

    // 检查运行时环境
    if (requirements.runtime) {
        for (const [key, value] of Object.entries(requirements.runtime)) {
            if (!system.runtime[key] || system.runtime[key] < value) {
                return {
                    compatible: false,
                    reason: `Requires ${key} >= ${value}`
                };
            }
        }
    }

    return {
        compatible: true
    };
};
