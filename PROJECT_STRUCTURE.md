# 📁 聚时AI助手 - 项目结构

## 🎯 当前结构优化建议

### 建议的专业项目结构：

```
jushi-ai-assistant/
├── 📋 项目文档
│   ├── README.md                    # 项目主文档
│   ├── CONTRIBUTING.md              # 贡献指南  
│   ├── LICENSE                      # 开源协议
│   ├── CHANGELOG.md                 # 版本更新日志
│   └── CODE_OF_CONDUCT.md          # 行为准则
│
├── 📁 核心代码 (/src)
│   ├── app/                        # Next.js App Router
│   │   ├── api/                   # API路由
│   │   │   └── chat/              # 聊天API
│   │   ├── (pages)/               # 页面组件
│   │   │   ├── chat/              # 聊天页面
│   │   │   └── dashboard/         # 仪表板
│   │   ├── globals.css            # 全局样式
│   │   └── layout.tsx             # 根布局
│   │
│   ├── components/                 # 可复用组件
│   │   ├── ui/                    # 基础UI组件
│   │   ├── chat/                  # 聊天相关组件
│   │   ├── dashboard/             # 仪表板组件
│   │   └── common/                # 通用组件
│   │
│   ├── lib/                       # 核心逻辑
│   │   ├── ai/                    # AI相关功能
│   │   ├── task/                  # 任务管理
│   │   ├── auth/                  # 认证逻辑
│   │   ├── utils/                 # 工具函数
│   │   └── constants/             # 常量定义
│   │
│   ├── hooks/                     # 自定义Hooks
│   ├── types/                     # TypeScript类型定义
│   └── styles/                    # 样式文件
│
├── 📁 配置文件
│   ├── .env.example               # 环境变量示例
│   ├── .gitignore                 # Git忽略文件
│   ├── next.config.js             # Next.js配置
│   ├── tailwind.config.js         # Tailwind配置
│   ├── tsconfig.json              # TypeScript配置
│   └── package.json               # 项目依赖
│
├── 📁 测试 (/tests 或 __tests__)
│   ├── components/                # 组件测试
│   ├── lib/                       # 逻辑测试
│   ├── api/                       # API测试
│   ├── e2e/                       # 端到端测试
│   └── setup/                     # 测试配置
│
├── 📁 文档 (/docs)
│   ├── api/                       # API文档
│   ├── deployment/                # 部署指南
│   ├── development/               # 开发指南
│   ├── user-guide/                # 用户手册
│   └── architecture/              # 架构文档
│
├── 📁 工具和脚本 (/scripts)
│   ├── build.js                   # 构建脚本
│   ├── deploy.js                  # 部署脚本
│   └── dev-setup.js               # 开发环境设置
│
├── 📁 静态资源 (/public)
│   ├── icons/                     # 图标文件
│   ├── images/                    # 图片资源
│   └── favicon.ico                # 网站图标
│
└── 📁 GitHub配置 (/.github)
    ├── workflows/                 # GitHub Actions
    ├── ISSUE_TEMPLATE/            # Issue模板
    ├── PULL_REQUEST_TEMPLATE.md   # PR模板
    └── FUNDING.yml                # 赞助配置
```

## 🔄 结构优化建议

### 需要创建的目录：
```bash
mkdir -p docs/{api,deployment,development,user-guide,architecture}
mkdir -p src/{hooks,styles}
mkdir -p src/components/{common,dashboard}
mkdir -p src/lib/{auth,utils,constants}
mkdir -p scripts
mkdir -p .github/{workflows,ISSUE_TEMPLATE}
mkdir -p public/{icons,images}
```

### 需要移动的文件：
```bash
# 移动测试文件到统一目录
mv src/components/chat/__tests__ tests/components/chat/
mv src/lib/ai/__tests__ tests/lib/ai/
mv src/lib/task/__tests__ tests/lib/task/

# 移动文档文件
mv deployment-guide.md docs/deployment/
mv github-collaboration-guide.md docs/development/
```

## 📋 需要添加的专业文件

### 1. CHANGELOG.md - 版本更新日志
### 2. CODE_OF_CONDUCT.md - 社区行为准则  
### 3. LICENSE - 开源协议
### 4. .github/workflows/ - CI/CD配置
### 5. docs/ - 完整文档体系

## 🎯 优化后的优势

✅ **清晰的目录结构** - 开发者快速定位代码
✅ **统一的测试目录** - 便于测试管理
✅ **完整的文档体系** - 降低贡献门槛
✅ **专业的GitHub配置** - 自动化工作流
✅ **安全的环境变量管理** - 保护敏感信息

## 🚀 下一步行动

1. 按照建议创建目录结构
2. 移动和重组现有文件
3. 添加缺失的专业文件
4. 更新导入路径
5. 测试确保功能正常 