class MarketDetail {
    constructor(marketManager, templateManager, i18n) {
        this.marketManager = marketManager;
        this.templateManager = templateManager;
        this.i18n = i18n;
        this.container = null;
        this.template = null;
    }

    init(container) {
        this.container = container;
    }

    async showTemplate(templateId) {
        try {
            this.template = await this.marketManager.getTemplateDetails(templateId);
            this.render();
            this.bindEvents();
        } catch (error) {
            // 错误已由 MarketManager 处理
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="template-detail">
                <div class="detail-header">
                    <button class="back-button">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                        </svg>
                    </button>
                    <h2>${this.template.name}</h2>
                </div>

                <div class="detail-content">
                    <div class="preview-section">
                        <div class="preview-main">
                            <img src="${this.template.preview}" alt="${this.template.name}">
                        </div>
                        <div class="preview-thumbnails">
                            ${this.template.examples.map(example => `
                                <div class="thumbnail">
                                    <img src="${example}" alt="Example">
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="info-section">
                        <div class="info-header">
                            <div class="author-info">
                                <img src="${this.template.authorAvatar}" alt="${this.template.author}">
                                <span>${this.i18n.getMessage('market_template_author', {
                                    author: this.template.author
                                })}</span>
                            </div>
                            <div class="template-stats">
                                <span class="downloads">
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                    </svg>
                                    ${this.template.downloads}
                                </span>
                                <span class="rating">
                                    <svg viewBox="0 0 24 24" width="16" height="16">
                                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                                    </svg>
                                    ${this.template.rating.toFixed(1)}
                                </span>
                            </div>
                        </div>

                        <div class="template-description">
                            <h3>${this.i18n.getMessage('market_template_description')}</h3>
                            <p>${this.template.description}</p>
                        </div>

                        <div class="template-tags">
                            ${this.template.tags.map(tag => `
                                <span class="tag">${tag}</span>
                            `).join('')}
                        </div>

                        <div class="template-features">
                            <h3>${this.i18n.getMessage('market_template_features')}</h3>
                            <ul>
                                ${this.template.features.map(feature => `
                                    <li>${feature}</li>
                                `).join('')}
                            </ul>
                        </div>

                        <div class="action-buttons">
                            <button class="download-button primary">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                                </svg>
                                ${this.i18n.getMessage('buttons_use')}
                            </button>
                            <button class="favorite-button ${this.template.isFavorited ? 'active' : ''}">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                ${this.i18n.getMessage('buttons_favorite')}
                            </button>
                            <button class="share-button">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                                </svg>
                                ${this.i18n.getMessage('buttons_share')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 返回按钮
        this.container.querySelector('.back-button').addEventListener('click', () => {
            this.container.dispatchEvent(new CustomEvent('backToList'));
        });

        // 预览图切换
        const mainPreview = this.container.querySelector('.preview-main img');
        this.container.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const src = thumb.querySelector('img').src;
                mainPreview.src = src;
                this.container.querySelectorAll('.thumbnail').forEach(t =>
                    t.classList.remove('active')
                );
                thumb.classList.add('active');
            });
        });

        // 下载按钮
        this.container.querySelector('.download-button').addEventListener('click', async () => {
            try {
                const template = await this.marketManager.downloadTemplate(this.template.id);
                await this.templateManager.saveTemplate(template);
                alert(this.i18n.getMessage('market_download_success'));
            } catch (error) {
                // 错误已由 MarketManager 处理
            }
        });

        // 收藏按钮
        this.container.querySelector('.favorite-button').addEventListener('click', async (e) => {
            try {
                const button = e.currentTarget;
                const isFavorited = button.classList.contains('active');

                if (isFavorited) {
                    await this.marketManager.unfavoriteTemplate(this.template.id);
                    button.classList.remove('active');
                } else {
                    await this.marketManager.favoriteTemplate(this.template.id);
                    button.classList.add('active');
                }
            } catch (error) {
                // 错误已由 MarketManager 处理
            }
        });

        // 分享按钮
        this.container.querySelector('.share-button').addEventListener('click', () => {
            const shareUrl = `${window.location.origin}/template/${this.template.id}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert(this.i18n.getMessage('market_share_success'));
            });
        });
    }
}

export default MarketDetail;
