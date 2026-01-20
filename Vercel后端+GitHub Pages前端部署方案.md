# Vercel 后端 + GitHub Pages 前端 - 完整部署方案

## 📋 部署架构

```
前端：GitHub Pages (https://your-username.github.io/TransGuyane)
   ↓ API 请求
后端：Vercel (https://your-project.vercel.app/api)
   ↓ 数据库连接
数据库：MongoDB Atlas (云数据库)
```

**总成本：$0/月** 🆓

---

## 🎯 第一步：GitHub 仓库设置

### 1.1 创建 GitHub 仓库

1. 访问 https://github.com 并登录
2. 点击右上角 "+" → "New repository"
3. 填写信息：
   - **Repository name**: `TransGuyane`
   - **Description**: `TransGuyane 仓库管理系统`
   - **Visibility**: ✅ **Public**（GitHub Pages 需要 Public 仓库）
   - ⚠️ **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 1.2 配置本地仓库并推送

```powershell
# 确保在项目根目录
cd "D:\【网站设计】\TransGuyane"

# 删除旧的远程配置（如果存在）
git remote remove origin

# 添加您的 GitHub 仓库（替换为您的实际 URL）
git remote add origin https://github.com/your-username/TransGuyane.git

# 验证配置
git remote -v

# 推送代码到 GitHub
git add .
git commit -m "Initial commit: Prepare for deployment"
git push -u origin main
```

---

## 🚀 第二步：部署后端到 Vercel

### 2.1 注册 Vercel 账号

1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. **使用 GitHub 账号登录**（推荐，便于集成）

### 2.2 在 Vercel 中导入项目

1. 登录 Vercel 控制台
2. 点击 **Add New...** → **Project**
3. 选择您的 GitHub 仓库 `TransGuyane`
4. 配置项目设置：

   | 配置项 | 值 |
   |--------|-----|
   | **Framework Preset** | Other |
   | **Root Directory** | `backend` ⚠️ **重要** |
   | **Build Command** | 留空 |
   | **Output Directory** | 留空 |
   | **Install Command** | `npm install` |

5. **点击 "Deploy"**（先不配置环境变量，稍后会配置）

### 2.3 配置环境变量

部署完成后，进入项目设置：

1. 进入项目 → **Settings** → **Environment Variables**
2. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/warehouse_management?retryWrites=true&w=majority` | MongoDB Atlas 连接字符串 |
| `JWT_SECRET` | `your_very_secure_secret_key_at_least_32_characters_long` | JWT 密钥（至少32字符） |
| `NODE_ENV` | `production` | 环境变量 |
| `FRONTEND_URL` | `https://your-username.github.io/TransGuyane` | 前端 URL（用于 CORS）⚠️ **替换为您的 GitHub Pages URL** |
| `WECHAT_APPID` | `your_wechat_appid` | 微信 AppID（可选） |
| `WECHAT_SECRET` | `your_wechat_secret` | 微信 Secret（可选） |

3. 点击 **Save** 保存所有变量
4. 进入 **Deployments** 标签页，点击最新部署右侧的 **"..."** → **Redeploy**（重新部署以应用环境变量）

### 2.4 获取后端 API 地址

部署成功后，Vercel 会提供一个地址，例如：
```
https://transguyane.vercel.app
```

**API 基础 URL** 将是：
```
https://transguyane.vercel.app/api
```

⚠️ **请记住这个地址**，下一步配置前端时需要用到。

---

## 🌐 第三步：部署前端到 GitHub Pages

### 3.1 更新前端配置

#### 更新 package.json 中的 homepage

编辑 `frontend/package.json`，更新 `homepage` 字段：

```json
{
  "homepage": "https://your-username.github.io/TransGuyane"
}
```

⚠️ **替换 `your-username` 为您的 GitHub 用户名**。

#### 创建生产环境变量文件

创建 `frontend/.env.production` 文件：

```env
REACT_APP_API_URL=https://your-project.vercel.app/api
```

⚠️ **替换 `your-project` 为您的 Vercel 项目名称**。

### 3.2 配置 GitHub Actions 自动部署

我们已经为您创建了 GitHub Actions 工作流文件（`.github/workflows/deploy.yml`），它会：

- 监听 main 分支的推送
- 自动构建前端
- 自动部署到 GitHub Pages

**您只需要：**

1. **启用 GitHub Pages**
   - 进入仓库 → **Settings** → **Pages**
   - **Source** 选择：**GitHub Actions** ✅
   - 保存

