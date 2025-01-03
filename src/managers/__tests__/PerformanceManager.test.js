import performanceManager from '../PerformanceManager';
import { mockPerformanceAPI, waitForAsync } from '../../utils/testUtils';

describe('PerformanceManager', () => {
    let performance;

    beforeEach(() => {
        performance = mockPerformanceAPI();
        performanceManager.stop();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('基本监控', () => {
        test('应该能够开始和停止监控', () => {
            performanceManager.start();
            expect(performanceManager.isMonitoring).toBe(true);

            performanceManager.stop();
            expect(performanceManager.isMonitoring).toBe(false);
        });

        test('应该收集FPS数据', async () => {
            const listener = jest.fn();
            performanceManager.addListener(listener);

            performanceManager.start();
            await waitForAsync();

            expect(listener).toHaveBeenCalled();
            expect(listener.mock.calls[0][0].name).toBe('fps');
        });

        test('应该监控内存使用', async () => {
            const listener = jest.fn();
            performanceManager.addListener(listener);

            performanceManager.start();
            await waitForAsync();

            const memoryCall = listener.mock.calls.find(call => call[0].name === 'memory');
            expect(memoryCall).toBeTruthy();
            expect(memoryCall[0].value.usage).toBeLessThan(1);
        });
    });

    describe('警告系统', () => {
        test('应该发出性能警告', async () => {
            const handler = jest.fn();
            performanceManager.addWarningHandler(handler);

            // 模拟低FPS
            performance.now.mockImplementation(() => {
                return Date.now() + 100; // 模拟每帧100ms，约10fps
            });

            performanceManager.start();
            await waitForAsync();

            expect(handler).toHaveBeenCalled();
            expect(handler.mock.calls[0][0].type).toBe('fps');
        });

        test('应该清理警告处理器', () => {
            const handler = jest.fn();
            const cleanup = performanceManager.addWarningHandler(handler);

            cleanup();
            performanceManager.emitWarning('test', 0);

            expect(handler).not.toHaveBeenCalled();
        });
    });

    describe('性能报告', () => {
        test('应该生成完整的性能报告', async () => {
            performanceManager.start();
            await waitForAsync();

            const report = performanceManager.generateReport();

            expect(report).toHaveProperty('timestamp');
            expect(report).toHaveProperty('metrics');
            expect(report).toHaveProperty('warnings');
            expect(report).toHaveProperty('recommendations');
        });

        test('应该包含所有性能指标', async () => {
            performanceManager.start();
            await waitForAsync();

            const report = performanceManager.generateReport();
            const metrics = Object.keys(report.metrics);

            expect(metrics).toContain('fps');
            expect(metrics).toContain('memory');
            expect(metrics).toContain('cpu');
            expect(metrics).toContain('storage');
        });

        test('应该生成优化建议', async () => {
            // 模拟性能问题
            performance.now.mockImplementation(() => Date.now() + 100);
            performance.memory.usedJSHeapSize = 1800000;

            performanceManager.start();
            await waitForAsync();

            const report = performanceManager.generateReport();
            expect(report.recommendations.length).toBeGreaterThan(0);
        });
    });

    describe('数据管理', () => {
        test('应该限制样本数量', async () => {
            performanceManager.options.maxSamples = 5;

            for (let i = 0; i < 10; i++) {
                performanceManager.updateMetric('test', i);
            }

            const samples = performanceManager.getMetric('test');
            expect(samples).toHaveLength(5);
            expect(samples[samples.length - 1].value).toBe(9);
        });

        test('应该清理过期数据', () => {
            performanceManager.start();
            performanceManager.stop();

            expect(performanceManager.metrics.size).toBe(0);
            expect(performanceManager.listeners.size).toBe(0);
            expect(performanceManager.warningHandlers.size).toBe(0);
        });
    });
});
