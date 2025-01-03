# 贡献指南

感谢您对金句卡片生成器的关注！我们欢迎各种形式的贡献，包括但不限于：

- 提交问题和建议
- 改进文档
- 修复bug
- 添加新功能
- 优化性能
- 完善测试

## 开发流程

### 1. 准备工作

1. Fork项目到自己的账号下
2. Clone项目到本地
```bash
git clone https://github.com/your-username/quote-card-generator.git
cd quote-card-generator
```

3. 安装依赖
```bash
npm install
```

4. 创建新分支
```bash
git checkout -b feature/your-feature
```

### 2. 开发

1. 启动开发服务器
```bash
npm run dev
```

2. 修改代码
   - 遵循代码规范
   - 添加必要的注释
   - 编写测试用例

3. 提交代码
```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature
```

### 3. 提交PR

1. 创建Pull Request
   - 描述改动内容
   - 关联相关Issue
   - 添加测试结果

2. 等待审查
   - 及时响应反馈
   - 修改完善代码
   - 确保CI通过

## 代码规范

### 1. 命名规范

- 文件名
  - 组件：PascalCase
  - 工具函数：camelCase
  - 样式文件：kebab-case

- 变量名
  - 普通变量：camelCase
  - 常量：UPPER_CASE
  - 类名：PascalCase
  - 接口名：IPascalCase

### 2. 注释规范

- 文件头部
```javascript
/**
 * @file 文件描述
 * @author 作者
 * @date 创建日期
 */
```

- 函数注释
```javascript
/**
 * 函数描述
 * @param {Type} paramName - 参数描述
 * @returns {Type} 返回值描述
 * @throws {Error} 错误描述
 */
```

- 复杂逻辑注释
```javascript
// 解释为什么这样做
// 说明实现思路
// 标注注意事项
```

### 3. 代码风格

- 使用ESLint和Prettier
- 遵循项目的.eslintrc配置
- 保持代码整洁一致
- 避免重复代码

## 提交规范

### 1. 提交信息

格式：`<type>(<scope>): <subject>`

类型（type）：
- feat：新功能
- fix：修复bug
- docs：文档更新
- style：代码格式
- refactor：重构
- test：测试
- chore：构建

示例：
```
feat(template): add new card template
fix(storage): fix data sync issue
docs(api): update API documentation
```

### 2. 分支规范

- main：主分支
- develop：开发分支
- feature/*：功能分支
- bugfix/*：修复分支
- release/*：发布分支

### 3. PR规范

- 标题清晰简洁
- 描述改动内容
- 关联相关Issue
- 添加测试结果
- 确保CI通过

## 审查流程

### 1. 代码审查

审查重点：
- 代码质量
- 测试覆盖
- 性能影响
- 安全隐患
- 文档完整

### 2. 测试验证

必要测试：
- 单元测试
- 集成测试
- E2E测试
- 性能测试

### 3. 合并发布

合并条件：
- 审查通过
- 测试通过
- CI通过
- 文档完善

## 其他说明

### 1. 问题反馈

- 使用Issue模板
- 提供复现步骤
- 附上错误日志
- 说明环境信息

### 2. 功能建议

- 描述使用场景
- 说明实现思路
- 评估可行性
- 考虑兼容性

### 3. 文档改进

- 修正错误
- 添加示例
- 完善说明
- 优化格式

感谢您的贡献！
