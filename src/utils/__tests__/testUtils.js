import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'antd';

// 自定义渲染器
export const renderWithProviders = (ui, options = {}) => {
    const Wrapper = ({ children }) => (
        <ThemeProvider>
            {children}
        </ThemeProvider>
    );

    return render(ui, { wrapper: Wrapper, ...options });
};

// 模拟存储
export const mockStorage = () => {
    const storage = {};
    return {
        getItem: jest.fn(key => storage[key]),
        setItem: jest.fn((key, value) => {
            storage[key] = value;
        }),
        removeItem: jest.fn(key => {
            delete storage[key];
        }),
        clear: jest.fn(() => {
            Object.keys(storage).forEach(key => {
                delete storage[key];
            });
        }),
        getAllItems: () => ({ ...storage })
    };
};

// 模拟性能API
export const mockPerformanceAPI = () => {
    const originalPerformance = global.performance;
    const mockPerformance = {
        now: jest.fn(() => Date.now()),
        memory: {
            usedJSHeapSize: 1000000,
            totalJSHeapSize: 2000000
        },
        measure: jest.fn(),
        mark: jest.fn(),
        getEntriesByType: jest.fn(() => []),
        getEntriesByName: jest.fn(() => [])
    };

    beforeAll(() => {
        global.performance = mockPerformance;
    });

    afterAll(() => {
        global.performance = originalPerformance;
    });

    return mockPerformance;
};

// 模拟Chrome API
export const mockChromeAPI = () => {
    const storage = mockStorage();
    const mockChrome = {
        storage: {
            local: storage,
            sync: storage
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
            sendMessage: jest.fn()
        }
    };

    global.chrome = mockChrome;
    return mockChrome;
};

// 等待异步操作
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// 模拟拖拽事件
export const mockDragEvent = (element, { x = 0, y = 0 } = {}) => {
    const mouseDown = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0
    });

    const mouseMove = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
    });

    const mouseUp = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
    });

    element.dispatchEvent(mouseDown);
    element.dispatchEvent(mouseMove);
    element.dispatchEvent(mouseUp);
};
