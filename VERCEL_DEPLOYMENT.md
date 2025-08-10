# Vercel 部署指南

本指南将帮助您将手相分析应用部署到 Vercel 平台。

## 🚀 快速部署

### 方法一：通过 Vercel CLI（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署应用**
   ```bash
   # 在项目根目录执行
   vercel
   ```

4. **配置环境变量**
   ```bash
   # 添加 OpenAI API 密钥
   vercel env add VITE_OPENAI_API_KEY
   ```

### 方法二：通过 GitHub 集成

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账户登录
   - 点击 "New Project"
   - 选择您的 GitHub 仓库

3. **配置项目**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## ⚙️ 环境变量配置

在 Vercel 项目设置中添加以下环境变量：