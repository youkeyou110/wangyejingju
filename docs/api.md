# API 文档

## 核心组件 API

### TemplateManager

模板管理器，负责模板的增删改查和存储管理。

#### 方法

```typescript
class TemplateManager {
  // 获取所有模板（包括默认和自定义）
  async getAllTemplates(): Promise<Template[]>

  // 保存新模板
  async saveTemplate(template: Template): Promise<void>

  // 删除模板
  async deleteTemplate(templateId: string): Promise<void>

  // 应用模板样式到元素
  applyTemplate(template: Template, element: HTMLElement): void
}
```

#### 类型定义

```typescript
interface Template {
  id?: string;          // 模板ID，新建时可选
  name: string;         // 模板名称
  style: {
    background: {
      type: 'color' | 'gradient';
      value: string;
    };
    font: {
      family: string;
      size: string;
      color: string;
      weight?: string;
      lineHeight?: string;
      letterSpacing?: string;
    };
    layout: {
      padding?: string;
      textAlign?: string;
      width?: string;
      height?: string;
    };
    effects: {
      shadow?: string;
      border?: string;
    };
  };
}
```

### StyleEditor

样式编辑器，负责样式的实时编辑和预览。

#### 方法

```typescript
class StyleEditor {
  // 加载样式
  loadStyle(style: Style): void

  // 更新指定类别的样式
  updateStyle(category: string, value: any): void

  // 获取当前样式
  getCurrentStyle(): Style

  // 更新预览
  updatePreview(): void
}
```

### CardExporter

卡片导出器，负责将卡片导出为图片。

#### 方法

```typescript
class CardExporter {
  // 导出卡片为图片
  async exportCard(
    element: HTMLElement,
    options?: ExportOptions
  ): Promise<string>
}

interface ExportOptions {
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number;      // 0-1
  scale?: number;        // 导出缩放比例
}
```

## 辅助组件 API

### ErrorHandler

错误处理器，提供统一的错误处理机制。

#### 方法

```typescript
class ErrorHandler {
  // 处理错误
  handleError(error: Error, context?: string): string

  // 处理异步错误
  async handleAsyncError<T>(
    promise: Promise<T>,
    context?: string
  ): Promise<T>

  // 包装事件处理器
  wrapEventHandler(
    handler: Function,
    context?: string
  ): Function

  // 验证输入
  validateInput(
    value: any,
    rules: ValidationRules,
    context?: string
  ): boolean
}

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
}
```

### I18n

国际化工具，提供多语言支持。

#### 方法

```typescript
class I18n {
  // 初始化
  async init(): Promise<void>

  // 获取翻译文本
  getMessage(key: string, substitutions?: string[]): string

  // 切换语言
  async changeLocale(locale: string): Promise<void>

  // 更新页面翻译
  updatePageTranslations(): void

  // 获取当前语言
  getCurrentLocale(): string
}
```

## 事件

系统定义的自定义事件：

```typescript
interface CustomEvents {
  // 语言变更事件
  'localeChanged': CustomEvent<{
    locale: string;
    previousLocale: string;
  }>;

  // 模板更新事件
  'templateUpdated': CustomEvent<{
    templateId: string;
  }>;

  // 样式变更事件
  'styleChanged': CustomEvent<{
    category: string;
    value: any;
  }>;

  // 导出开始事件
  'exportStart': CustomEvent<{
    format: string;
    quality: number;
  }>;

  // 导出完成事件
  'exportComplete': CustomEvent<{
    dataUrl: string;
  }>;
}
```

## 存储结构

Chrome 存储中的数据结构：

```typescript
interface StorageData {
  // 自定义模板
  customTemplates: Template[];

  // 用户设置
  settings: {
    userLocale?: string;
    defaultFormat?: string;
    defaultQuality?: number;
  };

  // 操作日志
  logs: {
    timestamp: string;
    type: string;
    message: string;
  }[];
}
```

## 使用示例

```javascript
// 创建并保存模板
const templateManager = new TemplateManager();
const newTemplate = {
  name: '自定义模板',
  style: {
    background: {
      type: 'color',
      value: '#ffffff'
    },
    font: {
      family: 'Arial',
      size: '16px',
      color: '#000000'
    },
    layout: {
      padding: '20px'
    },
    effects: {}
  }
};
await templateManager.saveTemplate(newTemplate);

// 导出卡片
const cardExporter = new CardExporter();
const element = document.getElementById('cardPreview');
await cardExporter.exportCard(element, {
  format: 'png',
  quality: 0.9,
  scale: 2
});

// 切换语言
const i18n = new I18n();
await i18n.changeLocale('en');
```

## 消息类型

### 内容脚本消息
- `textSelected`: 文本选择事件
- `generateCard`: 生成卡片请求
- `openPopup`: 打开弹出窗口

### 设置相关消息
- `getSettings`: 获取设置
- `saveSettings`: 保存设置

## 错误处理
所有消息响应都包含以下格式：
```typescript
interface Response {
  success?: boolean;
  error?: string;
  data?: any;
}
```
