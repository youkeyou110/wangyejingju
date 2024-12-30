class UserManager {
    constructor(storageManager, uiManager, errorHandler) {
        this.storageManager = storageManager;
        this.uiManager = uiManager;
        this.errorHandler = errorHandler;
        this.currentUser = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            // 检查登录状态
            await this.checkLoginStatus();

            // 加载用户数据
            if (this.currentUser) {
                await this.loadUserData();
            }

            // 绑定事件监听
            this.setupEventListeners();

            this.initialized = true;
        } catch (error) {
            this.errorHandler.handleError(error, 'userInitialize');
        }
    }

    // 用户认证
    async login(credentials) {
        try {
            // 发送登录请求
            const response = await fetch('https://api.example.com/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            // 保存用户信息和令牌
            this.currentUser = {
                id: data.user.id,
                username: data.user.username,
                email: data.user.email,
                avatar: data.user.avatar,
                token: data.token
            };

            await this.storageManager.saveData('user', this.currentUser);

            // 触发登录事件
            document.dispatchEvent(new CustomEvent('userLoggedIn', {
                detail: { user: this.currentUser }
            }));

            // 更新UI
            this.updateUserUI();
            this.uiManager.showNotification('登录成功', 'success');

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'login');
            this.uiManager.showNotification('登录失败', 'error');
            throw error;
        }
    }

    async logout() {
        try {
            // 清除用户数据
            this.currentUser = null;
            await this.storageManager.removeData('user');

            // 触发登出事件
            document.dispatchEvent(new CustomEvent('userLoggedOut'));

            // 更新UI
            this.updateUserUI();
            this.uiManager.showNotification('已退出登录', 'info');

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'logout');
            throw error;
        }
    }

    // 用户数据管理
    async updateProfile(updates) {
        try {
            if (!this.currentUser) {
                throw new Error('User not logged in');
            }

            // 发送更新请求
            const response = await fetch('https://api.example.com/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                throw new Error('Profile update failed');
            }

            const data = await response.json();

            // 更新本地用户数据
            Object.assign(this.currentUser, data.user);
            await this.storageManager.saveData('user', this.currentUser);

            // 更新UI
            this.updateUserUI();
            this.uiManager.showNotification('个人资料已更新', 'success');

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'updateProfile');
            this.uiManager.showNotification('更新个人资料失败', 'error');
            throw error;
        }
    }

    async updateAvatar(file) {
        try {
            if (!this.currentUser) {
                throw new Error('User not logged in');
            }

            // 处理头像文件
            const formData = new FormData();
            formData.append('avatar', file);

            // 发送更新请求
            const response = await fetch('https://api.example.com/user/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Avatar update failed');
            }

            const data = await response.json();

            // 更新本地用户数据
            this.currentUser.avatar = data.avatarUrl;
            await this.storageManager.saveData('user', this.currentUser);

            // 更新UI
            this.updateUserUI();
            this.uiManager.showNotification('头像已更新', 'success');

            return true;
        } catch (error) {
            this.errorHandler.handleError(error, 'updateAvatar');
            this.uiManager.showNotification('更新头像失败', 'error');
            throw error;
        }
    }

    // 私有方法
    private async checkLoginStatus() {
        try {
            const savedUser = await this.storageManager.getData('user');
            if (savedUser?.token) {
                // 验证令牌
                const response = await fetch('https://api.example.com/auth/verify', {
                    headers: {
                        'Authorization': `Bearer ${savedUser.token}`
                    }
                });

                if (response.ok) {
                    this.currentUser = savedUser;
                    this.updateUserUI();
                } else {
                    // 令牌无效，清除用户数据
                    await this.logout();
                }
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'checkLoginStatus');
        }
    }

    private async loadUserData() {
        try {
            // 加载用户设置
            const settings = await this.storageManager.getData('userSettings');
            if (settings) {
                // 应用用户设置
                document.dispatchEvent(new CustomEvent('userSettingsLoaded', {
                    detail: { settings }
                }));
            }
        } catch (error) {
            this.errorHandler.handleError(error, 'loadUserData');
        }
    }

    private updateUserUI() {
        // 更新用户头像
        const avatarImg = document.querySelector('.user-avatar img');
        if (avatarImg) {
            avatarImg.src = this.currentUser?.avatar || 'images/default-avatar.png';
        }

        // 更新用户名
        const usernameEl = document.querySelector('.username');
        if (usernameEl) {
            usernameEl.textContent = this.currentUser?.username || '未登录';
        }

        // 更新加入时间
        const joinDateEl = document.querySelector('.join-date');
        if (joinDateEl && this.currentUser?.createdAt) {
            const date = new Date(this.currentUser.createdAt);
            joinDateEl.textContent = `加入于 ${date.toLocaleDateString()}`;
        }

        // 更新登录状态
        document.body.classList.toggle('logged-in', !!this.currentUser);
    }

    private setupEventListeners() {
        // 监听登录按钮
        document.getElementById('loginBtn')?.addEventListener('click', () => {
            this.uiManager.showDialog('loginDialog', {
                title: '登录',
                buttons: [
                    {
                        text: '取消',
                        class: 'secondary',
                        onClick: () => this.uiManager.hideDialog('loginDialog')
                    },
                    {
                        text: '登录',
                        class: 'primary',
                        onClick: () => this.handleLogin()
                    }
                ]
            });
        });

        // 监听退出按钮
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        // 监听头像编辑
        document.querySelector('.edit-avatar')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    this.updateAvatar(file);
                }
            };
            input.click();
        });
    }

    private async handleLogin() {
        try {
            const form = document.querySelector('#loginForm');
            if (!form) return;

            const formData = new FormData(form);
            const credentials = {
                username: formData.get('username'),
                password: formData.get('password')
            };

            await this.login(credentials);
            this.uiManager.hideDialog('loginDialog');
        } catch (error) {
            this.errorHandler.handleError(error, 'handleLogin');
        }
    }
}

export default UserManager;
