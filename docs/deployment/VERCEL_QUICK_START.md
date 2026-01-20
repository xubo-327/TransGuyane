
# Vercel 快速部署指南

## ⚡ 5分钟快速部署

### 第一步：注册和准备（2分钟）

1. **注册Vercel账号**
   - 访问 https://vercel.com
   - 使用GitHub账号登录

2. **推送代码到GitHub**
   ```bash
   git add .
   git commit -m "Add Vercel deployment"
   git push origin main
   ```

### 第二步：部署项目（2分钟）

1. **在Vercel中导入项目**
   - 登录Vercel控制台
   - 点击 **Add New...** → **Project**
   - 选择你的GitHub仓库

2. **配置项目**
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: 留空
   - **Output Directory**: 留空
   - **Install Command**: `npm install`

3. **添加环境变量**
   点击 **Environment Variables**，添加：
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/warehouse_management
   JWT_SECRET=your_secret_key_at_least_32_characters
   NODE_ENV=production
   FRONTEND_URL=https://your-username.github.io
   ```

4. **点击 Deploy**

### 第三步：测试（1分钟）

部署完成后，测试API：

```bash
curl https://your-project.vercel.app/api/health
```

应该返回：
```json
{"status":"ok","message":"服务器运行正常"}
```

### 第四步：更新前端API地址

更新 `frontend/.env.production`：

```env
REACT_APP_API_URL=https://your-project.vercel.app/api
```

---

## ✅ 完成！

您的后端已成功部署到Vercel！

**API地址**：`https://your-project.vercel.app/api`

**详细文档**：查看 [完整Vercel部署指南](./VERCEL_DEPLOYMENT.md)
