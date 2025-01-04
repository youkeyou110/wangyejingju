export class HistoryViewer {
    constructor(container) {
        this.container = container;
        this.cards = [];
        this.initializeUI();
    }

    initializeUI() {
        this.container.innerHTML = `
            <div class="history-viewer">
                <div class="history-header">
                    <h3>历史记录</h3>
                    <div class="history-filters">
                        <button id="show-all" class="btn active">全部</button>
                        <button id="show-favorites" class="btn">收藏</button>
                    </div>
                </div>
                <div class="history-list"></div>
            </div>
        `;

        this.bindEvents();
        this.loadCards();
    }

    async loadCards(showFavoritesOnly = false) {
        try {
            this.cards = await CardStorage.getCards();
            if (showFavoritesOnly) {
                this.cards = this.cards.filter(card => card.favorite);
            }
            this.renderCards();
        } catch (error) {
            console.error('加载卡片失败:', error);
        }
    }

    renderCards() {
        const listContainer = this.container.querySelector('.history-list');
        listContainer.innerHTML = this.cards.length ? '' : '<div class="no-cards">暂无记录</div>';

        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'history-card';
            cardElement.innerHTML = `
                <div class="card-preview" style="${this.getStyleString(card.style)}">
                    ${card.text}
                </div>
                <div class="card-info">
                    <span class="card-date">${this.formatDate(card.createdAt)}</span>
                    <div class="card-actions">
                        <button class="btn-icon favorite ${card.favorite ? 'active' : ''}" data-card-id="${card.id}">
                            <span class="icon">★</span>
                        </button>
                        <button class="btn-icon delete" data-card-id="${card.id}">
                            <span class="icon">🗑</span>
                        </button>
                    </div>
                </div>
            `;
            listContainer.appendChild(cardElement);
        });
    }

    bindEvents() {
        const showAllBtn = this.container.querySelector('#show-all');
        const showFavoritesBtn = this.container.querySelector('#show-favorites');

        showAllBtn.addEventListener('click', () => {
            showAllBtn.classList.add('active');
            showFavoritesBtn.classList.remove('active');
            this.loadCards(false);
        });

        showFavoritesBtn.addEventListener('click', () => {
            showFavoritesBtn.classList.add('active');
            showAllBtn.classList.remove('active');
            this.loadCards(true);
        });

        this.container.addEventListener('click', async (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const cardId = button.dataset.cardId;
            if (!cardId) return;

            if (button.classList.contains('favorite')) {
                try {
                    await CardStorage.toggleFavorite(cardId);
                    this.loadCards(showFavoritesBtn.classList.contains('active'));
                } catch (error) {
                    console.error('切换收藏状态失败:', error);
                }
            } else if (button.classList.contains('delete')) {
                if (confirm('确定要删除这张卡片吗？')) {
                    try {
                        await CardStorage.deleteCard(cardId);
                        this.loadCards(showFavoritesBtn.classList.contains('active'));
                    } catch (error) {
                        console.error('删除卡片失败:', error);
                    }
                }
            }
        });
    }

    getStyleString(style) {
        return Object.entries(style)
            .map(([key, value]) => `${key}: ${value}`)
            .join(';');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
