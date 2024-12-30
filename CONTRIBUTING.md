# 贡献指南

感谢你考虑为金句卡片生成器做出贡献！以下是一些指导原则和建议。

## 行为准则

本项目采用 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则。通过参与，你同意遵守其中的条款。

## 如何贡献

### 报告 Bug

1. 使用 GitHub Issues 搜索确认该 bug 尚未被报告
2. 如果找不到相关 issue，创建一个新的
3. 使用 bug 报告模板，提供以下信息：
   - 清晰的问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 截图（如果适用）
   - 环境信息

### 提出新功能

1. 先在 Issues 中讨论新功能的必要性
2. 说明新功能将如何帮助用户
3. 提供可能的实现方案
4. 等待维护者的反馈

### 提交代码

1. Fork 项目
2. 创建特性分支
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. 编写代码，遵循项目的代码规范
4. 编写测试用例
5. 提交代码
   ```bash
   git commit -m "feat: add some feature"
   ```
6. 推送到你的 Fork
   ```bash
   git push origin feature/your-feature-name
   ```
7. 创建 Pull Request

## 开发流程

### 环境设置

1. 安装依赖
   ```bash
   npm install
   ```

2. 启动开发服务器
   ```bash
   npm run dev
   ```

3. 运行测试
   ```bash
   npm test
   ```

### 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 遵循 [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)
- 保持代码简洁，遵循 SOLID 原则
- 编写清晰的注释和文档

### 测试要求

- 所有新功能必须包含测试用例
- 保持测试覆盖率在 80% 以上
- 运行所有测试并确保通过
- 包含单元测试和集成测试

## 文档贡献

### 文档结构

```
docs/
├── api/           # API 文档
├── guides/        # 使用指南
├── contributing/  # 贡献指南
└── examples/      # 示例代码
```

### 文档规范

- 使用 Markdown 格式
- 包含清晰的标题和目录
- 提供代码示例
- 包含必要的截图
- 保持文档的及时更新

## 发布流程

1. 版本号规范
   - 遵循 [Semantic Versioning](https://semver.org/)
   - 主版本号：不兼容的 API 修改
   - 次版本号：向下兼容的功能性新增
   - 修订号：向下兼容的问题修正

2. 更新日志
   - 在 CHANGELOG.md 中记录所有更改
   - 按版本号分类
   - 包含变更类型（新功能、修复、改进等）

3. 发布检查清单
   - 所有测试通过
   - 文档已更新
   - 更新日志已添加
   - 版本号已更新
   - 代码审查已完成

## 社区参与

- 参与 Issues 讨论
- 帮助回答其他用户的问题
- 改进文档
- 分享使用经验
- 推广项目

## 获得帮助

- 查阅 [文档](docs/)
- 在 [Issues](https://github.com/your-username/quote-card-generator/issues) 中提问
- 发送邮件到 your-email@example.com
- 加入我们的微信群

感谢你的贡献！
