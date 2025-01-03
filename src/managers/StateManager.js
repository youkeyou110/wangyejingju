import { EventEmitter } from 'events';
import dataManager from './DataManager';

class StateManager extends EventEmitter {
    constructor() {
        super();
        this.state = new Map();
        this.reducers = new Map();
        this.middlewares = [];
        this.setupDataSync();
    }

    // 注册reducer
    registerReducer(namespace, reducer) {
        if (typeof reducer !== 'function') {
            throw new Error('Reducer must be a function');
        }
        this.reducers.set(namespace, reducer);
        return this;
    }

    // 添加中间件
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new Error('Middleware must be a function');
        }
        this.middlewares.push(middleware);
        return this;
    }

    // 派发action
    async dispatch(action) {
        try {
            // 运行中间件
            const context = { action, state: this.state };
            await this.runMiddlewares(context);

            // 查找对应的reducer
            const [namespace] = action.type.split('/');
            const reducer = this.reducers.get(namespace);
            if (!reducer) {
                throw new Error(`No reducer found for namespace: ${namespace}`);
            }

            // 执行reducer
            const currentState = this.state.get(namespace);
            const newState = reducer(currentState, action);

            // 更新状态
            this.state.set(namespace, newState);

            // 触发更新事件
            this.emit('stateChange', {
                namespace,
                action,
                prevState: currentState,
                nextState: newState
            });

            // 同步到数据层
            await this.syncToData(namespace, newState);

            return true;
        } catch (error) {
            this.emit('error', error);
            return false;
        }
    }

    // 获取状态
    getState(namespace) {
        return this.state.get(namespace);
    }

    // 订阅状态变化
    subscribe(namespace, callback) {
        const handler = (event) => {
            if (event.namespace === namespace) {
                callback(event.nextState, event.prevState, event.action);
            }
        };
        this.on('stateChange', handler);
        return () => this.off('stateChange', handler);
    }

    // 内部方法：运行中间件
    async runMiddlewares(context) {
        for (const middleware of this.middlewares) {
            await middleware(context);
        }
    }

    // 内部方法：同步到数据层
    async syncToData(namespace, state) {
        try {
            await dataManager.set(`state:${namespace}`, state, {
                type: 'state',
                namespace
            });
        } catch (error) {
            this.emit('error', error);
        }
    }

    // 内部方法：从数据层恢复
    async restoreFromData() {
        try {
            const states = await dataManager.query({
                type: 'state'
            });

            for (const { key, value } of states) {
                const namespace = key.split(':')[1];
                this.state.set(namespace, value);
            }
        } catch (error) {
            this.emit('error', error);
        }
    }

    // 内部方法：设置数据同步
    setupDataSync() {
        // 监听数据变化
        dataManager.subscribe(async (event) => {
            if (event.type === 'set' && event.key.startsWith('state:')) {
                const namespace = event.key.split(':')[1];
                const currentState = this.state.get(namespace);

                if (JSON.stringify(currentState) !== JSON.stringify(event.value)) {
                    this.state.set(namespace, event.value);
                    this.emit('stateChange', {
                        namespace,
                        action: { type: 'DATA_SYNC' },
                        prevState: currentState,
                        nextState: event.value
                    });
                }
            }
        });

        // 初始化时恢复状态
        this.restoreFromData();
    }
}

export default new StateManager();
