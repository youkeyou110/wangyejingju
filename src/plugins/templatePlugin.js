import { createPluginBuilder } from '../utils/pluginUtils';

// 创建模板插件
export default createPluginBuilder()
    .setName('template-plugin')
    .setVersion('1.0.0')
    .setDescription('A template plugin example')
    .setAuthor('Your Name')
    .addDependency('core', '>=1.0.0')
    .setDefaultConfig({
        enabled: true,
        theme: 'light'
    })
    .addHook('beforeRender', async (context) => {
        // 在渲染前处理模板
        const { template } = context;
        // 处理逻辑...
        return template;
    })
    .setCreate(({ getConfig, updateConfig, registerHook, log }) => {
        // 插件实例
        return {
            // 加载插件
            async load() {
                const config = await getConfig();
                log.info('Template plugin loaded:', config);

                // 注册钩子
                this.unsubscribeHook = registerHook('afterRender', async (context) => {
                    // 渲染后处理
                    const { result } = context;
                    // 处理逻辑...
                    return result;
                });
            },

            // 卸载插件
            async unload() {
                if (this.unsubscribeHook) {
                    this.unsubscribeHook();
                }
                log.info('Template plugin unloaded');
            },

            // 配置更新
            async onConfigUpdate(newConfig) {
                log.info('Config updated:', newConfig);
                // 处理配置更新...
            }
        };
    })
    .build();