2. **推送到 GitHub**（工作流会自动触发）

```powershell
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### 3.3 查看部署状态

1. 进入仓库 → **Actions** 标签页
2. 查看部署工作流状态
3. 部署成功后，访问：`https://your-username.github.io/TransGuyane`

---

## ✅ 第四步：验证部署

### 4.1 测试后端 API

```bash
# 测试健康检查
curl https://your-project.vercel.app/api/health

# 应该返回：
# {"status":"ok","message":"服务器运行正常"}
```

### 4.2 测试前端

1. 访问前端网站：`https://your-username.github.io/TransGuyane`
2. 尝试登录/注册
3. 测试各项功能
4. 打开浏览器开发者工具（F12），检查控制台是否有错误

### 4.3 检查 CORS 配置

如果遇到 CORS 错误：

1. 确认 Vercel 环境变量 `FRONTEND_URL` 已正确设置
2. 确认值包含完整的 GitHub Pages URL（包括 `/TransGuyane`）
3. 重新部署 Vercel 项目

---

## 🔄 后续更新流程

### 更新后端代码

1. 修改后端代码
2. 推送到 GitHub：
   ```powershell
   git add .
   git commit -m "Update backend: 描述更改"
   git push origin main
   ```
3. Vercel 会自动检测并部署 ✅

### 更新前端代码

1. 修改前端代码
2. 推送到 GitHub：
   ```powershell
   git add .
   git commit -m "Update frontend: 描述更改"
   git push origin main
   ```
3. GitHub Actions 会自动构建并部署到 GitHub Pages ✅

---

## 🔧 配置检查清单

### GitHub 仓库
- [ ] GitHub 仓库已创建（Public）
- [ ] 代码已推送到 GitHub
- [ ] GitHub Pages 已启用（使用 GitHub Actions）

### Vercel 后端
- [ ] Vercel 账号已注册（使用 GitHub 登录）
- [ ] 项目已导入（Root Directory: `backend`）
- [ ] 环境变量已配置：
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `FRONTEND_URL`（GitHub Pages URL）
- [ ] 项目已成功部署
- [ ] API 可以访问

### 前端配置
- [ ] `frontend/package.json` 中的 `homepage` 已更新
- [ ] `frontend/.env.production` 已创建并配置 API URL
- [ ] GitHub Actions 工作流已创建
- [ ] 前端已成功部署到 GitHub Pages
- [ ] 前端可以正常访问
- [ ] 前端可以正常调用后端 API

---

## 🐛 常见问题

### 1. 前端无法连接后端 API

**可能原因：**
- CORS 配置不正确
- API URL 配置错误

**解决方案：**
1. 检查 `frontend/.env.production` 中的 `REACT_APP_API_URL` 是否正确
2. 检查 Vercel 环境变量 `FRONTEND_URL` 是否包含完整的前端 URL
3. 确保前端 URL 与后端 CORS 配置匹配

### 2. GitHub Pages 404 错误

**可能原因：**
- React Router 路由问题
- homepage 配置错误

**解决方案：**
1. 确保 `package.json` 中的 `homepage` 正确配置
2. 如果使用 React Router，可能需要使用 HashRouter（已在项目中配置）

### 3. Vercel 部署失败

**可能原因：**
- Root Directory 配置错误
- 环境变量缺失

**解决方案：**
1. 确认 Root Directory 设置为 `backend`
2. 检查所有必需的环境变量是否已配置
3. 查看 Vercel 部署日志排查错误

### 4. MongoDB 连接失败

**可能原因：**
- 连接字符串错误
- IP 白名单未配置

**解决方案：**
1. 检查 MongoDB Atlas 连接字符串
2. 在 MongoDB Atlas 中，将 Vercel IP 加入白名单（或允许所有 IP：`0.0.0.0/0`）

---

## 📚 相关文档

- [Vercel 部署详细指南](./docs/deployment/VERCEL_DEPLOYMENT.md)
- [GitHub Pages 部署详细指南](./docs/deployment/GITHUB_PAGES_DEPLOYMENT.md)
- [完整部署方案](./docs/deployment/DEPLOYMENT_PLAN.md)

---

## 🎉 完成！

恭喜！您的项目已成功部署：

- ✅ **前端**：https://your-username.github.io/TransGuyane
- ✅ **后端**：https://your-project.vercel.app/api
- ✅ **总成本**：$0/月 🆓

---

**最后更新**：2026年1月
