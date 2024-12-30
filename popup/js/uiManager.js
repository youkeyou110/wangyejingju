class UIManager {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
        this.dialogs = new Map();
        this.notifications = [];
        this.initialized = false;
    }

    async initialize() {
        try {
            // 初始化对话框
            this.initializeDialogs();

            // 初始化通知系统
            this.initializeNotifications();

            // 初始化标签页
            this.initializeTabs();

            // 初始化事件监听
            this.setupEventListeners();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'uiInitialize');
        }
    }

    // 对话框管理
    showDialog(id, options = {}) {
        try {
            const dialog = this.dialogs.get(id);
            if (!dialog) {
                throw new Error(`Dialog ${id} not found`);
            }

            // 设置对话框内容
            if (options.title) {
                dialog.querySelector('.dialog-title').textContent = options.title;
            }
            if (options.content) {
                dialog.querySelector('.dialog-body').innerHTML = options.content;
            }

            // 设置按钮
            const footer = dialog.querySelector('.dialog-footer');
            footer.innerHTML = '';
            if (options.buttons) {
                options.buttons.forEach(button => {
                    const btn = document.createElement('button');
                    btn.className = `btn ${button.class || ''}`;
                    btn.textContent = button.text;
                    btn.onclick = button.onClick;
                    footer.appendChild(btn);
                });
            }

            dialog.removeAttribute('hidden');
            return dialog;
        } catch (error) {
            this.errorHandler.handleError(error, 'showDialog');
        }
    }

    hideDialog(id) {
        try {
            const dialog = this.dialogs.get(id);
            if (dialog) {
                dialog.setAttribute('hidden', '');
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'hideDialog');
        }
    }

    // 通知管理
    showNotification(message, type = 'info', duration = 3000) {
        try {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="icon-${type}"></i>
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            `;

            document.body.appendChild(notification);
            this.notifications.push(notification);

            // 自动关闭
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);

            return notification;
        } catch (error) {
            this.errorHandler.handleError(error, 'showNotification');
        }
    }

    removeNotification(notification) {
        try {
            notification.remove();
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'removeNotification');
        }
    }

    // 标签页管理
    switchTab(tabId) {
        try {
            // 更新标签按钮状态
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabId);
            });

            // 更新标签内容状态
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.toggle('active', pane.id === tabId);
            });
        } catch (error) {
            this.errorHandler.handleError(error, 'switchTab');
        }
    }

    // 私有方法
    private initializeDialogs() {
        document.querySelectorAll('.dialog').forEach(dialog => {
            const id = dialog.id;
            this.dialogs.set(id, dialog);

            // 关闭按钮事件
            dialog.querySelector('.dialog-close')?.addEventListener('click', () => {
                this.hideDialog(id);
            });

            // 点击遮罩层关闭
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    this.hideDialog(id);
                }
            });
        });
    }

    private initializeNotifications() {
        // 全局关闭按钮事件委托
        document.body.addEventListener('click', (e) => {
            const target = e.target;
            if (target.matches('.notification-close')) {
                const notification = target.closest('.notification');
                if (notification) {
                    this.removeNotification(notification);
                }
            }
        });
    }

    private initializeTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                if (tabId) {
                    this.switchTab(tabId);
                }
            });
        });
    }

    private setupEventListeners() {
        // 返回按钮
        document.getElementById('backBtn')?.addEventListener('click', () => {
            window.history.back();
        });

        // 主题切换
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const event = new CustomEvent('themeToggle');
            document.dispatchEvent(event);
        });

        // 设置按钮
        document.getElementById('settingsBtn')?.addEventListener('click', () => {
            window.location.href = 'settings.html';
        });

        // 用户按钮
        document.getElementById('userBtn')?.addEventListener('click', () => {
            window.location.href = 'user.html';
        });
    }
}

export default UIManager;
