# 主题管理器 (ThemeManager)

主题管理器负责处理主题的加载、切换和自定义等功能。

## 目录

- [初始化](#初始化)
- [主题管理](#主题管理)
- [主题应用](#主题应用)
- [事件系统](#事件系统)
- [错误处理](#错误处理)

## 初始化

```typescript
class ThemeManager {
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
const themeManager = new ThemeManager(storageManager, uiManager, errorHandler);
await themeManager.initialize();
```

## 主题管理

### 注册主题

```typescript
registerTheme(theme: Theme): boolean;

interface Theme {
    id: string;
    name: string;
    type: 'default' | 'custom';
    variables: ThemeVariables;
    description?: string;
    author?: string;
    version?: string;
}

interface ThemeVariables {
    '--primary-color': string;
    '--secondary-color': string;
    '--background-color': string;
    '--text-color': string;
    '--border-color': string;
    '--hover-color': string;
    [key: string]: string;
}
```

#### 示例

```javascript
themeManager.registerTheme({
    id: 'dark',
    name: '深色主题',
    type: 'default',
    variables: {
        '--primary-color': '#61dafb',
        '--secondary-color': '#282c34',
        '--background-color': '#1a1a1a',
        '--text-color': '#ffffff',
        '--border-color': '#404040',
        '--hover-color': '#363b44'
    }
});
```

### 创建自定义主题

```typescript
async createCustomTheme(theme: Partial<Theme>): Promise<string>;
```

#### 示例

```javascript
const themeId = await themeManager.createCustomTheme({
    name: '自定义主题',
    variables: {
        '--primary-color': '#ff6b6b',
        '--background-color': '#f8f9fa'
    }
});
```

### 更新主题

```typescript
async updateTheme(themeId: string, updates: Partial<Theme>): Promise<boolean>;
```

#### 示例

```javascript
await themeManager.updateTheme('custom-theme', {
    variables: {
        '--primary-color': '#4a90e2'
    }
});
```

## 主题应用

### 应用主题

```typescript
async applyTheme(themeId: string): Promise<boolean>;
```

#### 示例

```javascript
await themeManager.applyTheme('dark');
```

### 获取当前主题

```typescript
getCurrentTheme(): Theme;
```

#### 示例

```javascript
const currentTheme = themeManager.getCurrentTheme();
console.log('当前主题:', currentTheme.name);
```

### 切换主题

```typescript
async toggleTheme(): Promise<boolean>;
```

#### 示例

```javascript
await themeManager.toggleTheme(); // 在明暗主题间切换
```

## 事件系统

### 可用事件

```typescript
interface ThemeEvents {
    'themeChanged': { theme: Theme };
    'themeRegistered': { theme: Theme };
    'themeUpdated': { id: string, theme: Theme };
    'themeRemoved': { id: string };
}
```

### 事件监听示例

```javascript
// 主题变更事件
document.addEventListener('themeChanged', (e) => {
    console.log('主题已切换:', e.detail.theme);
});

// 主题注册事件
document.addEventListener('themeRegistered', (e) => {
    console.log('新主题已注册:', e.detail.theme);
});
```

## 错误处理

### 错误类型

```typescript
enum ThemeError {
    THEME_NOT_FOUND = 'THEME_NOT_FOUND',
    INVALID_THEME = 'INVALID_THEME',
    THEME_APPLY_FAILED = 'THEME_APPLY_FAILED',
    THEME_UPDATE_FAILED = 'THEME_UPDATE_FAILED',
    THEME_SAVE_FAILED = 'THEME_SAVE_FAILED'
}
```

### 错误处理示例

```javascript
try {
    await themeManager.applyTheme('non-existent-theme');
} catch (error) {
    switch (error.code) {
        case ThemeError.THEME_NOT_FOUND:
            uiManager.showNotification('主题不存在', 'error');
            break;
        case ThemeError.THEME_APPLY_FAILED:
            uiManager.showNotification('主题应用失败', 'error');
            break;
        default:
            errorHandler.handleError(error);
    }
}
```

## 最佳实践

1. 主题设计
   - 使用语义化的变量名
   - 保持颜色一致性
   - 考虑可访问性

2. 性能优化
   - 缓存主题数据
   - 延迟加载非活动主题
   - 批量应用样式变更

3. 用户体验
   - 提供主题预览
   - 支持平滑过渡
   - 记住用户选择

## 注意事项

1. 主题兼容性
   - 处理未定义的变量
   - 提供默认值
   - 验证主题完整性

2. 样式隔离
   - 避免样式冲突
   - 使用作用域前缀
   - 管理优先级

3. 主题迁移
   - 版本控制
   - 向后兼容
   - 迁移方案

## 相关文档

- [存储管理器](./storage-manager.md)
- [UI管理器](./ui-manager.md)
- [错误处理](./error-handler.md)
- [CSS变量指南](./css-variables.md)
