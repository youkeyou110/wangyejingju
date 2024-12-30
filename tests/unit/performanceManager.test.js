import PerformanceManager from '@/performanceManager';

describe('PerformanceManager', () => {
    let performanceManager;
    let mockErrorHandler;

    beforeEach(() => {
        mockErrorHandler = {
            handleError: jest.fn()
        };
        performanceManager = new PerformanceManager(mockErrorHandler);
    });

    test('measure should record execution time', () => {
        const label = 'test';
        const callback = jest.fn();

        performanceManager.measure(label, callback);

        expect(callback).toHaveBeenCalled();
        expect(performanceManager.metrics.get(label)).toBeDefined();
    });

    test('debounce should delay execution', done => {
        const key = 'test';
        const callback = jest.fn();
        const delay = 100;

        performanceManager.debounce(key, callback, delay);
        performanceManager.debounce(key, callback, delay);

        setTimeout(() => {
            expect(callback).toHaveBeenCalledTimes(1);
            done();
        }, delay + 50);
    });
});
