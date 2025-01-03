import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { mockChromeAPI } from './utils/testUtils';

// 配置测试库
configure({ testIdAttribute: 'data-testid' });

// 模拟Chrome API
beforeAll(() => {
    mockChromeAPI();
});

// 清理所有定时器
afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
});

// 全局错误处理
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
        if (
            /Warning/.test(args[0]) ||
            /React does not recognize/.test(args[0])
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
});
