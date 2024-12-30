# 金句卡片生成器

一个简单易用的 Chrome 扩展，帮助你快速生成精美的金句卡片。

## 功能特点

- 🎨 多样化模板：内置多种精美模板，支持自定义样式
- 📝 智能排版：自动调整文字大小和位置，确保最佳显示效果
- 🔄 实时预览：所见即所得的编辑体验
- 💾 一键导出：支持多种图片格式导出
- 🌐 在线市场：浏览和下载社区分享的模板
- 🌍 多语言支持：支持中文和英文界面

## 安装使用

1. 从 Chrome 网上应用店安装
   - 访问 [Chrome 网上应用店](https://chrome.google.com/webstore)
   - 搜索"金句卡片生成器"
   - 点击"添加到 Chrome"

2. 开发版本安装
   ```bash
   # 克隆仓库
   git clone https://github.com/your-username/quote-card-generator.git

   # 安装依赖
   npm install

   # 构建项目
   npm run build
   ```
   然后在 Chrome 扩展管理页面加载 `dist` 目录

## 快速开始

1. 点击工具栏中的扩展图标
2. 输入或粘贴文本
3. 选择喜欢的模板
4. 调整样式设置
5. 点击导出按钮保存图片

## 开发指南

### 环境要求

- Node.js >= 14
- npm >= 6
- Chrome >= 88

### 项目结构

```
project/
├── src/
│   ├── popup/          # 弹出窗口相关文件
│   ├── background/     # 后台脚本
│   ├── content/        # 内容脚本
│   ├── _locales/      # 国际化文件
│   └── manifest.json   # 扩展配置文件
├── docs/              # 文档
├── tests/            # 测试文件
└── package.json
```

### 开发命令

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 运行测试
npm test

# 代码检查
npm run lint

# 格式化代码
npm run format
```

### 技术栈

- 构建工具：Webpack
- UI 框架：原生 JavaScript
- 样式处理：CSS Variables
- 国际化：Chrome i18n API
- 测试框架：Jest

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

详细信息请参考 [CONTRIBUTING.md](CONTRIBUTING.md)

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 了解详细信息。

## 联系我们

- 问题反馈：[GitHub Issues](https://github.com/your-username/quote-card-generator/issues)
- 邮件联系：your-email@example.com
- 微信公众号：金句卡片生成器

## 致谢

感谢所有贡献者的付出！

[贡献者列表](https://github.com/your-username/quote-card-generator/graphs/contributors)
