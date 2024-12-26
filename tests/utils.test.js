import { Utils } from '@/utils';

describe('Utils', () => {
  describe('debounce', () => {
    jest.useFakeTimers();

    it('should debounce function calls', () => {
      const func = jest.fn();
      const debouncedFunc = Utils.debounce(func, 100);

      // 快速调用多次
      debouncedFunc();
      debouncedFunc();
      debouncedFunc();

      expect(func).not.toBeCalled();

      // 前进 100ms
      jest.advanceTimersByTime(100);
      expect(func).toBeCalledTimes(1);
    });
  });

  describe('log', () => {
    beforeEach(() => {
      // 模拟 chrome.storage.local
      chrome.storage.local.get.mockClear();
      chrome.storage.local.set.mockClear();
    });

    it('should store logs in chrome storage', () => {
      const message = 'Test log message';
      Utils.log(message, 'info');

      expect(chrome.storage.local.get).toBeCalled();
      expect(chrome.storage.local.set).toBeCalled();
    });

    it('should limit log entries to 100', async () => {
      // 创建超过100条的日志
      const logs = Array(150).fill(null).map((_, i) => ({
        timestamp: new Date().toISOString(),
        type: 'info',
        message: `Log ${i}`
      }));

      // 模拟已存在的日志
      chrome.storage.local.get.mockImplementation((key, callback) => {
        callback({ logs });
      });

      Utils.log('New log', 'info');

      // 验证存储的调用
      const setCall = chrome.storage.local.set.mock.calls[0][0];
      expect(setCall.logs.length).toBe(100);
      expect(setCall.logs[99].message).toBe('New log');
    });
  });

  describe('handleError', () => {
    it('should handle TypeError', () => {
      const error = new TypeError('test error');
      const message = Utils.handleError(error, 'test');
      expect(message).toContain('操作错误');
    });

    it('should handle ReferenceError', () => {
      const error = new ReferenceError('test error');
      const message = Utils.handleError(error, 'test');
      expect(message).toBe('程序错误，请刷新重试');
    });

    it('should handle storage quota error', () => {
      const error = new Error('QuotaExceededError');
      error.name = 'QuotaExceededError';
      const message = Utils.handleError(error, 'test');
      expect(message).toContain('存储空间不足');
    });
  });

  describe('checkCompatibility', () => {
    it('should check browser compatibility', () => {
      const result = Utils.checkCompatibility();
      expect(result).toHaveProperty('compatible');
      expect(result).toHaveProperty('issues');
    });

    it('should detect missing APIs', () => {
      // 临时删除 chrome.storage
      const originalStorage = window.chrome.storage;
      delete window.chrome.storage;

      const result = Utils.checkCompatibility();
      expect(result.compatible).toBe(false);
      expect(result.issues).toContain('Chrome Storage API 不可用');

      // 恢复 chrome.storage
      window.chrome.storage = originalStorage;
    });
  });
}); 