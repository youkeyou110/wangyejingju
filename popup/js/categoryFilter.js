class CategoryFilter {
    constructor(categoryManager, templateManager, i18n) {
        this.categoryManager = categoryManager;
        this.templateManager = templateManager;
        this.i18n = i18n;
        this.container = null;
        this.currentFilter = {
            search: '',
            sort: 'name', // name, date, usage
            order: 'asc' // asc, desc
        };
    }

    init(container) {
        this.container = container;
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="category-filter">
                <div class="search-box">
                    <input type="text"
                           id="categorySearch"
                           placeholder="${this.i18n.getMessage('category_search_placeholder')}"
                           value="${this.currentFilter.search}">
                    <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                </div>
                <div class="filter-controls">
                    <select id="sortField" title="${this.i18n.getMessage('category_sort_by')}">
                        <option value="name" ${this.currentFilter.sort === 'name' ? 'selected' : ''}>
                            ${this.i18n.getMessage('category_sort_by_name')}
                        </option>
                        <option value="date" ${this.currentFilter.sort === 'date' ? 'selected' : ''}>
                            ${this.i18n.getMessage('category_sort_by_date')}
                        </option>
                        <option value="usage" ${this.currentFilter.sort === 'usage' ? 'selected' : ''}>
                            ${this.i18n.getMessage('category_sort_by_usage')}
                        </option>
                    </select>
                    <button id="sortOrder"
                            class="${this.currentFilter.order === 'desc' ? 'desc' : ''}"
                            title="${this.i18n.getMessage('category_sort_order')}">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M7 14l5-5 5 5z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 搜索输入
        const searchInput = this.container.querySelector('#categorySearch');
        searchInput.addEventListener('input', () => {
            this.currentFilter.search = searchInput.value.trim().toLowerCase();
            this.applyFilter();
        });

        // 排序字段选择
        const sortField = this.container.querySelector('#sortField');
        sortField.addEventListener('change', () => {
            this.currentFilter.sort = sortField.value;
            this.applyFilter();
        });

        // 排序顺序切换
        const sortOrder = this.container.querySelector('#sortOrder');
        sortOrder.addEventListener('click', () => {
            this.currentFilter.order = this.currentFilter.order === 'asc' ? 'desc' : 'asc';
            sortOrder.classList.toggle('desc', this.currentFilter.order === 'desc');
            this.applyFilter();
        });
    }

    async applyFilter() {
        try {
            const categories = this.categoryManager.getCategories();
            const templates = await this.templateManager.getAllTemplates();

            // 应用搜索过滤
            let filtered = categories.filter(category =>
                category.name.toLowerCase().includes(this.currentFilter.search)
            );

            // 应用排序
            filtered.sort((a, b) => {
                let compareResult = 0;
                switch (this.currentFilter.sort) {
                    case 'name':
                        compareResult = a.name.localeCompare(b.name);
                        break;
                    case 'date':
                        compareResult = (a.lastModified || 0) - (b.lastModified || 0);
                        break;
                    case 'usage':
                        const aCount = a.templates.length;
                        const bCount = b.templates.length;
                        compareResult = aCount - bCount;
                        break;
                }
                return this.currentFilter.order === 'asc' ? compareResult : -compareResult;
            });

            // 触发过滤结果事件
            this.container.dispatchEvent(new CustomEvent('filterChange', {
                detail: {
                    categories: filtered,
                    filter: { ...this.currentFilter }
                }
            }));
        } catch (error) {
            this.errorHandler.handleError(error, 'applyFilter');
        }
    }
}

export default CategoryFilter;
