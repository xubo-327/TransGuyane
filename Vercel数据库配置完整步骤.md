# Vercel 后端数据库配置完整步骤

## 📋 概述

本指南将帮助您在 Vercel 上配置后端项目的 MongoDB Atlas 数据库连接。

## 🎯 前提条件

- ✅ 已注册 MongoDB Atlas 账号（免费）
- ✅ 已创建 MongoDB Atlas 集群
- ✅ 已配置数据库用户和网络访问
- ✅ 已获取 MongoDB 连接字符串
- ✅ 已在 Vercel 上部署后端项目

---

## 🚀 第一步：获取 MongoDB Atlas 连接字符串

### 如果您还没有配置 MongoDB Atlas：

1. **访问 MongoDB Atlas**
   - 打开 https://www.mongodb.com/cloud/atlas/register
   - 注册账号（免费）

2. **创建免费集群**
   - 登录后点击 **"Build a Database"**
   - 选择 **FREE (M0)** 套餐
   - 选择区域（建议选择 Asia Pacific）
   - 点击 **"Create Cluster"**
   - 等待 3-5 分钟集群创建完成

3. **创建数据库用户**
   - 在 **Database Access** 中点击 **"Add New Database User"**
   - 设置用户名和密码（请妥善保存）
   - 权限选择：**"Read and write to any database"**
   - 点击 **"Add User"**

4. **配置网络访问**
   - 在 **Network Access** 中点击 **"Add IP Address"**
   - 选择 **"Allow Access from Anywhere"** (0.0.0.0/0)
   - 点击 **"Confirm"**

5. **获取连接字符串**
   - 点击集群的 **"Connect"** 按钮
   - 选择 **"Connect your application"**
   - 驱动选择：**Node.js**，版本 **5.5 or later**
   - 复制连接字符串

### 连接字符串格式：

```
mongodb+srv://用户名:密码@集群地址.mongodb.net/数据库名?retryWrites=true&w=majority
```

**示例：**
```
mongodb+srv://admin:MyPassword123@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true&w=majority
```

⚠️ **重要提示：**
- 将 `<username>` 替换为您的数据库用户名
- 将 `<password>` 替换为您的数据库密码（如果包含特殊字符，需要进行 URL 编码）
- 将 `数据库名` 替换为 `warehouse_management` 或您选择的名称
- 确保密码中没有特殊字符，或已正确 URL 编码（如 `@` 应编码为 `%40`，`#` 应编码为 `%23`）

---

## 🔧 第二步：在 Vercel 中配置环境变量

### 方法一：通过 Vercel 控制台配置（推荐）

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **进入项目设置**
   - 在仪表板中找到您的后端项目
   - 点击项目进入详情页

3. **进入环境变量设置**
   - 点击顶部 **Settings** 标签
   - 在左侧菜单中找到 **Environment Variables**
   - 点击进入

4. **添加必需的环境变量**

#### 环境变量列表：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas 连接字符串（必需）|
| `JWT_SECRET` | 随机字符串（至少32字符）| JWT 密钥（必需）|
| `NODE_ENV` | `production` | 环境类型（必需）|
| `FRONTEND_URL` | `https://xubo-327.github.io/TransGuyane` | 前端 URL（用于 CORS，必需）|

#### 详细配置步骤：

**4.1 配置 MONGODB_URI**

1. 点击 **Add New** 或 **Add** 按钮
2. 在 **Key** 输入框中输入：`MONGODB_URI`
3. 在 **Value** 输入框中粘贴您的 MongoDB Atlas 连接字符串
4. 在 **Environments** 中选择：
   - ✅ Production（必需）
   - ✅ Preview（推荐）
   - ✅ Development（可选）
5. 点击 **Save**

**4.2 生成并配置 JWT_SECRET**

JWT_SECRET 用于加密 JWT Token，需要至少 32 个字符的随机字符串。

**生成方法（选择一种）：**

