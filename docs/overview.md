# 项目概述

## 项目背景

金句卡片生成器是一个Chrome扩展，旨在帮助用户快速将网页中的精彩文字转换成精美的分享卡片。主要用于：

- 阅读笔记整理
- 知识分享传播
- 社交媒体发布
- 个人收藏管理

## 技术栈

### 前端技术
- React 18
- TypeScript
- Ant Design
- Chrome Extension API
- Jest & Playwright

### 构建工具
- Webpack 5
- Babel
- ESLint
- Prettier

### 开发工具
- VS Code
- Chrome DevTools
- Git
- npm

## 架构设计

### 整体架构
```
src/
├── background/    # 后台脚本
│   ├── messageHandlers.js
│   ├── contextMenus.js
│   └── storageListeners.js
├── content/       # 内容脚本
│   ├── messageHandlers.js
│   ├── selectionHandlers.js
│   └── keyboardShortcuts.js
├── popup/        # 弹出窗口
│   ├── components/
│   ├── hooks/
│   └── utils/
├── components/   # 共享组件
├── managers/     # 管理器
├── utils/        # 工具函数
└── styles/       # 样式文件
```

### 核心模块

1. 文本选择模块
   - 选择处理
   - 高亮显示
   - 快捷操作

2. 模板系统
   - 模板管理
   - 样式定制
   - 预览渲染

3. 数据管理
   - 本地存储
   - 云端同步
   - 数据迁移

4. 插件系统
   - 插件加载
   - 生命周期
   - API扩展

## 开发规范

### 代码风格

1. 命名规范
   - 文件名：PascalCase（组件）、camelCase（其他）
   - 变量名：camelCase
   - 常量：UPPER_CASE
   - 类名：PascalCase
   - 接口名：IPascalCase

2. 文件组织
   - 相关文件放在同一目录
   - 按功能模块划分目录
   - 共享代码放在common目录
   - 测试文件与源文件同目录

3. 注释规范
   - 文件头部添加说明
   - 复杂逻辑需要注释
   - 导出的函数需要JSDoc
   - TODO标记待办事项

### Git工作流

1. 分支管理
   - main：主分支
   - develop：开发分支
   - feature/*：功能分支
   - bugfix/*：修复分支
   - release/*：发布分支

2. 提交规范
   - feat：新功能
   - fix：修复bug
   - docs：文档更新
   - style：代码格式
   - refactor：重构
   - test：测试
   - chore：构建

3. 版本管理
   - 遵循语义化版本
   - 更新CHANGELOG
   - 添加版本标签
   - 发布Release

### 测试规范

1. 单元测试
   - 测试覆盖率 > 80%
   - 独立测试用例
   - 模拟外部依赖
   - 测试边界条件

2. 集成测试
   - 测试模块交互
   - 测试数据流
   - 测试性能
   - 测试兼容性

3. E2E测试
   - 测试主流程
   - 测试异常流程
   - 测试用户交互
   - 测试性能指标

## 后续规划

1. 功能扩展
   - 社交分享
   - 协作功能
   - 智能推荐

2. 性能优化
   - 加载优化
   - 渲染优化
   - 存储优化

3. 用户体验
   - 多语言支持
   - 无障碍优化
   - 主题定制
