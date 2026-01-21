# GitHub Pages 加载数据失败故障排除

## 🔍 问题诊断

前端部署到 GitHub Pages 后显示"加载数据失败"，通常是以下原因：

1. ❌ **前端 API URL 未正确配置**（最常见）
2. ❌ **Vercel 后端 CORS 配置错误**
3. ❌ **Vercel 后端环境变量未配置**
4. ❌ **Vercel 后端部署失败**

---

## ✅ 解决步骤

### 第一步：检查前端 API URL 配置

#### 1.1 获取您的 Vercel 后端 API URL

1. 登录 Vercel：https://vercel.com
2. 进入您的后端项目
3. 在项目页面找到 **Production URL**（类似：`https://your-project.vercel.app`）
4. **完整的 API URL** 应该是：`https://your-project.vercel.app/api`

#### 1.2 在 GitHub Secrets 中配置 API URL

1. **进入 GitHub 仓库**
   - 访问：https://github.com/xubo-327/TransGuyane
   - 点击 **Settings** 标签

2. **进入 Secrets 设置**
   - 在左侧菜单找到 **Secrets and variables** → **Actions**
   - 点击进入

3. **添加新的 Secret**
   - 点击 **New repository secret**
   - **Name**: `REACT_APP_API_URL`
   - **Secret**: 粘贴您的 Vercel API URL（例如：`https://your-project.vercel.app/api`）
   - ⚠️ **注意**：URL 必须以 `/api` 结尾
   - 点击 **Add secret**

4. **验证 Secret 已添加**
   - 在 Secrets 列表中应该能看到 `REACT_APP_API_URL`

#### 1.3 重新部署前端

配置 Secret 后，需要重新触发 GitHub Actions 部署：

**方法一：推送代码触发自动部署**
```bash
# 创建一个空提交来触发部署
git commit --allow-empty -m "Trigger deployment with new API URL"
git push origin main
```

**方法二：手动触发部署**
1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 找到 "Deploy to GitHub Pages" 工作流
4. 点击 **Run workflow** → **Run workflow**

---

### 第二步：检查 Vercel 后端配置

#### 2.1 验证 Vercel 后端已部署

1. 访问您的 Vercel 项目 URL：`https://your-project.vercel.app`
2. 测试健康检查端点：
   ```
   https://your-project.vercel.app/api/health
   ```
3. **预期响应**：
   ```json
   {
     "status": "ok",
     "message": "服务器运行正常"
   }
   ```

如果无法访问，说明后端部署有问题。

#### 2.2 检查 Vercel 环境变量

确保以下环境变量已配置：

1. 登录 Vercel → 进入项目 → **Settings** → **Environment Variables**

2. 检查以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas 连接字符串 ✅ |
| `JWT_SECRET` | 您的 JWT 密钥 | 至少 32 字符 ✅ |
| `NODE_ENV` | `production` | 环境类型 ✅ |
| `FRONTEND_URL` | `https://xubo-327.github.io/TransGuyane` | 前端 GitHub Pages URL ⚠️ |

3. **特别注意 `FRONTEND_URL`**：
   - 必须完全匹配您的 GitHub Pages URL
   - 格式：`https://用户名.github.io/仓库名`
   - 不能有尾部斜杠 `/`
   - 您的值应该是：`https://xubo-327.github.io/TransGuyane`

4. **如果环境变量缺失或错误**：
   - 添加或修改相应的环境变量
   - 点击 **Save**
   - 进入 **Deployments** 标签
   - 找到最新部署，点击 **"..."** → **Redeploy**

#### 2.3 检查 Vercel 部署日志

1. 进入 Vercel 项目 → **Deployments** 标签
2. 点击最新的部署记录
3. 查看 **Function Logs** 或 **Build Logs**
4. 检查是否有以下错误：
   - `MongoDB连接失败` - 说明数据库配置有问题
   - `CORS error` - 说明 CORS 配置有问题
   - `Environment variable not found` - 说明环境变量未配置

---

### 第三步：验证配置

#### 3.1 检查浏览器控制台

1. 访问您的 GitHub Pages 网站：`https://xubo-327.github.io/TransGuyane`
2. 打开浏览器开发者工具（F12）
3. 查看 **Console** 标签页
4. 查看 **Network** 标签页

**常见的错误信息：**

- **CORS 错误**：
  ```
  Access to XMLHttpRequest at 'https://your-api.vercel.app/api/...' 
  from origin 'https://xubo-327.github.io' 
  has been blocked by CORS policy
  ```
  **解决方法**：检查 Vercel 的 `FRONTEND_URL` 环境变量是否正确

- **404 错误**：
  ```
  GET https://your-api.vercel.app/api/... 404 (Not Found)
  ```
  **解决方法**：检查 API URL 是否正确，确保以 `/api` 结尾

- **网络错误**：
  ```
  Network Error
  Failed to fetch
  ```
  **解决方法**：检查 Vercel 后端是否正常部署

#### 3.2 测试 API 端点

在浏览器中直接访问以下 URL，验证后端是否正常工作：

1. **健康检查**：
   ```
   https://your-project.vercel.app/api/health
   ```
   应该返回：`{"status":"ok","message":"服务器运行正常"}`

2. **API 根路径**：
   ```
   https://your-project.vercel.app/api
   ```
   应该返回 API 端点列表

