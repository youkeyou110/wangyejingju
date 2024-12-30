class MarketList {
    constructor(marketManager, templateManager, i18n) {
        this.marketManager = marketManager;
        this.templateManager = templateManager;
        this.i18n = i18n;
        this.container = null;
        this.currentPage = 1;
        this.filters = {
            category: '',
            tag: '',
            sort: 'popular'
        };
    }

    init(container) {
        this.container = container;
        this.render();
        this.bindEvents();
        this.loadTemplates();
    }

    async render() {
        this.container.innerHTML = `
            <div class="market-container">
                <div class="market-header">
                    <h2>${this.i18n.getMessage('market_title')}</h2>
                    <div class="market-search">
                        <input type="text"
                               id="marketSearch"
                               placeholder="${this.i18n.getMessage('market_search_placeholder')}">
                        <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16">
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                        </svg>
                    </div>
                </div>
                <div class="market-filters">
                    <select id="categoryFilter">
                        <option value="">${this.i18n.getMessage('market_filter_category')}</option>
                    </select>
                    <select id="tagFilter">
                        <option value="">${this.i18n.getMessage('market_filter_tag')}</option>
                    </select>
                    <select id="sortFilter">
                        <option value="popular">${this.i18n.getMessage('market_sort_popular')}</option>
                        <option value="new">${this.i18n.getMessage('market_sort_new')}</option>
                        <option value="downloads">${this.i18n.getMessage('market_sort_downloads')}</option>
                    </select>
                </div>
                <div class="market-grid"></div>
                <div class="market-pagination"></div>
            </div>
        `;

        // 加载过滤器选项
        await this.loadFilterOptions();
    }

    async loadFilterOptions() {
        try {
            const [categories, tags] = await Promise.all([
                this.marketManager.getCategories(),
                this.marketManager.getTags()
            ]);

            const categorySelect = this.container.querySelector('#categoryFilter');
            const tagSelect = this.container.querySelector('#tagFilter');

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });

            tags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.id;
                option.textContent = tag.name;
                tagSelect.appendChild(option);
            });
        } catch (error) {
            // 错误已由 MarketManager 处理
        }
    }

    async loadTemplates() {
        try {
            const result = await this.marketManager.fetchTemplates(this.currentPage, this.filters);
            this.renderTemplates(result.templates);
            this.renderPagination(result);
        } catch (error) {
            // 错误已由 MarketManager 处理
        }
    }

    renderTemplates(templates) {
        const grid = this.container.querySelector('.market-grid');
        grid.innerHTML = templates.map(template => `
            <div class="template-card" data-id="${template.id}">
                <div class="template-preview">
                    <img src="${template.preview}" alt="${template.name}">
                </div>
                <div class="template-info">
                    <h3>${template.name}</h3>
                    <div class="template-meta">
                        <span>${this.i18n.getMessage('market_template_downloads', {
                            count: template.downloads
                        })}</span>
                        <span>${this.i18n.getMessage('market_template_author', {
                            author: template.author
                        })}</span>
                    </div>
                    <button class="download-button">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                        </svg>
                        ${this.i18n.getMessage('buttons_use')}
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderPagination(result) {
        const pagination = this.container.querySelector('.market-pagination');
        const pages = [];

        // 首页
        if (result.currentPage > 1) {
            pages.push('<button class="page-first">1</button>');
        }

        // 省略号
        if (result.currentPage > 3) {
            pages.push('<span class="page-ellipsis">...</span>');
        }

        // 当前页附近的页码
        for (let i = Math.max(2, result.currentPage - 1);
             i <= Math.min(result.totalPages - 1, result.currentPage + 1);
             i++) {
            pages.push(`<button class="page-number${i === result.currentPage ? ' active' : ''}">${i}</button>`);
        }

        // 省略号
        if (result.currentPage < result.totalPages - 2) {
            pages.push('<span class="page-ellipsis">...</span>');
        }

        // 末页
        if (result.currentPage < result.totalPages) {
            pages.push(`<button class="page-last">${result.totalPages}</button>`);
        }

        pagination.innerHTML = pages.join('');
    }

    bindEvents() {
        // 搜索
        const searchInput = this.container.querySelector('#marketSearch');
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const query = searchInput.value.trim();
                if (query) {
                    const results = await this.marketManager.searchTemplates(query, this.filters);
                    this.renderTemplates(results.templates);
                } else {
                    this.loadTemplates();
                }
            }, 300);
        });

        // 过滤器
        ['categoryFilter', 'tagFilter', 'sortFilter'].forEach(id => {
            this.container.querySelector(`#${id}`).addEventListener('change', (e) => {
                const key = id.replace('Filter', '');
                this.filters[key] = e.target.value;
                this.currentPage = 1;
                this.loadTemplates();
            });
        });

        // 分页
        this.container.querySelector('.market-pagination').addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                this.currentPage = parseInt(button.textContent);
                this.loadTemplates();
                window.scrollTo(0, 0);
            }
        });

        // 下载模板
        this.container.querySelector('.market-grid').addEventListener('click', async (e) => {
            const downloadButton = e.target.closest('.download-button');
            if (downloadButton) {
                const card = downloadButton.closest('.template-card');
                const templateId = card.dataset.id;

                try {
                    const template = await this.marketManager.downloadTemplate(templateId);
                    await this.templateManager.saveTemplate(template);
                    alert(this.i18n.getMessage('market_download_success'));
                } catch (error) {
                    // 错误已由 MarketManager 处理
                }
            }
        });
    }
}

export default MarketList;
