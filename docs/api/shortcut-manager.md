# 快捷键管理器 (ShortcutManager)

快捷键管理器负责处理全局快捷键的注册、管理和响应。

## 目录

- [初始化](#初始化)
- [快捷键管理](#快捷键管理)
- [快捷键处理](#快捷键处理)
- [事件系统](#事件系统)
- [错误处理](#错误处理)

## 初始化

```typescript
class ShortcutManager {
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
const shortcutManager = new ShortcutManager(storageManager, uiManager, errorHandler);
await shortcutManager.initialize();
```

## 快捷键管理

### 注册快捷键

```typescript
registerShortcut(id: string, config: ShortcutConfig): boolean;

interface ShortcutConfig {
    key: string;
    description: string;
    category: string;
    action: () => void;
    enabled?: boolean;
}
```

#### 示例

```javascript
shortcutManager.registerShortcut('save', {
    key: 'ctrl+s',
    description: '保存',
    category: 'editor',
    action: () => {
        document.dispatchEvent(new CustomEvent('saveDocument'));
    }
});
```

### 更新快捷键

```typescript
async updateShortcut(id: string, updates: Partial<ShortcutConfig>): Promise<boolean>;
```

#### 示例

```javascript
await shortcutManager.updateShortcut('save', {
    key: 'ctrl+shift+s'
});
```

### 启用/禁用快捷键

```typescript
async toggleShortcut(id: string, enabled: boolean): Promise<boolean>;
```

#### 示例

```javascript
await shortcutManager.toggleShortcut('save', false); // 禁用保存快捷键
```

## 快捷键处理

### 处理按键事件

```typescript
handleKeyEvent(event: KeyboardEvent): boolean;
```

#### 示例

```javascript
document.addEventListener('keydown', (e) => {
    shortcutManager.handleKeyEvent(e);
});
```

### 获取快捷键

```typescript
getShortcutKey(event: KeyboardEvent): string;
```

#### 示例

```javascript
const shortcutKey = shortcutManager.getShortcutKey(event);
console.log('按下的快捷键:', shortcutKey); // 例如: "ctrl+s"
```

## 事件系统

### 可用事件

```typescript
interface ShortcutEvents {
    'shortcutRegistered': { id: string, config: ShortcutConfig };
    'shortcutUpdated': { id: string, config: ShortcutConfig };
    'shortcutToggled': { id: string, enabled: boolean };
    'shortcutTriggered': { id: string };
}
```

### 事件监听示例

```javascript
// 快捷键注册事件
document.addEventListener('shortcutRegistered', (e) => {
    console.log('新快捷键已注册:', e.detail);
});

// 快捷键触发事件
document.addEventListener('shortcutTriggered', (e) => {
    console.log('快捷键已触发:', e.detail.id);
});
```

## 错误处理

### 错误类型

```typescript
enum ShortcutError {
    INVALID_CONFIG = 'INVALID_CONFIG',
    DUPLICATE_KEY = 'DUPLICATE_KEY',
    SHORTCUT_NOT_FOUND = 'SHORTCUT_NOT_FOUND',
    REGISTRATION_FAILED = 'REGISTRATION_FAILED',
    UPDATE_FAILED = 'UPDATE_FAILED'
}
```

### 错误处理示例

```javascript
try {
    await shortcutManager.registerShortcut('invalid', {});
} catch (error) {
    switch (error.code) {
        case ShortcutError.INVALID_CONFIG:
            uiManager.showNotification('无效的快捷键配置', 'error');
            break;
        case ShortcutError.DUPLICATE_KEY:
            uiManager.showNotification('快捷键已存在', 'error');
            break;
        default:
            errorHandler.handleError(error);
    }
}
```

## 最佳实践

1. 快捷键设计
   - 使用直观的组合键
   - 避免冲突的快捷键
   - 提供快捷键提示

2. 性能优化
   - 使用事件委托
   - 优化事件处理
   - 缓存快捷键映射

3. 用户体验
   - 支持自定义快捷键
   - 提供快捷键列表
   - 显示操作反馈

## 注意事项

1. 快捷键冲突
   - 检测系统快捷键
   - 处理浏览器默认行为
   - 解决快捷键冲突

2. 跨平台兼容
   - 处理不同操作系统
   - 适配不同键盘布局
   - 提供替代快捷键

3. 可访问性
   - 支持辅助功能
   - 提供替代操作方式
   - 考虑特殊需求用户

## 相关文档

- [存储管理器](./storage-manager.md)
- [UI管理器](./ui-manager.md)
- [错误处理](./error-handler.md)
- [快捷键配置指南](./shortcut-config.md)