3. **测试订单列表**（需要登录）：
   ```
   https://your-project.vercel.app/api/orders
   ```

---

## 🔧 快速修复检查清单

请按照以下顺序检查：

### ✅ 检查清单

- [ ] **1. Vercel 后端已部署并可访问**
  - 访问：`https://your-project.vercel.app/api/health`
  - 返回：`{"status":"ok","message":"服务器运行正常"}`

- [ ] **2. GitHub Secrets 已配置**
  - 仓库 → Settings → Secrets and variables → Actions
  - 已添加 `REACT_APP_API_URL` Secret
  - 值为：`https://your-project.vercel.app/api`

- [ ] **3. Vercel 环境变量已配置**
  - `MONGODB_URI` - MongoDB 连接字符串
  - `JWT_SECRET` - JWT 密钥（至少 32 字符）
  - `NODE_ENV` - 值为 `production`
  - `FRONTEND_URL` - 值为 `https://xubo-327.github.io/TransGuyane`

- [ ] **4. 前端已重新部署**
  - 配置 Secret 后，已触发新的部署
  - GitHub Actions 部署成功

- [ ] **5. 浏览器清除缓存**
  - 按 `Ctrl+Shift+R`（Windows）或 `Cmd+Shift+R`（Mac）强制刷新
  - 或清除浏览器缓存后重新访问

---

## 🐛 常见问题详解

### 问题 1：CORS 错误

**错误信息**：
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**原因**：
- Vercel 后端的 `FRONTEND_URL` 环境变量未配置或配置错误
- 前端 URL 与后端 CORS 配置不匹配

**解决方法**：
1. 登录 Vercel → 项目 → Settings → Environment Variables
2. 检查或添加 `FRONTEND_URL` 环境变量
3. 值设置为：`https://xubo-327.github.io/TransGuyane`
4. 确保选择了 **Production** 环境
5. 保存后，重新部署后端（Redeploy）

### 问题 2：API URL 错误

**错误信息**：
```
GET https://your-api-domain.com/api/... 404 (Not Found)
```

**原因**：
- GitHub Secrets 中的 `REACT_APP_API_URL` 未配置
- 或配置的值不正确（使用了默认值 `https://your-api-domain.com/api`）

**解决方法**：
1. 获取正确的 Vercel API URL（例如：`https://your-project.vercel.app/api`）
2. 在 GitHub Secrets 中添加 `REACT_APP_API_URL`
3. 重新部署前端

### 问题 3：MongoDB 连接失败

**错误信息**：
- Vercel 日志中显示：`MongoDB连接失败`
- API 请求返回 500 错误

**原因**：
- `MONGODB_URI` 环境变量未配置
- 连接字符串格式错误
- MongoDB Atlas 网络访问未配置

**解决方法**：
1. 检查 Vercel 的 `MONGODB_URI` 环境变量
2. 确保连接字符串格式正确
3. 检查 MongoDB Atlas 的 Network Access（应允许 `0.0.0.0/0`）
4. 参考：[MongoDB Atlas 配置指南](./MongoDB%20Atlas配置指南.md)

---

## 📝 配置示例

### GitHub Secrets 配置

**Repository**: `xubo-327/TransGuyane`

**Secrets**:
```
Name: REACT_APP_API_URL
Value: https://your-project.vercel.app/api
```

### Vercel 环境变量配置

**Project**: 您的后端项目

**Environment Variables (Production)**:
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true&w=majority
JWT_SECRET=51f3581a2586d7c2d60e34a85003429cc00ee5f927c8e21c06fac5e48530a59b
NODE_ENV=production
FRONTEND_URL=https://xubo-327.github.io/TransGuyane
```

---

## 🎯 验证步骤

配置完成后，按照以下步骤验证：

1. **测试后端**：
   ```
   https://your-project.vercel.app/api/health
   ```
   应该返回：`{"status":"ok","message":"服务器运行正常"}`

2. **检查 GitHub Actions**：
   - 进入仓库 → Actions 标签
   - 确认最新部署成功

3. **访问前端网站**：
   ```
   https://xubo-327.github.io/TransGuyane
   ```
   - 应该能正常加载页面
   - 打开浏览器控制台（F12），不应该有 CORS 错误
   - Network 标签页中，API 请求应该返回 200 状态码

4. **测试登录功能**：
   - 尝试登录或注册
   - 如果成功，说明后端连接正常

---

## 💡 提示

1. **每次修改配置后**，都需要重新部署才能生效
   - GitHub Secrets → 重新触发 GitHub Actions 部署
   - Vercel 环境变量 → 重新部署 Vercel 项目（Redeploy）

2. **清除浏览器缓存**：
   - 使用 `Ctrl+Shift+R` 强制刷新
   - 或在开发者工具中勾选 "Disable cache"

3. **检查浏览器控制台**：
   - 按 F12 打开开发者工具
   - 查看 Console 和 Network 标签页
   - 这些信息有助于快速定位问题

---

## 📚 相关文档

- [Vercel 数据库配置完整步骤](./Vercel数据库配置完整步骤.md)
- [Vercel 后端部署指南](./docs/deployment/VERCEL_DEPLOYMENT.md)
- [GitHub Pages 部署指南](./docs/deployment/GITHUB_PAGES_DEPLOYMENT.md)

---

**如果按照以上步骤操作后仍有问题，请告诉我具体的错误信息，我会进一步协助您！** 🔧
