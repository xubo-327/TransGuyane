# 🚀 TransGuyane 部署指南

## 📦 部署架构

```
┌─────────────────┐
│  GitHub Pages   │  ← 前端 (React)
│  (免费托管)      │
└────────┬────────┘
         │ API 请求
         ↓
┌─────────────────┐
│     Vercel      │  ← 后端 (Node.js/Express)
│  (Serverless)   │
└────────┬────────┘
         │ 数据库连接
         ↓
┌─────────────────┐
│  MongoDB Atlas  │  ← 数据库 (云数据库)
│  (免费M0/付费)  │
└─────────────────┘
```

**总成本：$0/月** 🆓（使用免费计划）

---

## 📚 部署文档

### 🎯 快速开始

1. **[部署前检查清单](./部署前检查清单.md)** - 完成所有必要的配置
2. **[完整部署方案](./Vercel后端+GitHub%20Pages前端部署方案.md)** - 详细的部署步骤

### 📖 详细文档

- [Vercel 后端部署指南](./docs/deployment/VERCEL_DEPLOYMENT.md)
- [GitHub Pages 前端部署指南](./docs/deployment/GITHUB_PAGES_DEPLOYMENT.md)
- [完整部署方案](./docs/deployment/DEPLOYMENT_PLAN.md)

---

## ⚡ 快速部署流程

### 第一步：GitHub 仓库设置

```powershell
# 1. 在 GitHub 创建仓库（Public）
# 2. 配置本地仓库
git remote remove origin
git remote add origin https://github.com/your-username/TransGuyane.git
git push -u origin main
```

### 第二步：部署后端到 Vercel

1. 访问 https://vercel.com，使用 GitHub 登录
2. 导入项目，Root Directory 设置为 `backend`
3. 配置环境变量：
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `FRONTEND_URL`（GitHub Pages URL）
4. 部署并获取 API URL

### 第三步：部署前端到 GitHub Pages

1. 更新 `frontend/package.json` 中的 `homepage`
2. 创建 `frontend/.env.production` 配置 API URL
3. 在 GitHub 仓库设置中启用 Pages（使用 GitHub Actions）
4. 推送代码，自动部署

---

## 🔧 配置说明

### 前端配置

**package.json**
```json
{
  "homepage": "https://your-username.github.io/TransGuyane"
}
```

**frontend/.env.production**
```env
REACT_APP_API_URL=https://your-project.vercel.app/api
```

### 后端配置（Vercel 环境变量）

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
NODE_ENV=production
FRONTEND_URL=https://your-username.github.io/TransGuyane
```

---

## ✅ 部署后验证

1. **测试后端**：
   ```bash
   curl https://your-project.vercel.app/api/health
   ```

2. **测试前端**：
   - 访问：`https://your-username.github.io/TransGuyane`
   - 测试登录/注册功能
   - 检查浏览器控制台是否有错误

---

## 🔄 更新代码

### 更新后端
```powershell
git add .
git commit -m "Update backend"
git push
# Vercel 自动部署
```

### 更新前端
```powershell
git add .
git commit -m "Update frontend"
git push
# GitHub Actions 自动部署
```

---

## 🐛 常见问题

### CORS 错误
- 检查 Vercel 环境变量 `FRONTEND_URL` 是否正确
- 确保包含完整的 GitHub Pages URL

### 路由 404 错误
- 确认 `package.json` 中的 `homepage` 配置正确
- 检查 `frontend/public/404.html` 是否存在

### MongoDB 连接失败
- 检查连接字符串格式
- 确认 MongoDB Atlas IP 白名单配置

---

## 📞 需要帮助？

查看详细文档：
- [部署前检查清单](./部署前检查清单.md)
- [完整部署方案](./Vercel后端+GitHub%20Pages前端部署方案.md)

---

**祝您部署顺利！** 🎉
