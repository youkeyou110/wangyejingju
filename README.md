# 金句卡片生成器 Chrome 扩展

![开发状态](https://img.shields.io/badge/状态-开发中-yellow)
![版本](https://img.shields.io/badge/版本-0.1.0-blue)
![测试覆盖率](https://img.shields.io/badge/测试覆盖率-85%25-green)
![许可证](https://img.shields.io/badge/许可证-MIT-green)

一个简单易用的 Chrome 扩展，用于生成精美的金句卡片。

## ✨ 功能特点

- 🎯 快速选择网页文字
  * 右键菜单选择
  * 快捷键支持 (Ctrl+Shift+Q)
  * 多段文字选择

- 🎨 多样化卡片模板
  * 简约白、优雅灰、现代蓝等多种风格
  * 支持自定义模板
  * 模板导入/导出

- ✨ 丰富的样式定制
  * 背景设置（纯色/渐变）
  * 字体控制（字体/大小/颜色/间距）
  * 布局调整（对齐/边距/尺寸）
  * 特效设置（阴影/边框）

- 💾 便捷的导出功能
  * 多种图片格式（PNG/JPEG/WEBP）
  * 图片质量控制
  * 导出尺寸调整

- 🌍 多语言支持
  * 中文
  * English
  * 日本語

## 🚀 快速开始

### 安装

1. 从 Chrome 网上应用店安装（即将上线）
2. 下载发布包手动安装：
   - 下载最新的 [发布包](https://github.com/your-repo/releases)
   - 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
   - 开启开发者模式
   - 将下载的 zip 文件拖入浏览器

### 使用方法

1. 选择文本：
   - 在网页中选中文本
   - 右键点击，选择"生成金句卡片"
   - 或使用快捷键 Ctrl+Shift+Q

2. 编辑卡片：
   - 选择模板
   - 调整样式
   - 预览效果

3. 导出图片：
   - 点击"导出图片"
   - 选择格式和质量
   - 保存到本地

## 🔧 开发指南

### 环境要求

- Node.js >= 14
- npm >= 6

### 安装依赖
bash
npm install

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 查看测试覆盖率
npm run test:coverage
```

### 项目结构

```
.
├── src/
│   ├── popup/          # 弹出窗口相关
│   ├── background/     # 后台脚本
│   ├── content/        # 内容脚本
│   └── _locales/      # 国际化文件
├── tests/             # 测试文件
├── dist/              # 构建输出
└── docs/              # 文档
```

## 📝 文档

- [用户指南](docs/user-guide.md)
- [开发文档](docs/development.md)
- [API 文档](docs/api.md)
- [贡献指南](CONTRIBUTING.md)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目基于 MIT 协议开源，详见 [LICENSE](LICENSE) 文件。

## 🐛 问题反馈

如果你发现了 bug 或有新功能建议，欢迎提交 issue！

## 📊 性能指标

- 模板加载时间: < 100ms
- 样式更新响应: < 16ms
- 导出操作耗时: < 1s
- 内存占用: < 50MB
# 开发文档

## 架构概述

本扩展采用模块化架构，主要包含以下组件：

### 核心组件

1. TemplateManager
   - 模板的 CRUD 操作
   - 本地存储管理
   - 模板验证

2. StyleEditor
   - 样式编辑器
   - 实时预览
   - 样式验证

3. CardExporter
   - 图片导出
   - 格式转换
   - 质量控制

### 辅助组件

1. ErrorHandler
   - 统一错误处理
   - 错误恢复
   - 用户提示

2. I18n
   - 多语言支持
   - 动态语言切换
   - 文本管理

## 开发规范

### 代码风格

- 使用 ES6+ 语法
- 遵循 ESLint 配置
- 使用 JSDoc 注释

### 测试要求

- 单元测试覆盖率 > 80%
- 包含集成测试
- 包含性能测试

### 性能标准

- 首次加载时间 < 2s
- 操作响应时间 < 100ms
- 内存占用 < 50MB

## 开发流程

1. 功能开发
   ```bash
   # 创建功能分支
   git checkout -b feature/new-feature

   # 启动开发服务器
   npm run dev
   ```

2. 测试
   ```bash
   # 运行测试
   npm test

   # 检查覆盖率
   npm run test:coverage
   ```

3. 构建
   ```bash
   # 构建生产版本
   npm run build
   ```

## 调试指南

### 本地调试

1. 打开 Chrome 扩展管理页面
2. 加载已解压的扩展程序
3. 选择 `dist` 目录

### 性能分析

使用 Chrome DevTools 进行性能分析：
1. 打开 Performance 面板
2. 记录操作过程
3. 分析性能瓶颈

### 常见问题

1. 存储配额超限
   - 检查存储使用情况
   - 清理不必要的数据

2. 内存泄漏
   - 使用 Memory 面板排查
   - 检查事件监听器

## API 文档

详见 [API 文档](api.md)
