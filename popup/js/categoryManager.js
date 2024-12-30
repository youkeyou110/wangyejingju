class CategoryManager {
    constructor(i18n, errorHandler) {
        this.i18n = i18n;
        this.errorHandler = errorHandler;
        this.categories = new Map();
        this.defaultCategories = [
            'general',
            'quote',
            'poetry',
            'custom'
        ];
    }

    async init() {
        try {
            // 加载已保存的分类
            const saved = await chrome.storage.local.get('templateCategories');
            if (saved.templateCategories) {
                this.categories = new Map(saved.templateCategories);
            } else {
                // 初始化默认分类
                this.defaultCategories.forEach(id => {
                    this.categories.set(id, {
                        id,
                        name: this.i18n.getMessage(`category_${id}`),
                        templates: []
                    });
                });
                await this.save();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'initCategories');
        }
    }

    async save() {
        try {
            await chrome.storage.local.set({
                templateCategories: Array.from(this.categories.entries())
            });
        } catch (error) {
            this.errorHandler.handleError(error, 'saveCategories');
        }
    }

    async addCategory(name) {
        try {
            const id = this.generateId(name);
            if (this.categories.has(id)) {
                throw new Error(this.i18n.getMessage('messages_error_categoryExists'));
            }

            const category = {
                id,
                name,
                templates: []
            };

            this.categories.set(id, category);
            await this.save();
            return category;
        } catch (error) {
            this.errorHandler.handleError(error, 'addCategory');
            throw error;
        }
    }

    async deleteCategory(id) {
        try {
            if (this.defaultCategories.includes(id)) {
                throw new Error(this.i18n.getMessage('messages_error_cannotDeleteDefault'));
            }

            const category = this.categories.get(id);
            if (!category) {
                throw new Error(this.i18n.getMessage('messages_error_categoryNotFound'));
            }

            // 将该分类下的模板移动到"自定义"分类
            const customCategory = this.categories.get('custom');
            customCategory.templates.push(...category.templates);

            this.categories.delete(id);
            await this.save();
        } catch (error) {
            this.errorHandler.handleError(error, 'deleteCategory');
            throw error;
        }
    }

    async addTemplateToCategory(templateId, categoryId) {
        try {
            const category = this.categories.get(categoryId);
            if (!category) {
                throw new Error(this.i18n.getMessage('messages_error_categoryNotFound'));
            }

            if (!category.templates.includes(templateId)) {
                category.templates.push(templateId);
                await this.save();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'addTemplateToCategory');
            throw error;
        }
    }

    async removeTemplateFromCategory(templateId, categoryId) {
        try {
            const category = this.categories.get(categoryId);
            if (!category) {
                throw new Error(this.i18n.getMessage('messages_error_categoryNotFound'));
            }

            const index = category.templates.indexOf(templateId);
            if (index !== -1) {
                category.templates.splice(index, 1);
                await this.save();
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'removeTemplateFromCategory');
            throw error;
        }
    }

    getCategories() {
        return Array.from(this.categories.values());
    }

    getCategoryById(id) {
        return this.categories.get(id);
    }

    generateId(name) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }
}

export default CategoryManager;
