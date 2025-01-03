# 金句卡片生成器

一个Chrome扩展，帮助用户快速将网页中的精彩文字转换成精美的分享卡片。

## 功能特性

- 🎯 智能文本选择：快速选择和高亮网页中的文字
- 🎨 精美卡片模板：多种预设模板，支持自定义样式
- 💾 便捷导出分享：支持多种格式导出，一键分享到社交媒体
- 🔌 插件化架构：支持功能扩展，提供丰富的API
- 🌈 主题定制：支持明暗主题切换，可自定义主题
- 🔄 数据同步：支持云端同步，多设备数据互通
- 🛠️ 丰富设置：提供多样化的配置选项

## 快速开始

### 安装

1. 从Chrome商店安装（推荐）
```
https://chrome.google.com/webstore/detail/quote-card-generator/[extension-id]
```

2. 本地安装
```bash
# 克隆项目
git clone https://github.com/your-username/quote-card-generator.git

# 安装依赖
cd quote-card-generator
npm install

# 构建项目
npm run build

# 在Chrome中加载dist目录
```

### 使用

1. 在网页中选择文字
2. 点击右键菜单或使用快捷键
3. 在弹出窗口中编辑样式
4. 导出或分享卡片

## 技术栈

- 前端：React 18 + TypeScript + Ant Design
- 构建：Webpack 5 + Babel
- 测试：Jest + Playwright
- 工具：ESLint + Prettier

## 项目结构

```
src/
├── background/    # 后台脚本
├── content/       # 内容脚本
├── popup/         # 弹出窗口
├── components/    # 共享组件
├── managers/      # 管理器
├── utils/         # 工具函数
└── styles/        # 样式文件
```

## 开发指南

### 环境要求

- Node.js >= 14
- npm >= 6
- Chrome >= 88

### 开发流程

1. Fork项目并克隆到本地
2. 创建功能分支
3. 提交代码并推送
4. 创建Pull Request

详细信息请查看 [贡献指南](CONTRIBUTING.md)。

## 文档

- [项目概述](docs/overview.md)
- [开发计划](docs/DEVELOPMENT_PLAN.md)
- [部署文档](docs/deployment.md)
- [API文档](docs/api/README.md)
- [使用教程](docs/tutorials/README.md)

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细更新记录。

## 贡献者

感谢所有为项目做出贡献的开发者！

<a href="https://github.com/your-username/quote-card-generator/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=your-username/quote-card-generator" />
</a>

## 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 联系我们

- Issue: [GitHub Issues](https://github.com/your-username/quote-card-generator/issues)
- Email: your-email@example.com
- Twitter: [@QuoteCardGen](https://twitter.com/QuoteCardGen)
