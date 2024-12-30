class BatchManager {
    constructor(templateManager, categoryManager, i18n, errorHandler) {
        this.templateManager = templateManager;
        this.categoryManager = categoryManager;
        this.i18n = i18n;
        this.errorHandler = errorHandler;
    }

    async exportTemplates(categoryId = null) {
        try {
            let templates;
            if (categoryId) {
                const category = this.categoryManager.getCategoryById(categoryId);
                if (!category) throw new Error(this.i18n.getMessage('messages_error_categoryNotFound'));
                templates = await Promise.all(
                    category.templates.map(id => this.templateManager.getTemplate(id))
                );
            } else {
                templates = await this.templateManager.getAllTemplates();
            }

            const exportData = {
                version: '1.0',
                timestamp: Date.now(),
                templates: templates.map(template => ({
                    ...template,
                    categoryId: categoryId || 'general'
                }))
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `templates_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return templates.length;
        } catch (error) {
            this.errorHandler.handleError(error, 'exportTemplates');
            throw error;
        }
    }

    async importTemplates(file, categoryId = null) {
        try {
            const content = await this.readFile(file);
            const data = JSON.parse(content);

            if (!this.validateImportData(data)) {
                throw new Error(this.i18n.getMessage('messages_error_invalidFormat'));
            }

            const results = {
                success: 0,
                failed: 0,
                total: data.templates.length
            };

            for (const template of data.templates) {
                try {
                    const savedTemplate = await this.templateManager.saveTemplate(template);
                    const targetCategoryId = categoryId || template.categoryId || 'general';
                    await this.categoryManager.addTemplateToCategory(
                        savedTemplate.id,
                        targetCategoryId
                    );
                    results.success++;
                } catch (error) {
                    results.failed++;
                    console.error('Failed to import template:', template, error);
                }
            }

            return results;
        } catch (error) {
            this.errorHandler.handleError(error, 'importTemplates');
            throw error;
        }
    }

    validateImportData(data) {
        return (
            data &&
            typeof data === 'object' &&
            Array.isArray(data.templates) &&
            data.templates.every(template =>
                template &&
                typeof template === 'object' &&
                typeof template.name === 'string' &&
                typeof template.style === 'object'
            )
        );
    }

    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = e => reject(e);
            reader.readAsText(file);
        });
    }
}

export default BatchManager;