**方法 A：使用 PowerShell（Windows）**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**方法 B：使用 Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**方法 C：在线生成工具**
- 访问：https://www.random.org/strings/
- 长度：32
- 字符集：数字、大写字母、小写字母
- 生成并复制

**配置步骤：**
1. 点击 **Add New**
2. Key: `JWT_SECRET`
3. Value: 粘贴生成的随机字符串
4. Environments: ✅ Production, ✅ Preview
5. 点击 **Save**

⚠️ **重要：请妥善保存 JWT_SECRET，丢失后无法恢复！**

**4.3 配置 NODE_ENV**

1. 点击 **Add New**
2. Key: `NODE_ENV`
3. Value: `production`
4. Environments: ✅ Production, ✅ Preview
5. 点击 **Save**

**4.4 配置 FRONTEND_URL**

1. 点击 **Add New**
2. Key: `FRONTEND_URL`
3. Value: `https://xubo-327.github.io/TransGuyane`
   - ⚠️ 请根据您的实际 GitHub Pages URL 修改
   - 格式：`https://用户名.github.io/仓库名`
4. Environments: ✅ Production, ✅ Preview
5. 点击 **Save**

---

## ✅ 第三步：验证环境变量配置

### 检查清单

确认所有环境变量已配置：

- [ ] `MONGODB_URI` - 包含完整的 MongoDB Atlas 连接字符串
- [ ] `JWT_SECRET` - 至少 32 个字符的随机字符串
- [ ] `NODE_ENV` - 值为 `production`
- [ ] `FRONTEND_URL` - 您的前端 GitHub Pages URL

### 重新部署项目

⚠️ **重要：配置或更新环境变量后，必须重新部署项目才能生效！**

1. 在 Vercel 项目页面，点击 **Deployments** 标签
2. 找到最新的部署记录
3. 点击右侧的 **"..."** 菜单
4. 选择 **Redeploy**
5. 确认重新部署

---

## 🧪 第四步：测试数据库连接

### 1. 测试 API 健康检查端点

部署完成后，访问：

```
https://your-project.vercel.app/api/health
```

**预期响应：**
```json
{
  "status": "ok",
  "message": "服务器运行正常"
}
```

### 2. 测试 API 根路径

访问：

```
https://your-project.vercel.app/api
```

**预期响应：**
```json
{
  "status": "ok",
  "message": "仓库管理系统 API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/api/health",
    "auth": "/api/auth",
    "orders": "/api/orders",
    ...
  }
}
```

### 3. 检查部署日志

1. 在 Vercel 项目页面，点击 **Deployments** 标签
2. 点击最新的部署记录
3. 查看 **Function Logs** 或 **Build Logs**
4. 查找以下日志：
   - ✅ `MongoDB Atlas (云数据库) 连接成功`
   - ✅ `数据库: warehouse_management`
   - ✅ `运行在Vercel Serverless环境`

### 4. 测试登录功能

1. 访问您的前端网站
2. 尝试登录或注册
3. 如果成功，说明数据库连接正常

---

## 🐛 常见问题排查

### 问题 1：MongoDB 连接失败

**错误信息：**
- `MongoServerSelectionError`
- `MongoNetworkError`
- `MongoDB连接失败`

**可能原因：**
- 连接字符串格式错误
- 用户名或密码错误
- 网络访问未配置（IP 白名单）
- 数据库名称错误

**解决方法：**

1. **检查连接字符串格式**
   - 确保格式为：`mongodb+srv://用户名:密码@集群地址.mongodb.net/数据库名?retryWrites=true&w=majority`
   - 确保用户名和密码已正确替换
   - 如果密码包含特殊字符（如 `@`, `#`, `%`），需要进行 URL 编码

2. **检查 MongoDB Atlas 网络访问**
   - 登录 MongoDB Atlas
   - 进入 **Network Access**
   - 确保已添加 `0.0.0.0/0`（允许所有 IP）
   - 等待 1-2 分钟生效

3. **验证数据库用户**
   - 进入 **Database Access**
   - 确认用户存在且权限正确
   - 如果忘记密码，创建新用户

