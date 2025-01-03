import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../store/reducers';

// 创建测试store
export const createTestStore = (preloadedState) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState
    });
};

// 渲染带有Provider的组件
export const renderWithProviders = (
    ui,
    {
        preloadedState = {},
        store = createTestStore(preloadedState),
        ...renderOptions
    } = {}
) => {
    const Wrapper = ({ children }) => {
        return (
            <Provider store={store}>
                <BrowserRouter>
                    {children}
                </BrowserRouter>
            </Provider>
        );
    };

    return {
        store,
        ...render(ui, { wrapper: Wrapper, ...renderOptions })
    };
};

// 模拟Chrome API
export const mockChromeAPI = () => {
    global.chrome = {
        storage: {
            local: {
                get: jest.fn(),
                set: jest.fn(),
                remove: jest.fn()
            },
            sync: {
                get: jest.fn(),
                set: jest.fn(),
                remove: jest.fn()
            }
        },
        runtime: {
            sendMessage: jest.fn(),
            onMessage: {
                addListener: jest.fn(),
                removeListener: jest.fn()
            }
        },
        tabs: {
            query: jest.fn(),
            sendMessage: jest.fn(),
            create: jest.fn(),
            update: jest.fn()
        }
    };
};

// 模拟定时器
export const mockTimers = () => {
    jest.useFakeTimers();
    return {
        advanceTimersByTime: jest.advanceTimersByTime,
        runAllTimers: jest.runAllTimers,
        clearAllTimers: jest.clearAllTimers
    };
};

// 模拟fetch请求
export const mockFetch = (data) => {
    global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve(data)
        })
    );
};

// 模拟localStorage
export const mockLocalStorage = () => {
    const store = {};
    return {
        getItem: jest.fn(key => store[key]),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            Object.keys(store).forEach(key => {
                delete store[key];
            });
        })
    };
};

// 等待异步操作
export const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

// 创建模拟事件
export const createMockEvent = (type, data = {}) => ({
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    type,
    ...data
});
