import ErrorHandler from '@/errorHandler';

describe('ErrorHandler', () => {
    let errorHandler;
    let mockI18n;

    beforeEach(() => {
        mockI18n = {
            getMessage: jest.fn(key => key)
        };
        errorHandler = new ErrorHandler(mockI18n);
    });

    test('handleError should log and report error', async () => {
        const error = new Error('Test error');
        const source = 'test';
        const context = { foo: 'bar' };

        await errorHandler.handleError(error, source, context);

        expect(errorHandler.errorLog).toHaveLength(1);
        expect(errorHandler.errorLog[0]).toMatchObject({
            source,
            message: error.message,
            context
        });
    });

    test('clearErrorLog should clear all errors', () => {
        errorHandler.errorLog.push({ message: 'error1' });
        errorHandler.errorLog.push({ message: 'error2' });

        errorHandler.clearErrorLog();

        expect(errorHandler.errorLog).toHaveLength(0);
    });
});
