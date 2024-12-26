# 贡献指南

感谢您有兴趣为金句卡片生成器做出贡献！

## 目录

- [行为准则](#行为准则)
- [开始之前](#开始之前)
- [开发流程](#开发流程)
- [提交指南](#提交指南)
- [开发规范](#开发规范)
- [测试指南](#测试指南)

## 行为准则

本项目采用 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则。参与本项目即表示您同意遵守其条款。

## 开始之前

1. Fork 本仓库
2. Clone 到本地
3. 安装依赖
   ```bash
   npm install
   ```
4. 创建新分支
   ```bash
   git checkout -b feature/your-feature
   ```

## 开发流程

1. 确保您的代码符合我们的编码规范
2. 编写/更新测试
3. 确保所有测试通过
4. 提交代码
5. 推送到您的 Fork
6. 创建 Pull Request

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build
```

## 提交指南

### 分支命名

- 功能分支: `feature/your-feature`
- 修复分支: `fix/issue-description`
- 文档分支: `docs/what-you-modified`

### 提交消息格式

��们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型（type）：
- feat: 新功能
- fix: 修复
- docs: 文档更新
- style: 代码格式（不影响代码运行的变动）
- refactor: 重构
- perf: 性能优化
- test: 测试
- chore: 构建过程或辅助工具的变动

示例：
```
feat(template): add new template system

- Add template manager
- Add template validation
- Update tests

Closes #123
```

### Pull Request 规范

1. PR 标题应简洁明了
2. 描述中应包含：
   - 解决的问题
   - 实现方案
   - 可能的影响
3. 确保所有检查都通过
4. 及时响应 review 意见

## 开发规范

### 代码风格

我们使用 ESLint 和 Prettier 来保证代码质量：

```bash
# 检查代码风格
npm run lint

# 自动修复
npm run lint:fix
```

### JavaScript 规范

- 使用 ES6+ 特性
- 优先使用 const/let
- 使用异步/await 处理异步
- 添加适当的注释

### CSS 规范

- 使用 BEM 命名规范
- 避免深层嵌套
- 使用 CSS 变量
- 保持可维护性

### 文档规范

- 使用 Markdown 格式
- 保持文档最新
- 添加适当的示例
- 使用清晰的结构

## 测试指南

### 单元测试

- 每个组件都应有对应的测���
- 测试覆盖率要求 > 80%
- 使用有意义的测试描述

```bash
# 运行单元测试
npm test

# 查看覆盖率报告
npm run test:coverage
```

### 集成测试

- 测试组件间交互
- 测试主要用户流程
- 模拟真实场景

### E2E 测试

- 测试完整功能流程
- 验证用户界面交互
- 检查性能指标

## 性能要求

- 首次加载时间 < 2s
- 操作响应时间 < 100ms
- 内存占用 < 50MB
- 导出耗时 < 1s

## 发布流程

1. 更新版本号
   ```bash
   npm version patch|minor|major
   ```

2. 更新 CHANGELOG.md
3. 创建发布标签
4. 构建生产版本
5. 发布到 Chrome 网上应用店

## 获取帮助

- 查看 [文档](docs/)
- 提交 [Issue](../../issues)
- 加入讨论组

再次感谢您的贡献！ 