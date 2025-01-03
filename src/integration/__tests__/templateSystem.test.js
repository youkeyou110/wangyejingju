import { renderWithProviders, mockChromeAPI, waitForAsync } from '../../utils/testUtils';
import TemplateManager from '../../managers/TemplateManager';
import TemplateEditor from '../../components/TemplateEditor';
import TemplateSelector from '../../components/TemplateSelector';

describe('Template System Integration', () => {
    beforeEach(() => {
        mockChromeAPI();
        TemplateManager.clearTemplates();
    });

    it('creates and selects template', async () => {
        // 渲染模板编辑器
        const { getByTestId } = renderWithProviders(<TemplateEditor />);

        // 创建新模板
        const nameInput = getByTestId('template-name');
        const contentInput = getByTestId('template-content');
        const saveButton = getByTestId('save-template');

        fireEvent.change(nameInput, { target: { value: 'Test Template' } });
        fireEvent.change(contentInput, { target: { value: 'Template Content' } });
        fireEvent.click(saveButton);

        await waitForAsync();

        // 渲染模板选择器
        const { getByText } = renderWithProviders(<TemplateSelector />);

        // 验证模板是否显示
        expect(getByText('Test Template')).toBeInTheDocument();

        // 选择模板
        fireEvent.click(getByText('Test Template'));

        await waitForAsync();

        // 验证模板是否被选中
        expect(TemplateManager.getSelectedTemplate()).toBe('Test Template');
    });

    it('updates existing template', async () => {
        // 创建初始模板
        await TemplateManager.createTemplate({
            name: 'Initial Template',
            content: 'Initial Content'
        });

        // 渲染模板编辑器
        const { getByTestId, getByText } = renderWithProviders(<TemplateEditor />);

        // 选择现有模板
        const templateSelect = getByTestId('template-select');
        fireEvent.change(templateSelect, { target: { value: 'Initial Template' } });

        // 更新模板内容
        const contentInput = getByTestId('template-content');
        const updateButton = getByTestId('update-template');

        fireEvent.change(contentInput, { target: { value: 'Updated Content' } });
        fireEvent.click(updateButton);

        await waitForAsync();

        // 验证更新是否成功
        const updatedTemplate = await TemplateManager.getTemplate('Initial Template');
        expect(updatedTemplate.content).toBe('Updated Content');
    });

    it('deletes template', async () => {
        // 创建要删除的模板
        await TemplateManager.createTemplate({
            name: 'Template to Delete',
            content: 'Delete Me'
        });

        // 渲染模板选择器
        const { getByTestId, queryByText } = renderWithProviders(<TemplateSelector />);

        // 删除模板
        const deleteButton = getByTestId('delete-template');
        fireEvent.click(deleteButton);

        // 确认删除
        const confirmButton = getByTestId('confirm-delete');
        fireEvent.click(confirmButton);

        await waitForAsync();

        // 验证模板是否被删除
        expect(queryByText('Template to Delete')).not.toBeInTheDocument();
    });

    it('handles template import/export', async () => {
        // 创建要导出的模板
        const template = {
            name: 'Export Template',
            content: 'Export Content'
        };
        await TemplateManager.createTemplate(template);

        // 导出模板
        const exportedData = await TemplateManager.exportTemplates();
        expect(exportedData).toContain('Export Template');

        // 清空现有模板
        TemplateManager.clearTemplates();

        // 导入模板
        await TemplateManager.importTemplates(exportedData);

        // 验证导入是否成功
        const importedTemplate = await TemplateManager.getTemplate('Export Template');
        expect(importedTemplate.content).toBe('Export Content');
    });
});
