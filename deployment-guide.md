# 🚀 聚时AI助手部署指南

## 免费部署选项对比

### 1. Vercel (强烈推荐) ⭐⭐⭐⭐⭐
- **最适合**: Next.js应用的最佳选择
- **优势**: 
  - 零配置部署
  - 自动HTTPS
  - 全球CDN
  - 无服务器函数支持
- **限制**: 每月100GB带宽，1000次函数调用
- **部署步骤**:
  ```bash
  # 1. 安装Vercel CLI
  npm i -g vercel
  
  # 2. 登录并部署
  vercel login
  vercel --prod
  ```

### 2. Netlify ⭐⭐⭐⭐
- **适合**: 静态站点和简单API
- **优势**: 简单易用，CI/CD集成
- **限制**: API函数有执行时间限制
- **注意**: 需要配置API Routes

### 3. Railway ⭐⭐⭐⭐
- **适合**: 全栈应用
- **优势**: 支持数据库，容器化部署
- **限制**: 每月免费时长有限

### 4. Render ⭐⭐⭐
- **适合**: 中型应用
- **优势**: 免费PostgreSQL数据库
- **限制**: 冷启动时间较长

## 🎯 推荐部署方案

### 方案一：Vercel (最简单)
1. 推送代码到GitHub
2. 连接Vercel到GitHub仓库
3. 自动部署，获得 `https://your-app.vercel.app` 域名

### 方案二：Vercel + 自定义域名
1. 部署到Vercel
2. 购买域名（约￥50/年）
3. 配置DNS解析

## ⚠️ 关于CodePen的说明

CodePen **不适合**你的项目，因为：
- CodePen主要用于前端代码片段展示
- 不支持后端API和文件结构
- 不能运行Next.js这样的全栈应用

## 🔧 部署前准备

### 环境变量配置
在部署平台设置以下环境变量：

#### 必需环境变量
```env
SILICONFLOW_API_KEY=你的SiliconFlow_API密钥
```
> ⚠️ **重要**: 没有此API密钥，AI功能将无法工作，只能使用模拟回复

#### 推荐环境变量
```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=随机生成的密钥字符串  
NODE_ENV=production
```

#### Vercel部署环境变量设置步骤
1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 "Settings" > "Environment Variables"
4. 添加以下变量：
   - **Name**: `SILICONFLOW_API_KEY`
   - **Value**: 你的SiliconFlow API密钥
   - **Environments**: Production, Preview, Development
5. 点击 "Save" 保存
6. 重新部署应用

#### 获取SiliconFlow API密钥
1. 访问 [SiliconFlow官网](https://siliconflow.cn)
2. 注册并登录账户
3. 在控制台创建API密钥
4. 复制密钥到环境变量配置

### 构建验证
```bash
npm run build
npm start
```

## 📝 部署检查清单

- [ ] 环境变量已配置
- [ ] API密钥有效
- [ ] 构建成功
- [ ] 测试API接口
- [ ] 检查移动端适配
- [ ] 测试主题切换
- [ ] 验证Markdown渲染

## 🌟 推荐流程

1. **立即可用**: 部署到Vercel，5分钟获得在线版本
2. **团队协作**: 配置GitHub仓库和CI/CD
3. **长期运营**: 考虑自定义域名和分析工具 