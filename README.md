# 金句卡片生成器 (Quote Card Generator)

<p align="center">
  <img src="docs/images/logo.png" alt="金句卡片生成器" width="200"/>
</p>

<p align="center">
  <a href="https://github.com/youkeyou110/wangyejingju/releases">
    <img src="https://img.shields.io/github/v/release/youkeyou110/wangyejingju" alt="version"/>
  </a>
  <a href="https://github.com/youkeyou110/wangyejingju/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/youkeyou110/wangyejingju" alt="license"/>
  </a>
</p>

一个帮助用户快速将网页中的精彩文字转换成精美分享卡片的Chrome扩展。

## ✨ 功能特性

- 🎯 智能文本选择：快速选择和高亮网页中的文字
- 🎨 精美卡片模板：多种预设模板，支持自定义样式
- 💾 便捷导出分享：支持多种格式导出，一键分享到社交媒体
- 🔌 插件化架构：支持功能扩展，提供丰富的API
- 🌈 主题定制：支持明暗主题切换，可自定义主题
- 🔄 数据同步：支持云端同步，多设备数据互通
- 🛠️ 丰富设置：提供多样化的配置选项

## 🚀 快速开始

### 安装

1. 从 [Chrome Web Store](https://chrome.google.com/webstore) 安装扩展
2. 或者下载最新的 [Release](https://github.com/youkeyou110/wangyejingju/releases) 包手动安装

### 使用方法

1. 在网页中选择文字
2. 右键点击，选择"生成金句卡片"
3. 在弹出窗口中编辑和美化
4. 导出或分享您的卡片

## 🔨 开发指南

### 环境要求

- Node.js >= 14
- npm >= 6
- Chrome >= 88

### 本地开发

```bash
# 克隆项目
git clone https://github.com/youkeyou110/wangyejingju.git

# 安装依赖
npm install

# 启动开发服务
npm run dev

# 构建项目
npm run build
```

### 项目结构

```
├── src/                # 源代码目录
│   ├── background/    # 背景脚本
│   ├── content/       # 内容脚本
│   ├── popup/         # 弹出窗口
│   ├── components/    # React组件
│   ├── utils/         # 工具函数
│   └── styles/        # 样式文件
├── docs/              # 文档
├── tests/             # 测试文件
└── dist/              # 构建输出
```

## 📖 文档

- [用户指南](docs/user-guide.md)
- [API文档](docs/api.md)
- [开发计划](docs/DEVELOPMENT_PLAN.md)
- [问题解决](docs/troubleshooting/github_pages_setup.md)

## 🤝 贡献指南

我们欢迎所有形式的贡献，包括但不限于：

- 提交问题和建议
- 改进文档
- 修复bug
- 添加新功能
- 优化性能
- 完善测试

详细信息请查看 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

感谢所有贡献者：

<a href="https://github.com/youkeyou110/wangyejingju/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=youkeyou110/wangyejingju" />
</a>

## 📞 联系我们

- Issue: [GitHub Issues](https://github.com/youkeyou110/wangyejingju/issues)
- Email: your-email@example.com
- 微信公众号: QuoteCardGen

## 🔗 相关链接

- [Chrome Web Store](https://chrome.google.com/webstore)
- [项目主页](https://youkeyou110.github.io/wangyejingju)
- [开发文档](https://youkeyou110.github.io/wangyejingju/docs)
