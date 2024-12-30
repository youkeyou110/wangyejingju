class CategoryList {
    constructor(categoryManager, templateManager, i18n) {
        this.categoryManager = categoryManager;
        this.templateManager = templateManager;
        this.i18n = i18n;
        this.container = null;
        this.selectedCategoryId = null;
    }

    init(container) {
        this.container = container;
        this.render();
        this.bindEvents();
    }

    async render() {
        const categories = this.categoryManager.getCategories();
        const templates = await this.templateManager.getAllTemplates();

        this.container.innerHTML = `
            <div class="category-list">
                <div class="category-header">
                    <h3>${this.i18n.getMessage('category_title')}</h3>
                    <button class="add-category-button" title="${this.i18n.getMessage('category_add')}">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </button>
                </div>
                <div class="category-items">
                    ${categories.map(category => `
                        <div class="category-item ${category.id === this.selectedCategoryId ? 'selected' : ''}"
                             data-category-id="${category.id}">
                            <span class="category-name">${category.name}</span>
                            <span class="template-count">${category.templates.length}</span>
                            ${!this.categoryManager.defaultCategories.includes(category.id) ? `
                                <button class="delete-category-button" title="${this.i18n.getMessage('category_delete')}">
                                    <svg viewBox="0 0 24 24" width="14" height="14">
                                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                    </svg>
                                </button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 添加分类
        this.container.querySelector('.add-category-button').addEventListener('click', async () => {
            const name = prompt(this.i18n.getMessage('category_prompt_name'));
            if (name) {
                try {
                    await this.categoryManager.addCategory(name);
                    await this.render();
                } catch (error) {
                    // 错误已由 CategoryManager 处理
                }
            }
        });

        // 选择分类
        this.container.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-category-button')) {
                    const categoryId = item.dataset.categoryId;
                    this.selectCategory(categoryId);
                }
            });
        });

        // 删除分类
        this.container.querySelectorAll('.delete-category-button').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const categoryId = button.closest('.category-item').dataset.categoryId;
                if (confirm(this.i18n.getMessage('category_prompt_delete'))) {
                    try {
                        await this.categoryManager.deleteCategory(categoryId);
                        if (this.selectedCategoryId === categoryId) {
                            this.selectedCategoryId = null;
                        }
                        await this.render();
                    } catch (error) {
                        // 错误已由 CategoryManager 处理
                    }
                }
            });
        });
    }

    selectCategory(categoryId) {
        this.selectedCategoryId = categoryId;
        this.container.querySelectorAll('.category-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.categoryId === categoryId);
        });

        // 触发分类选择事件
        this.container.dispatchEvent(new CustomEvent('categorySelected', {
            detail: { categoryId }
        }));
    }
}

export default CategoryList;
