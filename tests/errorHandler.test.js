import { ErrorHandler } from '@/errorHandler';

describe('ErrorHandler', () => {
  let errorHandler;
  let mockI18n;
  let mockToast;

  beforeEach(() => {
    mockI18n = {
      getMessage: jest.fn(key => key)
    };
    mockToast = {
      error: jest.fn()
    };
    errorHandler = new ErrorHandler(mockI18n, mockToast);
  });

  describe('handleError', () => {
    it('should handle and log errors', () => {
      const error = new Error('Test error');
      const context = 'test context';
      const message = errorHandler.handleError(error, context);

      expect(mockToast.error).toHaveBeenCalled();
      expect(message).toBeDefined();
    });

    it('should handle different error types', () => {
      const testCases = [
        {
          error: new TypeError('Type error'),
          expectedMessage: 'messages.error.type'
        },
        {
          error: new ReferenceError('Reference error'),
          expectedMessage: 'messages.error.reference'
        },
        {
          error: Object.assign(new Error('Storage error'), { name: 'QuotaExceededError' }),
          expectedMessage: 'messages.error.storage'
        }
      ];

      testCases.forEach(({ error, expectedMessage }) => {
        errorHandler.handleError(error, 'test');
        expect(mockI18n.getMessage).toHaveBeenCalledWith(expectedMessage);
      });
    });
  });

  describe('handleAsyncError', () => {
    it('should handle async errors', async () => {
      const successPromise = Promise.resolve('success');
      const result = await errorHandler.handleAsyncError(successPromise, 'test');
      expect(result).toBe('success');

      const failPromise = Promise.reject(new Error('fail'));
      await expect(errorHandler.handleAsyncError(failPromise, 'test'))
        .rejects.toThrow('fail');
    });
  });

  describe('validateInput', () => {
    it('should validate required fields', () => {
      expect(errorHandler.validateInput('', { required: true })).toBe(false);
      expect(errorHandler.validateInput('value', { required: true })).toBe(true);
    });

    it('should validate string length', () => {
      expect(errorHandler.validateInput('abc', { minLength: 5 })).toBe(false);
      expect(errorHandler.validateInput('abcdef', { maxLength: 5 })).toBe(false);
      expect(errorHandler.validateInput('abc', { minLength: 2, maxLength: 5 })).toBe(true);
    });

    it('should validate patterns', () => {
      const pattern = /^[a-z]+$/;
      expect(errorHandler.validateInput('123', { pattern })).toBe(false);
      expect(errorHandler.validateInput('abc', { pattern })).toBe(true);
    });
  });
}); 