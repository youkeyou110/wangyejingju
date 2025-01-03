import storageManager from '../StorageManager';
import { mockChromeAPI, waitForAsync } from '../../utils/testUtils';

describe('StorageManager', () => {
    let chrome;

    beforeEach(() => {
        chrome = mockChromeAPI();
        storageManager.clear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('基本操作', () => {
        test('应该能够设置和获取数据', async () => {
            const key = 'testKey';
            const value = { foo: 'bar' };

            await storageManager.set(key, value);
            const result = await storageManager.get(key);

            expect(result).toEqual(value);
            expect(chrome.storage.local.setItem).toHaveBeenCalled();
        });

        test('应该能够删除数据', async () => {
            const key = 'testKey';
            const value = { foo: 'bar' };

            await storageManager.set(key, value);
            await storageManager.remove(key);
            const result = await storageManager.get(key);

            expect(result).toBeNull();
            expect(chrome.storage.local.removeItem).toHaveBeenCalled();
        });

        test('应该能够清空所有数据', async () => {
            await storageManager.set('key1', 'value1');
            await storageManager.set('key2', 'value2');

            await storageManager.clear();
            const result1 = await storageManager.get('key1');
            const result2 = await storageManager.get('key2');

            expect(result1).toBeNull();
            expect(result2).toBeNull();
            expect(chrome.storage.local.clear).toHaveBeenCalled();
        });
    });

    describe('数据压缩', () => {
        test('大数据应该被压缩', async () => {
            const key = 'largeData';
            const value = Array(1000).fill('test').join('');

            await storageManager.set(key, value);
            const result = await storageManager.get(key);

            expect(result).toEqual(value);
            const stored = chrome.storage.local.getAllItems()[storageManager.getFullKey(key)];
            expect(stored.length).toBeLessThan(value.length);
        });

        test('小数据不应该被压缩', async () => {
            const key = 'smallData';
            const value = 'test';

            await storageManager.set(key, value);
            const result = await storageManager.get(key);

            expect(result).toEqual(value);
            const stored = chrome.storage.local.getAllItems()[storageManager.getFullKey(key)];
            expect(stored).toEqual(JSON.stringify(value));
        });
    });

    describe('索引管理', () => {
        test('应该维护正确的索引', async () => {
            await storageManager.set('key1', 'value1', { type: 'test' });
            await storageManager.set('key2', 'value2', { type: 'test' });

            const results = await storageManager.query({ type: 'test' });
            expect(results).toHaveLength(2);
            expect(results[0].metadata.type).toBe('test');
        });

        test('应该支持按标签查询', async () => {
            await storageManager.set('key1', 'value1', { tags: ['tag1'] });
            await storageManager.set('key2', 'value2', { tags: ['tag2'] });

            const results = await storageManager.query({ tags: ['tag1'] });
            expect(results).toHaveLength(1);
            expect(results[0].key).toBe('key1');
        });
    });

    describe('错误处理', () => {
        test('设置无效数据应该失败', async () => {
            const key = 'invalidData';
            const value = { toJSON: () => { throw new Error(); } };

            const result = await storageManager.set(key, value);
            expect(result).toBe(false);
        });

        test('获取不存在的数据应该返回默认值', async () => {
            const result = await storageManager.get('nonexistent', 'default');
            expect(result).toBe('default');
        });
    });

    describe('性能监控', () => {
        test('应该记录存储统计信息', async () => {
            await storageManager.set('key1', 'value1');
            await storageManager.set('key2', 'value2');

            const stats = await storageManager.getStats();
            expect(stats.totalItems).toBe(2);
            expect(stats.totalSize).toBeGreaterThan(0);
        });

        test('应该执行自动清理', async () => {
            const oldData = Array(100).fill('old').join('');
            await storageManager.set('old', oldData, { timestamp: Date.now() - 31 * 24 * 60 * 60 * 1000 });

            await storageManager.cleanup();
            const result = await storageManager.get('old');
            expect(result).toBeNull();
        });
    });
});