4. **检查数据库名称**
   - 在连接字符串中，`mongodb.net/` 后面的应该是数据库名称
   - 默认使用：`warehouse_management`

5. **查看 Vercel 日志**
   - 进入项目 → **Deployments** → 点击部署 → **Function Logs**
   - 查看详细的错误信息

---

### 问题 2：环境变量未生效

**可能原因：**
- 环境变量配置后未重新部署
- 选择了错误的环境（Production/Preview/Development）

**解决方法：**

1. **确认环境变量配置**
   - 进入 **Settings** → **Environment Variables**
   - 确认所有变量都已添加且值正确
   - 确认选择了正确的环境（Production/Preview）

2. **重新部署项目**
   - 进入 **Deployments** 标签
   - 找到最新部署，点击 **"..."** → **Redeploy**
   - 等待部署完成

3. **验证环境变量**
   - 在部署日志中查看环境变量是否已加载
   - 或使用测试端点验证

---

### 问题 3：CORS 错误

**错误信息：**
- `Access to XMLHttpRequest has been blocked by CORS policy`
- `CORS error`

**可能原因：**
- `FRONTEND_URL` 配置错误
- 前端 URL 与实际部署地址不匹配

**解决方法：**

1. **检查 FRONTEND_URL**
   - 确保 URL 格式正确：`https://用户名.github.io/仓库名`
   - 确保包含 `https://` 前缀
   - 确保没有尾部斜杠 `/`

2. **更新环境变量**
   - 进入 **Settings** → **Environment Variables**
   - 更新 `FRONTEND_URL` 的值
   - 重新部署项目

---

### 问题 4：JWT Secret 错误

**错误信息：**
- `jwt malformed`
- `invalid token`

**可能原因：**
- JWT_SECRET 太短（少于 32 字符）
- JWT_SECRET 包含特殊字符

**解决方法：**

1. **重新生成 JWT_SECRET**
   - 使用上述方法生成新的 32 字符随机字符串
   - 确保只包含字母和数字

2. **更新环境变量**
   - 更新 `JWT_SECRET` 的值
   - 重新部署项目

⚠️ **注意：更新 JWT_SECRET 后，所有现有的登录 Token 都会失效，用户需要重新登录。**

---

## 📊 完整配置示例

### Vercel 环境变量列表（Production 环境）

```
MONGODB_URI=mongodb+srv://admin:MyPassword123@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true&w=majority
JWT_SECRET=a7f8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6
NODE_ENV=production
FRONTEND_URL=https://xubo-327.github.io/TransGuyane
```

---

## 📚 相关文档

- [MongoDB Atlas 配置指南](./MongoDB%20Atlas配置指南.md)
- [Vercel 环境变量配置指南](./配置Vercel环境变量指南.md)
- [Vercel 后端部署指南](./docs/deployment/VERCEL_DEPLOYMENT.md)
- [完整部署方案](./完整部署方案-重新开始.md)

---

## 💡 重要提示

1. **安全性**
   - 永远不要在代码中硬编码敏感信息
   - 始终使用 Vercel 环境变量存储密钥
   - 定期轮换 JWT_SECRET（如果需要）

2. **备份**
   - 记录下您的环境变量值，特别是 JWT_SECRET
   - 保存 MongoDB Atlas 连接字符串

3. **测试**
   - 配置完成后立即测试 API 端点
   - 测试登录和注册功能
   - 检查 Vercel 日志确认无错误

4. **监控**
   - 定期查看 Vercel 部署日志
   - 监控 MongoDB Atlas 使用情况
   - 检查 API 响应时间

---

## 🎉 配置完成

配置完成后，您的后端就可以：
- ✅ 连接到 MongoDB Atlas 云数据库
- ✅ 处理用户认证和授权
- ✅ 提供 API 服务给前端
- ✅ 正常运行所有功能

**现在可以访问您的前端网站，测试完整功能了！**

---

**如有问题，请查看 Vercel 部署日志或 MongoDB Atlas 连接日志。**
