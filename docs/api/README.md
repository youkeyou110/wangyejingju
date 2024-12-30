# API 文档

本文档详细说明了金句卡片生成器的核心 API 接口。

## 目录

- [管理器类](#管理器类)
  - [UIManager](#uimanager)
  - [ThemeManager](#thememanager)
  - [EditorManager](#editormanager)
  - [TemplateManager](#templatemanager)
  - [UserManager](#usermanager)
  - [SyncManager](#syncmanager)
  - [ShortcutManager](#shortcutmanager)
  - [I18nManager](#i18nmanager)
- [事件系统](#事件系统)
- [错误处理](#错误处理)

## 管理器类

### UIManager

UI 管理器负责处理所有用户界面相关的操作。

```typescript
interface UIManager {
  // 初始化 UI 管理器
  initialize(): Promise<void>;

  // 显示对话框
  showDialog(id: string, options?: DialogOptions): void;

  // 隐藏对话框
  hideDialog(id: string): void;

  // 显示通知
  showNotification(message: string, type?: NotificationType): void;

  // 切换标签页
  switchTab(tabId: string): void;
}

interface DialogOptions {
  title?: string;
  content?: string;
  buttons?: DialogButton[];
}

interface DialogButton {
  text: string;
  class?: string;
  onClick: () => void;
}

type NotificationType = 'info' | 'success' | 'warning' | 'error';
```

### ThemeManager

主题管理器负责处理主题相关的操作。

```typescript
interface ThemeManager {
  // 初始化主题管理器
  initialize(): Promise<void>;

  // 应用主题
  applyTheme(themeId: string): Promise<boolean>;

  // 注册新主题
  registerTheme(theme: Theme): boolean;

  // 获取当前主题
  getCurrentTheme(): Theme;
}

interface Theme {
  id: string;
  name: string;
  type: 'default' | 'custom';
  variables: Record<string, string>;
}
```

### EditorManager

编辑器管理器负责处理编辑器相关的操作。

```typescript
interface EditorManager {
  // 初始化编辑器管理器
  initialize(): Promise<void>;

  // 保存内容
  saveContent(): Promise<boolean>;

  // 加载内容
  loadContent(): Promise<void>;

  // 导出图片
  exportImage(options?: ExportOptions): Promise<string>;
}

interface ExportOptions {
  format?: 'png' | 'jpg';
  quality?: number;
  width?: number;
  height?: number;
}
```

### TemplateManager

模板管理器负责处理模板相关的操作。

```typescript
interface TemplateManager {
  // 初始化模板管理器
  initialize(): Promise<void>;

  // 添加模板
  addTemplate(template: Template): Promise<string>;

  // 更新模板
  updateTemplate(templateId: string, updates: Partial<Template>): Promise<boolean>;

  // 删除模板
  deleteTemplate(templateId: string): Promise<boolean>;
}

interface Template {
  id?: string;
  name: string;
  category: string;
  style: Record<string, any>;
  preview?: string;
}
```

## 事件系统

系统中的主要事件：

```typescript
interface SystemEvents {
  // 用户事件
  'userLoggedIn': { user: User };
  'userLoggedOut': void;
  'userSettingsChanged': { settings: UserSettings };

  // 主题事件
  'themeChanged': { theme: string };
  'themeToggle': void;

  // 内容事件
  'contentChanged': { content: string };
  'contentSaved': void;

  // 模板事件
  'templateAdded': { template: Template };
  'templateUpdated': { id: string, template: Template };
  'templateDeleted': { id: string };

  // 同步事件
  'syncStarted': void;
  'syncCompleted': { timestamp: string };
  'syncFailed': { error: Error };

  // 语言事件
  'localeChanged': { locale: string };
  'translationCompleted': { locale: string };
}
```

## 错误处理

错误处理系统：

```typescript
interface ErrorHandler {
  // 处理错误
  handleError(error: Error, context?: string): void;

  // 记录错误
  logError(error: Error, context?: string): void;

  // 显示错误
  showError(error: Error): void;
}

interface CustomError extends Error {
  code: string;
  context?: string;
  data?: any;
}
```

更多详细信息请参考各个模块的具体文档：

- [UI 管理器文档](./ui-manager.md)
- [主题管理器文档](./theme-manager.md)
- [编辑器管理器文档](./editor-manager.md)
- [模板管理器文档](./template-manager.md)
- [用户管理器文档](./user-manager.md)
- [同步管理器文档](./sync-manager.md)
- [快捷键管理器文档](./shortcut-manager.md)
- [国际化管理器文档](./i18n-manager.md)
