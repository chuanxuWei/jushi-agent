# 🤝 GitHub协作开发指南

## 🚀 快速上手：将项目上传到GitHub

### 第一步：创建GitHub仓库

1. **访问GitHub**: https://github.com
2. **注册/登录**账户
3. **创建新仓库**:
   - 点击右上角 "+" → "New repository"
   - 仓库名：`jushi-ai-assistant`
   - 描述：`聚时AI助手 - 专为大学生设计的情绪-任务双驱动智能助手`
   - 设为 **Public**（开源项目）或 **Private**（私有项目）
   - **不要**勾选 "Initialize with README"（因为本地已有文件）

### 第二步：本地Git配置

```bash
# 1. 初始化Git仓库（如果未初始化）
git init

# 2. 配置用户信息（首次使用）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 3. 添加所有文件
git add .

# 4. 首次提交
git commit -m "feat: 初始项目提交 - 聚时AI助手v0.1.1"

# 5. 连接远程仓库
git remote add origin https://github.com/你的用户名/jushi-ai-assistant.git

# 6. 推送到GitHub
git push -u origin main
```

### 第三步：创建项目文档

创建以下文件来吸引协作者：

## 📋 团队协作工作流

### Git分支策略

```
main (主分支)
├── develop (开发分支)
├── feature/markdown-support (功能分支)
├── feature/pomodoro-timer (功能分支)
└── hotfix/ui-bug-fix (热修复分支)
```

### 分支命名规范

- `feature/功能名称` - 新功能开发
- `bugfix/问题描述` - Bug修复
- `hotfix/紧急修复` - 紧急修复
- `docs/文档更新` - 文档更新
- `refactor/重构描述` - 代码重构

### 提交信息规范

```bash
# 格式: type(scope): subject

# 类型 (type)
feat:     新功能
fix:      Bug修复
docs:     文档更新
style:    样式调整
refactor: 代码重构
test:     测试相关
chore:    构建/工具相关

# 示例
feat(chat): 添加Markdown渲染支持
fix(ui): 修复深色主题下代码块样式问题
docs: 更新部署指南
style(chat): 优化消息气泡动画效果
```

## 👥 团队开发流程

### 1. 新成员加入流程

```bash
# 1. Fork/Clone项目
git clone https://github.com/你的用户名/jushi-ai-assistant.git
cd jushi-ai-assistant

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加API密钥

# 4. 启动开发服务器
npm run dev

# 5. 运行测试确保环境正常
npm test
```

### 2. 功能开发流程

```bash
# 1. 切换到主分支并更新
git checkout main
git pull origin main

# 2. 创建功能分支
git checkout -b feature/new-feature-name

# 3. 开发功能
# ... 编写代码 ...

# 4. 提交更改
git add .
git commit -m "feat: 添加新功能描述"

# 5. 推送分支
git push origin feature/new-feature-name

# 6. 创建Pull Request
# 在GitHub页面创建PR，请求合并到main分支
```

### 3. Code Review流程

#### PR模板 (.github/pull_request_template.md)

```markdown
## 🎯 变更说明
- [ ] 新功能
- [ ] Bug修复
- [ ] 文档更新
- [ ] 性能优化
- [ ] 重构

## 📝 变更内容
简要描述本次变更的内容...

## 🧪 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试完成
- [ ] 移动端适配测试

## 📷 截图/演示
如果有UI变更，请提供截图或GIF演示

## ⚠️ 注意事项
- 是否有破坏性变更？
- 是否需要更新文档？
- 是否需要数据库迁移？
```

## 🛠️ 开发工具配置

### 1. VS Code配置 (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### 2. 推荐扩展 (.vscode/extensions.json)

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "ms-vscode-remote.remote-containers"
  ]
}
```

## 🔒 项目管理

### Issue模板

#### Bug报告模板
```markdown
**🐛 Bug描述**
简要描述遇到的问题...

**🔄 重现步骤**
1. 进入页面...
2. 点击按钮...
3. 观察结果...

**🎯 期望行为**
描述期望的正确行为...

**🖥️ 环境信息**
- 操作系统: [如 macOS 12.0]
- 浏览器: [如 Chrome 95.0]
- Node.js版本: [如 18.17.0]

**📷 截图**
如果可能，请提供截图...
```

#### 功能请求模板
```markdown
**🚀 功能描述**
简要描述你希望添加的功能...

**💡 解决方案**
描述你建议的实现方式...

**🎯 用户价值**
这个功能将为用户带来什么价值？

**📋 验收标准**
- [ ] 功能正常工作
- [ ] 测试覆盖完整
- [ ] 文档已更新
- [ ] 移动端适配
```

## 📊 项目看板

使用GitHub Projects创建看板：

```
📋 待办 (To Do)
├── 需求分析
├── 设计审查
└── 开发排期

🔄 进行中 (In Progress)
├── 正在开发
├── 代码审查
└── 测试验证

✅ 已完成 (Done)
├── 已发布
├── 已验证
└── 已归档
```

## 🎯 成为贡献者

### 贡献方式

1. **代码贡献**: 功能开发、Bug修复
2. **文档贡献**: README、API文档、用户指南
3. **测试贡献**: 单元测试、集成测试、用户测试
4. **设计贡献**: UI/UX设计、图标设计
5. **运营贡献**: 社区管理、用户反馈收集

### 技能要求

#### 前端开发者
- React/Next.js
- TypeScript
- Tailwind CSS
- 响应式设计

#### 后端开发者
- Node.js
- API设计
- 数据库设计
- 性能优化

#### AI/ML开发者
- 自然语言处理
- 情绪分析算法
- 机器学习模型
- Python/TensorFlow

## 📞 联系方式

- 项目Issues: GitHub Issues
- 邮箱: [feynman1099@gmail.com]

---

**欢迎加入聚时AI助手开发团队！让我们一起打造更好的大学生智能助手！** 🚀 