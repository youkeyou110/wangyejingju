import storageManager from '../../StorageManager';
import performanceManager from '../../PerformanceManager';
import { mockChromeAPI, waitForAsync } from '../../../utils/testUtils';

describe('管理器集成测试', () => {
    let chrome;

    beforeEach(() => {
        chrome = mockChromeAPI();
        storageManager.clear();
        performanceManager.stop();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('存储与性能监控集成', () => {
        test('性能数据应该正确存储', async () => {
            // 启动性能监控
            performanceManager.start();

            // 等待数据收集
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });

            // 保存性能数据
            const metrics = performanceManager.getAllMetrics();
            await storageManager.set('performance', metrics);

            // 检查存储
            const stored = await storageManager.get('performance');
            expect(stored).toEqual(metrics);
        });

        test('存储使用应该触发性能警告', async () => {
            const warningHandler = jest.fn();
            performanceManager.addWarningHandler(warningHandler);

            // 模拟大量数据存储
            const largeData = Array(1000).fill('test').join('');
            for (let i = 0; i < 100; i++) {
                await storageManager.set(`key${i}`, largeData);
            }

            // 等待警告触发
            await act(async () => {
                jest.advanceTimersByTime(1000);
            });

            expect(warningHandler).toHaveBeenCalled();
            expect(warningHandler.mock.calls[0][0].type).toBe('storage');
        });
    });

    describe('数据压缩与性能', () => {
        test('大数据压缩应该提升性能', async () => {
            const metrics = [];
            performanceManager.addListener(data => {
                if (data.name === 'memory') {
                    metrics.push(data.value);
                }
            });

            // 存储未压缩数据
            const largeData = Array(10000).fill('test').join('');
            await storageManager.set('uncompressed', largeData, {
                compress: false
            });

            // 存储压缩数据
            await storageManager.set('compressed', largeData, {
                compress: true
            });

            // 比较内存使用
            expect(metrics[1].used).toBeLessThan(metrics[0].used);
        });
    });

    describe('错误处理与恢复', () => {
        test('存储错误应该触发自动清理', async () => {
            // 模拟存储错误
            chrome.storage.local.setItem.mockRejectedValueOnce(new Error('Storage full'));

            // 监听清理
            const cleanupSpy = jest.spyOn(storageManager, 'cleanup');

            // 尝试存储数据
            await storageManager.set('test', 'data');

            expect(cleanupSpy).toHaveBeenCalled();
        });

        test('性能问题应该触发优化建议', async () => {
            const recommendations = [];
            performanceManager.addListener(data => {
                if (data.name === 'recommendations') {
                    recommendations.push(data.value);
                }
            });

            // 模拟性能问题
            performanceManager.updateMetric('fps', 20);
            performanceManager.updateMetric('memory', { usage: 0.9 });

            // 生成报告
            const report = performanceManager.generateReport();

            expect(report.recommendations.length).toBeGreaterThan(0);
            expect(recommendations).toContain('Consider using compression');
        });
    });

    describe('状态同步', () => {
        test('多管理器状态应该保持同步', async () => {
            // 设置观察者
            const stateChanges = [];
            storageManager.onChange(state => stateChanges.push(state));
            performanceManager.addListener(data => stateChanges.push(data));

            // 触发状态变化
            await storageManager.set('test', 'data');
            performanceManager.updateMetric('fps', 30);

            // 检查状态同步
            expect(stateChanges).toHaveLength(2);
            expect(stateChanges[0].type).toBe('storage');
            expect(stateChanges[1].name).toBe('fps');
        });
    });
});
