# 用户管理器 (UserManager)

用户管理器负责处理用户认证、数据管理和个人设置等功能。

## 目录

- [初始化](#初始化)
- [用户认证](#用户认证)
- [数据管理](#数据管理)
- [个人设置](#个人设置)
- [事件系统](#事件系统)
- [错误处理](#错误处理)

## 初始化

```typescript
class UserManager {
    constructor(
        storageManager: StorageManager,
        uiManager: UIManager,
        errorHandler: ErrorHandler
    );

    async initialize(): Promise<void>;
}
```

### 参数说明

- `storageManager`: 存储管理器实例
- `uiManager`: UI管理器实例
- `errorHandler`: 错误处理器实例

### 示例

```javascript
const userManager = new UserManager(storageManager, uiManager, errorHandler);
await userManager.initialize();
```

## 用户认证

### 登录

```typescript
async login(credentials: UserCredentials): Promise<boolean>;

interface UserCredentials {
    username: string;
    password: string;
    remember?: boolean;
}
```

#### 示例

```javascript
const result = await userManager.login({
    username: 'user@example.com',
    password: 'password123',
    remember: true
});
```

### 登出

```typescript
async logout(): Promise<boolean>;
```

#### 示例

```javascript
await userManager.logout();
```

### 检查登录状态

```typescript
async checkLoginStatus(): Promise<boolean>;
```

#### 示例

```javascript
const isLoggedIn = await userManager.checkLoginStatus();
```

## 数据管理

### 更新个人资料

```typescript
async updateProfile(updates: Partial<UserProfile>): Promise<boolean>;

interface UserProfile {
    username?: string;
    email?: string;
    avatar?: string;
    bio?: string;
}
```

#### 示例

```javascript
await userManager.updateProfile({
    username: 'newUsername',
    bio: '热爱生活，分享美好'
});
```

### 更新头像

```typescript
async updateAvatar(file: File): Promise<boolean>;
```

#### 示例

```javascript
const fileInput = document.querySelector('input[type="file"]');
await userManager.updateAvatar(fileInput.files[0]);
```

## 个人设置

### 保存设置

```typescript
async saveSettings(settings: UserSettings): Promise<boolean>;

interface UserSettings {
    theme?: string;
    language?: string;
    notifications?: NotificationSettings;
    privacy?: PrivacySettings;
}

interface NotificationSettings {
    email: boolean;
    push: boolean;
    desktop: boolean;
}

interface PrivacySettings {
    profileVisibility: 'public' | 'private' | 'friends';
    showActivity: boolean;
}
```

#### 示例

```javascript
await userManager.saveSettings({
    theme: 'dark',
    language: 'zh_CN',
    notifications: {
        email: true,
        push: true,
        desktop: false
    },
    privacy: {
        profileVisibility: 'public',
        showActivity: true
    }
});
```

### 加载设置

```typescript
async loadSettings(): Promise<UserSettings>;
```

#### 示例

```javascript
const settings = await userManager.loadSettings();
```

## 事件系统

### 可用事件

```typescript
interface UserEvents {
    'userLoggedIn': { user: User };
    'userLoggedOut': void;
    'profileUpdated': { profile: UserProfile };
    'settingsChanged': { settings: UserSettings };
    'avatarUpdated': { avatarUrl: string };
}
```

### 事件监听示例

```javascript
// 登录事件
document.addEventListener('userLoggedIn', (e) => {
    console.log('用户已登录:', e.detail.user);
});

// 设置变更事件
document.addEventListener('settingsChanged', (e) => {
    console.log('设置已更新:', e.detail.settings);
});
```

## 错误处理

### 错误类型

```typescript
enum UserError {
    LOGIN_FAILED = 'LOGIN_FAILED',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED = 'TOKEN_EXPIRED',
    NETWORK_ERROR = 'NETWORK_ERROR',
    PROFILE_UPDATE_FAILED = 'PROFILE_UPDATE_FAILED',
    SETTINGS_SAVE_FAILED = 'SETTINGS_SAVE_FAILED'
}
```

### 错误处理示例

```javascript
try {
    await userManager.login(credentials);
} catch (error) {
    switch (error.code) {
        case UserError.INVALID_CREDENTIALS:
            uiManager.showNotification('用户名或密码错误', 'error');
            break;
        case UserError.NETWORK_ERROR:
            uiManager.showNotification('网络连接失败', 'error');
            break;
        default:
            errorHandler.handleError(error);
    }
}
```

## 最佳实践

1. 安全性
   - 使用 HTTPS 进行所有网络请求
   - 不在本地存储明文密码
   - 定期刷新认证令牌

2. 性能
   - 缓存用户数据
   - 延迟加载非关键数据
   - 批量更新设置

3. 用户体验
   - 提供清晰的错误提示
   - 保持登录状态
   - 自动保存设置

## 注意事项

1. 令牌管理
   - 及时处理令牌过期
   - 安全存储令牌
   - 实现令牌刷新机制

2. 数据同步
   - 处理离线状态
   - 解决数据冲突
   - 保持数据一致性

3. 隐私保护
   - 遵守数据保护规定
   - 实现数据导出功能
   - 提供账号删除选项

## 相关文档

- [存储管理器](./storage-manager.md)
- [UI管理器](./ui-manager.md)
- [错误处理](./error-handler.md)
- [数据同步](./sync-manager.md)
