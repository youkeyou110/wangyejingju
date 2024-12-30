import TemplateManager from '@/templateManager';

describe('TemplateManager', () => {
    let templateManager;
    let mockErrorHandler;
    let mockStorageManager;
    let mockI18n;

    beforeEach(() => {
        mockErrorHandler = {
            handleError: jest.fn()
        };
        mockStorageManager = {
            saveData: jest.fn(),
            getData: jest.fn()
        };
        mockI18n = {
            getMessage: jest.fn(key => key)
        };
        templateManager = new TemplateManager(mockErrorHandler, mockStorageManager, mockI18n);
    });

    test('getTemplate should return template by id', async () => {
        const templateId = 'test-template';
        const template = {
            id: templateId,
            name: 'Test Template',
            content: '<div>Test</div>'
        };
        mockStorageManager.getData.mockResolvedValue({ [templateId]: template });

        const result = await templateManager.getTemplate(templateId);

        expect(result).toEqual(template);
    });

    test('saveTemplate should store template', async () => {
        const template = {
            id: 'test-template',
            name: 'Test Template',
            content: '<div>Test</div>'
        };

        await templateManager.saveTemplate(template);

        expect(mockStorageManager.saveData).toHaveBeenCalledWith(
            'templates',
            expect.objectContaining({
                [template.id]: template
            })
        );
    });

    test('deleteTemplate should remove template', async () => {
        const templateId = 'test-template';
        const templates = {
            [templateId]: {
                id: templateId,
                name: 'Test Template'
            }
        };
        mockStorageManager.getData.mockResolvedValue(templates);

        await templateManager.deleteTemplate(templateId);

        expect(mockStorageManager.saveData).toHaveBeenCalledWith(
            'templates',
            expect.not.objectContaining({
                [templateId]: expect.anything()
            })
        );
    });

    test('exportTemplate should return template data', async () => {
        const templateId = 'test-template';
        const template = {
            id: templateId,
            name: 'Test Template',
            content: '<div>Test</div>'
        };
        mockStorageManager.getData.mockResolvedValue({ [templateId]: template });

        const result = await templateManager.exportTemplate(templateId);

        expect(result).toEqual({
            template,
            version: expect.any(String),
            exportDate: expect.any(String)
        });
    });

    test('importTemplate should validate and store template', async () => {
        const template = {
            id: 'test-template',
            name: 'Test Template',
            content: '<div>Test</div>'
        };
        const importData = {
            template,
            version: '1.0.0',
            exportDate: new Date().toISOString()
        };

        await templateManager.importTemplate(importData);

        expect(mockStorageManager.saveData).toHaveBeenCalledWith(
            'templates',
            expect.objectContaining({
                [template.id]: template
            })
        );
    });

    test('importTemplate should reject invalid data', async () => {
        const invalidData = {
            template: {
                id: 'test'
                // missing required fields
            }
        };

        await expect(templateManager.importTemplate(invalidData))
            .rejects.toThrow();
    });
});
