export class CardStorage {
    static async saveCard(card) {
        try {
            // 获取现有卡片
            const { cards = [] } = await chrome.storage.local.get('cards');

            // 添加新卡片
            const newCard = {
                id: `card-${Date.now()}`,
                ...card,
                createdAt: new Date().toISOString(),
                favorite: false
            };

            cards.unshift(newCard);

            // 保存更新后的卡片列表
            await chrome.storage.local.set({ cards });

            return newCard;
        } catch (error) {
            console.error('保存卡片失败:', error);
            throw error;
        }
    }

    static async getCards() {
        try {
            const { cards = [] } = await chrome.storage.local.get('cards');
            return cards;
        } catch (error) {
            console.error('获取卡片失败:', error);
            throw error;
        }
    }

    static async toggleFavorite(cardId) {
        try {
            const { cards = [] } = await chrome.storage.local.get('cards');
            const cardIndex = cards.findIndex(card => card.id === cardId);

            if (cardIndex !== -1) {
                cards[cardIndex].favorite = !cards[cardIndex].favorite;
                await chrome.storage.local.set({ cards });
                return cards[cardIndex];
            }

            throw new Error('卡片不存在');
        } catch (error) {
            console.error('切换收藏状态失败:', error);
            throw error;
        }
    }

    static async deleteCard(cardId) {
        try {
            const { cards = [] } = await chrome.storage.local.get('cards');
            const newCards = cards.filter(card => card.id !== cardId);
            await chrome.storage.local.set({ cards: newCards });
        } catch (error) {
            console.error('删除卡片失败:', error);
            throw error;
        }
    }
}
