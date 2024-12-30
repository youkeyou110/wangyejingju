# 编辑器管理器 (EditorManager)

编辑器管理器负责处理文本编辑、样式调整和实时预览等功能。

## 目录

- [初始化](#初始化)
- [内容管理](#内容管理)
- [历史记录](#历史记录)
- [导出功能](#导出功能)
- [事件系统](#事件系统)
- [错误处理](#错误处理)

## 初始化

```typescript
class EditorManager {
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
const editorManager = new EditorManager(storageManager, uiManager, errorHandler);
await editorManager.initialize();
```

## 内容管理

### 保存内容

```typescript
async saveContent(): Promise<boolean>;

interface EditorContent {
    html: string;
    text: string;
    timestamp: string;
    style?: Record<string, string>;
}
```

#### 示例

```javascript
await editorManager.saveContent();
```

### 加载内容

```typescript
async loadContent(): Promise<void>;
```

#### 示例

```javascript
await editorManager.loadContent();
```

### 更新预览

```typescript
updatePreview(): void;
```

#### 示例

```javascript
editorManager.updatePreview();
```

## 历史记录

### 添加历史记录

```typescript
addToHistory(): void;

interface HistoryRecord {
    html: string;
    timestamp: string;
    style?: Record<string, string>;
}
```

### 撤销操作

```typescript
undo(): boolean;
```

#### 示例

```javascript
editorManager.undo();
```

### 重做操作

```typescript
redo(): boolean;
```

#### 示例

```javascript
editorManager.redo();
```

## 导出功能

### 导出图片

```typescript
async exportImage(options?: ExportOptions): Promise<string>;

interface ExportOptions {
    format?: 'png' | 'jpg';
    quality?: number;
    width?: number;
    height?: number;
    scale?: number;
}
```

#### 示例

```javascript
const imageUrl = await editorManager.exportImage({
    format: 'png',
    quality: 0.9,
    scale: 2
});
```

### 分享内容

```typescript
async shareContent(): Promise<boolean>;
```

#### 示例

```javascript
await editorManager.shareContent();
```

## 事件系统

### 可用事件

```typescript
interface EditorEvents {
    'contentChanged': { content: string };
    'contentSaved': { timestamp: string };
    'historyAdded': { record: HistoryRecord };
    'undoStateChanged': { canUndo: boolean };
    'redoStateChanged': { canRedo: boolean };
    'exportStarted': void;
    'exportCompleted': { url: string };
    'shareCompleted': { url: string };
}
```

### 事件监听示例

```javascript
// 内容变更事件
document.addEventListener('contentChanged', (e) => {
    console.log('内容已更改:', e.detail.content);
});

// 导出完成事件
document.addEventListener('exportCompleted', (e) => {
    console.log('导出完成:', e.detail.url);
});
```

## 错误处理

### 错误类型

```typescript
enum EditorError {
    SAVE_FAILED = 'SAVE_FAILED',
    LOAD_FAILED = 'LOAD_FAILED',
    EXPORT_FAILED = 'EXPORT_FAILED',
    SHARE_FAILED = 'SHARE_FAILED',
    HISTORY_ERROR = 'HISTORY_ERROR'
}
```

### 错误处理示例

```javascript
try {
    await editorManager.exportImage();
} catch (error) {
    switch (error.code) {
        case EditorError.EXPORT_FAILED:
            uiManager.showNotification('导出失败', 'error');
            break;
        default:
            errorHandler.handleError(error);
    }
}
```

## 最佳实践

1. 性能优化
   - 使用防抖处理实时预览
   - 优化历史记录存储
   - 延迟加载非必要资源

2. 用户体验
   - 自动保存功能
   - 平滑的动画过渡
   - 及时的状态反馈

3. 数据安全
   - 定期备份内容
   - 防止数据丢失
   - 验证输入数据

## 注意事项

1. 内容处理
   - 过滤不安全的HTML
   - 处理特殊字符
   - 限制内容大小

2. 历史记录
   - 限制历史记录数量
   - 优化存储结构
   - 处理冲突

3. 导出功能
   - 处理大尺寸图片
   - 优化导出质量
   - 支持多种格式

## 相关文档

- [存储管理器](./storage-manager.md)
- [UI管理器](./ui-manager.md)
- [错误处理](./error-handler.md)
- [模板管理器](./template-manager.md)
