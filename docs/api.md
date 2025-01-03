# API文档

## 目录

- [管理器API](#管理器api)
  - [StorageManager](#storagemanager)
  - [PerformanceManager](#performancemanager)
  - [UpdateManager](#updatemanager)
- [工具函数API](#工具函数api)
  - [存储工具](#存储工具)
  - [样式工具](#样式工具)
  - [导出工具](#导出工具)
- [组件API](#组件api)
  - [StyleEditor](#styleeditor)
  - [LivePreview](#livepreview)
  - [HistoryPanel](#historypanel)

## 管理器API

### StorageManager

存储管理器，负责数据的存储、检索和同步。

#### 方法

```typescript
class StorageManager {
    // 设置数据
    async set(key: string, value: any, options?: StorageOptions): Promise<boolean>;

    // 获取数据
    async get(key: string, defaultValue?: any): Promise<any>;

    // 删除数据
    async remove(key: string): Promise<boolean>;

    // 清空所有数据
    async clear(): Promise<void>;

    // 查询数据
    async query(options: QueryOptions): Promise<QueryResult[]>;

    // 获取存储统计
    async getStats(): Promise<StorageStats>;
}
```

#### 示例

```javascript
import storageManager from '../managers/StorageManager';

// 存储数据
await storageManager.set('settings', {
    theme: 'dark',
    autoSave: true
});

// 获取数据
const settings = await storageManager.get('settings');

// 查询数据
const results = await storageManager.query({
    type: 'card',
    tags: ['favorite']
});
```

### PerformanceManager

性能管理器，负责监控和优化应用性能。

#### 方法

```typescript
class PerformanceManager {
    // 开始监控
    start(): void;

    // 停止监控
    stop(): void;

    // 添加监听器
    addListener(callback: (data: MetricData) => void): () => void;

    // 生成性能报告
    generateReport(): PerformanceReport;
}
```

### UpdateManager

更新管理器，负责版本更新和数据迁移。

#### 方法

```typescript
class UpdateManager {
    // 检查更新
    async checkForUpdates(): Promise<void>;

    // 数据迁移
    async migrate(fromVersion: string, toVersion: string): Promise<void>;

    // 版本回滚
    async rollback(toVersion: string): Promise<void>;
}
```

## 工具函数API

### 存储工具

```typescript
// 数据压缩
async function compressData(data: any, options?: CompressionOptions): Promise<any>;

// 数据解压
async function decompressData(data: any, type?: string): Promise<any>;

// 批量操作
async function batchOperation(
    keys: string[],
    operation: (key: string) => Promise<any>
): Promise<OperationResult>;
```

### 样式工具

```typescript
// 样式转换
function styleToCSS(style: StyleObject): string;

// 颜色转换
function convertColor(color: string, format: 'rgb' | 'hex' | 'hsl'): string;

// 单位转换
function convertUnit(value: number, from: Unit, to: Unit): number;
```

### 导出工具

```typescript
// 导出为图片
async function exportToImage(
    element: HTMLElement,
    options: ExportOptions
): Promise<Blob>;

// 导出为JSON
function exportToJSON(data: any): string;

// 批量导出
async function batchExport(
    items: ExportItem[],
    options: ExportOptions
): Promise<ExportResult[]>;
```

## 组件API

### StyleEditor

样式编辑器组件。

#### 属性

```typescript
interface StyleEditorProps {
    // 初始样式
    initialStyle?: StyleObject;
    // 样式变更回调
    onChange?: (style: StyleObject) => void;
    // 预设模板
    templates?: Template[];
    // 自定义工具栏
    toolbar?: ToolbarConfig;
}
```

#### 示例

```jsx
import StyleEditor from '../components/StyleEditor';

function App() {
    return (
        <StyleEditor
            initialStyle={{
                background: { type: 'solid', color: '#ffffff' },
                font: { family: 'Arial', size: '16px' }
            }}
            onChange={style => console.log('Style updated:', style)}
        />
    );
}
```

### LivePreview

实时预览组件。

#### 属性

```typescript
interface LivePreviewProps {
    // 预览内容
    content: string;
    // 应用的样式
    style: StyleObject;
    // 自定义渲染器
    renderer?: (content: string, style: StyleObject) => ReactNode;
}
```

### HistoryPanel

历史记录面板组件。

#### 属性

```typescript
interface HistoryPanelProps {
    // 每页显示数量
    pageSize?: number;
    // 选中项回调
    onSelect?: (item: HistoryItem) => void;
    // 删除项回调
    onDelete?: (item: HistoryItem) => void;
    // 自定义过滤器
    filter?: (item: HistoryItem) => boolean;
}
```

## 类型定义

```typescript
// 存储选项
interface StorageOptions {
    compress?: boolean;
    expires?: number;
    tags?: string[];
    type?: string;
}

// 查询选项
interface QueryOptions {
    type?: string;
    tags?: string[];
    fromDate?: number;
    toDate?: number;
    limit?: number;
}

// 性能指标数据
interface MetricData {
    name: string;
    value: any;
    timestamp: number;
}

// 性能报告
interface PerformanceReport {
    timestamp: number;
    metrics: Record<string, any>;
    warnings: Warning[];
    recommendations: string[];
}

// 导出选项
interface ExportOptions {
    format: 'png' | 'jpg' | 'webp';
    quality?: number;
    scale?: number;
    background?: boolean;
}
```

## 错误处理

所有API方法都会抛出标准化的错误：

```typescript
class APIError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: any
    ) {
        super(message);
    }
}
```

常见错误代码：

- `STORAGE_FULL`: 存储空间不足
- `INVALID_DATA`: 无效的数据格式
- `VERSION_MISMATCH`: 版本不匹配
- `NETWORK_ERROR`: 网络错误
- `PERMISSION_DENIED`: 权限不足

## 最佳实践

1. 错误处理
```javascript
try {
    await storageManager.set('key', value);
} catch (error) {
    if (error.code === 'STORAGE_FULL') {
        await storageManager.cleanup();
        await storageManager.set('key', value);
    }
}
```

2. 性能优化
```javascript
// 批量操作
const results = await batchOperation(keys, key =>
    storageManager.get(key)
);

// 使用压缩
await storageManager.set('largeData', data, {
    compress: true
});
```

3. 组件组合
```jsx
function CardEditor() {
    const [style, setStyle] = useState(initialStyle);

    return (
        <div>
            <StyleEditor
                value={style}
                onChange={setStyle}
            />
            <LivePreview
                content={content}
                style={style}
            />
        </div>
    );
}
```

## 更新日志

查看[CHANGELOG.md](../CHANGELOG.md)了解API变更历史。

## 贡献

欢迎提交问题和建议到[GitHub Issues](https://github.com/your-username/quote-card-generator/issues)。
