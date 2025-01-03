import { EventEmitter } from 'events';
import logManager from './LogManager';
import { validatePlugin } from '../utils/pluginUtils';

class PluginManager extends EventEmitter {
    constructor() {
        super();
        this.plugins = new Map();
        this.hooks = new Map();
        this.configs = new Map();
        this.dependencies = new Map();
        this.setupHooks();
    }

    // 注册插件
    async register(plugin) {
        try {
            // 验证插件
            validatePlugin(plugin);
            const { name, version } = plugin;
            const pluginKey = `${name}@${version}`;

            // 检查是否已注册
            if (this.plugins.has(pluginKey)) {
                throw new Error(`Plugin ${pluginKey} is already registered`);
            }

            // 检查依赖
            await this.checkDependencies(plugin);

            // 存储插件
            this.plugins.set(pluginKey, {
                ...plugin,
                status: 'registered',
                instance: null
            });

            // 存储依赖关系
            this.dependencies.set(pluginKey, plugin.dependencies || {});

            // 触发事件
            this.emit('plugin:register', {
                name,
                version,
                plugin
            });

            return true;
        } catch (error) {
            logManager.error('Plugin registration failed:', error);
            throw error;
        }
    }

    // 加载插件
    async load(pluginKey) {
        try {
            const plugin = this.plugins.get(pluginKey);
            if (!plugin) {
                throw new Error(`Plugin ${pluginKey} not found`);
            }

            // 检查状态
            if (plugin.status === 'active') {
                return true;
            }

            // 创建实例
            const instance = await this.createPluginInstance(plugin);

            // 初始化配置
            await this.initializeConfig(pluginKey, plugin.defaultConfig);

            // 运行生命周期钩子
            await this.runLifecycleHook('beforeLoad', instance);
            await instance.load();
            await this.runLifecycleHook('afterLoad', instance);

            // 更新状态
            plugin.status = 'active';
            plugin.instance = instance;

            // 触发事件
            this.emit('plugin:load', {
                key: pluginKey,
                plugin
            });

            return true;
        } catch (error) {
            logManager.error('Plugin load failed:', error);
            throw error;
        }
    }

    // 卸载插件
    async unload(pluginKey) {
        try {
            const plugin = this.plugins.get(pluginKey);
            if (!plugin || plugin.status !== 'active') {
                return true;
            }

            // 运行生命周期钩子
            await this.runLifecycleHook('beforeUnload', plugin.instance);
            await plugin.instance.unload();
            await this.runLifecycleHook('afterUnload', plugin.instance);

            // 清理资源
            this.configs.delete(pluginKey);
            plugin.instance = null;
            plugin.status = 'registered';

            // 触发事件
            this.emit('plugin:unload', {
                key: pluginKey,
                plugin
            });

            return true;
        } catch (error) {
            logManager.error('Plugin unload failed:', error);
            throw error;
        }
    }

    // 获取插件配置
    getConfig(pluginKey) {
        return this.configs.get(pluginKey);
    }

    // 更新插件配置
    async updateConfig(pluginKey, config) {
        try {
            const plugin = this.plugins.get(pluginKey);
            if (!plugin) {
                throw new Error(`Plugin ${pluginKey} not found`);
            }

            // 合并配置
            const currentConfig = this.configs.get(pluginKey) || {};
            const newConfig = {
                ...currentConfig,
                ...config
            };

            // 验证配置
            if (plugin.validateConfig) {
                await plugin.validateConfig(newConfig);
            }

            // 更新配置
            this.configs.set(pluginKey, newConfig);

            // 通知插件
            if (plugin.status === 'active') {
                await plugin.instance.onConfigUpdate(newConfig);
            }

            // 触发事件
            this.emit('plugin:config:update', {
                key: pluginKey,
                config: newConfig
            });

            return true;
        } catch (error) {
            logManager.error('Config update failed:', error);
            throw error;
        }
    }

    // 注册钩子
    registerHook(name, handler, priority = 0) {
        if (!this.hooks.has(name)) {
            this.hooks.set(name, new Map());
        }

        const handlers = this.hooks.get(name);
        const hookId = this.generateHookId();

        handlers.set(hookId, {
            handler,
            priority
        });

        return () => handlers.delete(hookId);
    }

    // 运行钩子
    async runHook(name, context) {
        const handlers = this.hooks.get(name);
        if (!handlers) {
            return [];
        }

        const sortedHandlers = Array.from(handlers.values())
            .sort((a, b) => b.priority - a.priority);

        const results = [];
        for (const { handler } of sortedHandlers) {
            try {
                const result = await handler(context);
                results.push(result);
            } catch (error) {
                logManager.error('Hook execution failed:', error);
            }
        }

        return results;
    }

    // 内部方法：检查依赖
    async checkDependencies(plugin) {
        const { dependencies = {} } = plugin;

        for (const [name, version] of Object.entries(dependencies)) {
            const dependencyKey = `${name}@${version}`;
            const dependency = this.plugins.get(dependencyKey);

            if (!dependency) {
                throw new Error(`Missing dependency: ${dependencyKey}`);
            }

            if (dependency.status !== 'active') {
                await this.load(dependencyKey);
            }
        }
    }

    // 内部方法：创建插件实例
    async createPluginInstance(plugin) {
        const { create } = plugin;
        if (typeof create !== 'function') {
            throw new Error('Plugin must have a create function');
        }

        const instance = await create({
            getConfig: () => this.getConfig(plugin.name),
            updateConfig: (config) => this.updateConfig(plugin.name, config),
            registerHook: this.registerHook.bind(this),
            runHook: this.runHook.bind(this),
            log: logManager
        });

        return instance;
    }

    // 内部方法：初始化配置
    async initializeConfig(pluginKey, defaultConfig = {}) {
        if (!this.configs.has(pluginKey)) {
            this.configs.set(pluginKey, { ...defaultConfig });
        }
    }

    // 内部方法：运行生命周期钩子
    async runLifecycleHook(hook, instance) {
        if (typeof instance[hook] === 'function') {
            await instance[hook]();
        }
    }

    // 内部方法：生成钩子ID
    generateHookId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // 内部方法：设置默认钩子
    setupHooks() {
        // 插件生命周期钩子
        this.hooks.set('beforeLoad', new Map());
        this.hooks.set('afterLoad', new Map());
        this.hooks.set('beforeUnload', new Map());
        this.hooks.set('afterUnload', new Map());

        // 配置钩子
        this.hooks.set('configValidate', new Map());
        this.hooks.set('configUpdate', new Map());

        // 错误处理钩子
        this.hooks.set('error', new Map());
    }
}

export default new PluginManager();
