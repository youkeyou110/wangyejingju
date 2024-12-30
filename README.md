# Quote Card Generator

一个简单的引用卡片生成器 Chrome 扩展。

## 当前状态

- ✅ 基础功能已完成
- ✅ 后端服务已部署
- ✅ 前端界面已实现
- ✅ 监控系统已就绪
- 🚧 Chrome商店发布待定

## 功能特点

- 🎨 丰富的模板系统
  - 多种预设模板
  - 自定义模板编辑
  - 模板市场分享

## 快速开始

### 安装扩展

#### 从 Chrome 商店安装
> 🚧 Chrome商店版本正在审核中，暂时只能通过开发版本安装

#### 开发版本安装
> ⚠️ 确保已安装 Node.js >= 14

1. 克隆项目并构建
```bash
git clone https://github.com/your-username/quote-card-generator.git
cd quote-card-generator
npm install
npm run build
```

2. 生成图标
```bash
npm run generate-icons
```

3. 在 Chrome 中加载扩展
- 打开 Chrome 扩展程序页面 (chrome://extensions/)
- 开启"开发者模式"
- 点击"加载已解压的扩展程序"
- 选择项目的 `dist` 目录

### 前端开发

```bash
# 克隆项目
git clone https://github.com/your-username/quote-card-generator.git

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建项目
npm run build
```

### 后端开发

```bash
# 进入服务器目录
cd server

# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm test
```

## 项目结构

```
quote-card-generator/
├── src/                    # 前端源码
│   ├── popup/             # 弹出窗口
│   ├── background/        # 后台脚本
│   ├── content/           # 内容脚本
│   └── templates/         # 模板系统
├── server/                # 后端服务
│   ├── src/              # 服务器源码
│   ├── tests/            # 测试用例
│   └── docs/             # API文档
└── docs/                  # 项目文档
```

## API 文档

详细的 API 文档请查看 [server/docs/api.md](server/docs/api.md)

### 主要接口

- 用户接口
  - 注册: `POST /api/users/register`
  - 登录: `POST /api/users/login`
  - 获取信息: `GET /api/users/profile`

- 模板接口
  - 获取列表: `GET /api/templates/market`
  - 搜索模板: `GET /api/templates/search`
  - 创建模板: `POST /api/templates`

## 开发进度

详细的开发进度请查看 [CHANGELOG.md](CHANGELOG.md)

- [x] 基础功能实现 (100%)
- [x] 模板系统开发 (100%)
- [x] 设置系统实现 (100%)
- [x] 后端服务搭建 (100%)
- [x] API 文档编写 (100%)
- [x] 测试用例编写 (100%)
- [x] 持续集成配置 (100%)
- [x] 部署脚本编写 (100%)
- [ ] Chrome商店发布 (0%)

## 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解如何参与项目开发。

## 许可证

本项目采用 MIT 许可证，详情请查看 [LICENSE](LICENSE) 文件。

## 作者

- 作者名字
- 联系方式

## 致谢

- 感谢所有贡献者的付出
- 感谢使用到的开源项目

## 功能特性

- 模板系统
  - 丰富的默认模板
  - 自定义模板支持
  - 实时预览功能
  - 模板市场集成

- 设置系统
  - 主题切换
  - 快捷键配置
  - 导出选项设置

- 在线功能
  - 用户认证
  - 数据同步
  - 云端存储
  - 版本控制

- 监控系统
  - 性能监控
  - 日志收集
  - 告警机制
  - 监控面板

## 技术栈

- 前端：React + Ant Design
- 后端：Node.js + Express
- 数据库：MongoDB
- 缓存：Redis
- 存储：支持本地存储、AWS S3、阿里云OSS
- 监控：自研监控系统

## 部署要求

- Node.js >= 14
- MongoDB >= 4.4
- Redis >= 6.0
- (可选) AWS S3 或 阿里云OSS
