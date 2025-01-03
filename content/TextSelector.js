class TextSelector {
    constructor() {
        this.selections = new Map(); // 存储多个选择
        this.activeSelection = null; // 当前活动的选择
        this.init();
    }

    init() {
        // 注册快捷键
        this.registerShortcuts();

        // 监听选择事件
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // 监听滚动以更新高亮位置
        window.addEventListener('scroll', this.updateHighlights.bind(this));
        window.addEventListener('resize', this.updateHighlights.bind(this));
    }

    registerShortcuts() {
        // 注册快捷键命令
        chrome.commands.onCommand.addListener((command) => {
            if (command === 'create-card') {
                this.handleCreateCard();
            }
        });
    }

    handleMouseUp(event) {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text) {
            this.handleTextSelection(selection, event);
        }
    }

    handleKeyDown(event) {
        // Ctrl/Cmd + Shift + Q
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'Q') {
            event.preventDefault();
            this.handleCreateCard();
        }

        // Esc 清除选择
        if (event.key === 'Escape') {
            this.clearSelections();
        }
    }

    handleTextSelection(selection, event) {
        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();

        if (!text) return;

        // 创建唯一ID
        const id = `selection-${Date.now()}`;

        // 保存选择信息
        this.selections.set(id, {
            text,
            range: range.cloneRange(),
            timestamp: Date.now(),
            source: {
                url: window.location.href,
                title: document.title
            }
        });

        // 高亮显示
        this.highlightSelection(id, range);

        // 设置为当前活动选择
        this.activeSelection = id;

        // 通知background script
        this.notifyBackgroundScript(id);
    }

    highlightSelection(id, range) {
        const highlight = document.createElement('span');
        highlight.className = 'quote-card-highlight';
        highlight.dataset.selectionId = id;

        // 添加交互效果
        highlight.addEventListener('click', () => this.activateSelection(id));
        highlight.addEventListener('dblclick', () => this.removeSelection(id));

        try {
            range.surroundContents(highlight);
        } catch (error) {
            console.warn('Failed to highlight selection:', error);
        }
    }

    activateSelection(id) {
        // 移除其他高亮的活动状态
        document.querySelectorAll('.quote-card-highlight.active')
            .forEach(el => el.classList.remove('active'));

        // 添加当前高亮的活动状态
        const highlight = document.querySelector(`[data-selection-id="${id}"]`);
        if (highlight) {
            highlight.classList.add('active');
            this.activeSelection = id;
        }
    }

    removeSelection(id) {
        // 移除高亮元素
        const highlight = document.querySelector(`[data-selection-id="${id}"]`);
        if (highlight) {
            const parent = highlight.parentNode;
            while (highlight.firstChild) {
                parent.insertBefore(highlight.firstChild, highlight);
            }
            parent.removeChild(highlight);
        }

        // 从集合中移除
        this.selections.delete(id);

        // 如果是当前活动选择，清除状态
        if (this.activeSelection === id) {
            this.activeSelection = null;
        }
    }

    clearSelections() {
        // 移除所有高亮
        document.querySelectorAll('.quote-card-highlight').forEach(el => {
            this.removeSelection(el.dataset.selectionId);
        });

        // 清空选择集合
        this.selections.clear();
        this.activeSelection = null;
    }

    updateHighlights() {
        // 在滚动或调整窗口大小时更新高亮位置
        requestAnimationFrame(() => {
            document.querySelectorAll('.quote-card-highlight').forEach(highlight => {
                const id = highlight.dataset.selectionId;
                const selection = this.selections.get(id);

                if (selection) {
                    // 重新计算位置
                    const rect = highlight.getBoundingClientRect();
                    highlight.style.transform = `translate(${window.scrollX}px, ${window.scrollY}px)`;
                }
            });
        });
    }

    handleCreateCard() {
        const selection = this.activeSelection
            ? this.selections.get(this.activeSelection)
            : null;

        if (selection) {
            chrome.runtime.sendMessage({
                type: 'CREATE_CARD',
                data: {
                    text: selection.text,
                    source: selection.source
                }
            });
        }
    }

    notifyBackgroundScript(id) {
        const selection = this.selections.get(id);
        if (selection) {
            chrome.runtime.sendMessage({
                type: 'TEXT_SELECTED',
                data: {
                    id,
                    text: selection.text,
                    source: selection.source
                }
            });
        }
    }

    // 获取所有选择
    getSelections() {
        return Array.from(this.selections.entries()).map(([id, selection]) => ({
            id,
            ...selection
        }));
    }

    // 获取当前活动选择
    getActiveSelection() {
        return this.activeSelection
            ? this.selections.get(this.activeSelection)
            : null;
    }
}

export default TextSelector;
