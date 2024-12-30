import StorageManager from '@/storageManager';

describe('StorageManager', () => {
    let storageManager;
    let mockErrorHandler;

    beforeEach(() => {
        mockErrorHandler = {
            handleError: jest.fn()
        };
        storageManager = new StorageManager(mockErrorHandler);
    });

    test('saveData should store data locally', async () => {
        const key = 'test';
        const data = { foo: 'bar' };

        await storageManager.saveData(key, data);

        expect(chrome.storage.local.set).toHaveBeenCalledWith({
            [key]: data
        });
    });

    test('getData should retrieve data', async () => {
        const key = 'test';
        const data = { foo: 'bar' };
        chrome.storage.local.get.mockImplementation(() =>
            Promise.resolve({ [key]: data })
        );

        const result = await storageManager.getData(key);

        expect(result).toEqual(data);
    });
});
