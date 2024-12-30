class TemplateSelector {
    constructor(templateManager) {
        this.templateManager = templateManager;
        this.container = null;
        this.onSelect = null;
    }

    // 创建选择器界面
    createSelector() {
        const container = document.createElement('div');
        container.className = 'template-selector';

        // 添加标题
        const title = document.createElement('h2');
        title.textContent = chrome.i18n.getMessage('selectTemplate');
        container.appendChild(title);

        // 添加模板列表
        const list = document.createElement('div');
        list.className = 'template-list';

        // 渲染所有模板
        this.templateManager.templates.forEach(template => {
            list.appendChild(this.createTemplateCard(template));
        });

        container.appendChild(list);
        this.container = container;
        return container;
    }

    // 创建模板卡片
    createTemplateCard(template) {
        const card = document.createElement('div');
        card.className = 'template-card';
        card.innerHTML = `
            <div class="template-preview">
                <img src="${template.thumbnail}" alt="${template.name}">
            </div>
            <div class="template-info">
                <h3>${template.name}</h3>
                <p>${template.description}</p>
            </div>
        `;

        // 添加点击事件
        card.addEventListener('click', () => {
            if (this.onSelect) {
                this.onSelect(template);
            }
        });

        return card;
    }

    // 显示选择器
    show() {
        if (!this.container) {
            this.createSelector();
        }
        document.body.appendChild(this.container);
    }

    // 隐藏选择器
    hide() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }

    // 设置选择回调
    setOnSelect(callback) {
        this.onSelect = callback;
    }
}

export default TemplateSelector;
