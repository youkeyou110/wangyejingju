# 贡献指南

感谢你考虑为 Quote Card Generator 做出贡献！

## 开发流程

1. Fork 项目并克隆到本地
```bash
git clone https://github.com/your-username/quote-card-generator.git
cd quote-card-generator
```

2. 创建新分支
```bash
git checkout -b feature/your-feature-name
```

3. 安装依赖
```bash
# 前端依赖
npm install

# 后端依赖
cd server
npm install
```

4. 进行开发
- 遵循代码规范
- 添加必要的测试
- 保持提交信息清晰

5. 运行测试
```bash
# 前端测试
npm test

# 后端测试
cd server
npm test
```

6. 提交代码
```bash
git add .
git commit -m "feat: add some feature"
git push origin feature/your-feature-name
```

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复问题
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat: 添加模板预览功能
fix: 修复图片导出失败问题
docs: 更新 API 文档
```

## 代码规范

### JavaScript

- 使用 ES6+ 语法
- 遵循 ESLint 配置
- 使用 2 空格缩进
- 使用分号结尾
- 优先使用 const/let

### CSS

- 使用 CSS Variables
- 采用 BEM 命名规范
- 保持选择器简洁
- 避免使用 !important

### 测试

- 单元测试覆盖率 > 80%
- 编写有意义的测试描述
- 测试文件与源文件同名
- 使用合适的断言

## Pull Request 流程

1. 确保 PR 标题符合提交规范
2. 填写完整的 PR 描述
3. 关联相关 Issue
4. 通过所有自动化测试
5. 等待代码审查
6. 根据反馈进行修改
7. 等待合并

## 开发环境

- Node.js >= 14
- npm >= 6
- Chrome >= 88
- MongoDB >= 4.4

## 项目结构说明

```
quote-card-generator/
├── src/                    # 前端源码
│   ├── popup/             # 弹出窗口
│   │   ├── components/    # UI组件
│   │   ├── styles/        # 样式文件
│   │   └── utils/         # 工具函数
│   ├── background/        # 后台脚本
│   ├── content/           # 内容脚本
│   └── templates/         # 模板系统
├── server/                # 后端服务
│   ├── src/              # 服务器源码
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由
│   │   └── middleware/   # 中间件
│   ├── tests/            # 测试用例
│   └── docs/             # API文档
└── docs/                  # 项目文档
```

## 常见问题

### 如何调试

1. 前端调试
   - 使用 Chrome DevTools
   - 查看 Console 输出
   - 使用 Vue DevTools

2. 后端调试
   - 使用 VS Code Debugger
   - 查看日志输出
   - 使用 Postman 测试 API

### 开发建议

1. 功能开发
   - 先写测试用例
   - 保持功能独立
   - 考虑边界情况
   - 添加错误处理

2. 性能优化
   - 减少 DOM 操作
   - 优化图片加载
   - 使用缓存机制
   - 避免内存泄漏

## 联系方式

- Issue 讨论：[GitHub Issues](https://github.com/your-username/quote-card-generator/issues)
- 邮件联系：your-email@example.com
- 开发群：[Telegram Group](https://t.me/quote_card_dev)

## 许可证

贡献代码时，你同意将代码按照项目的 MIT 许可证开源。
