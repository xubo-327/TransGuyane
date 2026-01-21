# Vercel 环境变量配置指南

## 📋 需要配置的环境变量

部署后端到 Vercel 时，需要配置以下环境变量：

| 变量名 | 是否必需 | 说明 |
|--------|---------|------|
| `MONGODB_URI` | ✅ 必需 | MongoDB Atlas 数据库连接字符串 |
| `JWT_SECRET` | ✅ 必需 | JWT 密钥（至少32字符） |
| `NODE_ENV` | ✅ 必需 | 环境类型，设置为 `production` |
| `FRONTEND_URL` | ✅ 必需 | 前端 GitHub Pages URL（用于 CORS） |
| `WECHAT_APPID` | ⚪ 可选 | 微信 AppID（如果使用微信登录） |
| `WECHAT_SECRET` | ⚪ 可选 | 微信 Secret（如果使用微信登录） |

---

## 🚀 第一步：在 Vercel 中配置环境变量

### 方法一：在项目部署前配置

1. **登录 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录

2. **创建新项目或进入现有项目**
   - 如果是新项目：点击 "Add New..." → "Project" → 选择仓库
   - 如果是现有项目：进入项目页面

3. **进入环境变量设置**
   - 点击项目 → **Settings** → **Environment Variables**

4. **添加环境变量**
   - 点击 **Add New** 或 **Add** 按钮
   - 输入变量名和值
   - 选择环境（Production, Preview, Development）
   - 点击 **Save**

### 方法二：在部署后配置

1. 进入项目页面
2. 点击 **Settings** → **Environment Variables**
3. 添加所需的环境变量
4. 进入 **Deployments** 标签页
5. 找到最新部署，点击右侧 **"..."** → **Redeploy**（重新部署以应用新环境变量）

---

## 📝 第二步：配置各个环境变量

### 1. MONGODB_URI（MongoDB 数据库连接字符串）

#### 获取 MongoDB Atlas 连接字符串：

**如果您还没有 MongoDB Atlas 账号：**

1. 访问 https://www.mongodb.com/cloud/atlas
2. 注册账号（免费）
3. 创建集群（选择免费 M0 集群）
4. 创建数据库用户（Database Access）
5. 配置网络访问（Network Access）- 允许所有 IP：`0.0.0.0/0`
6. 获取连接字符串：
   - 点击 **Connect** → **Connect your application**
   - 选择 **Node.js** 驱动
   - 复制连接字符串

**连接字符串格式：**
```
mongodb+srv://用户名:密码@集群地址.mongodb.net/数据库名?retryWrites=true&w=majority
```

**示例：**
```
mongodb+srv://admin:MyPassword123@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true&w=majority
```

⚠️ **注意**：
- 将 `用户名` 和 `密码` 替换为您的数据库用户凭据
- 将 `集群地址` 替换为您的实际集群地址
- 将 `数据库名` 替换为 `warehouse_management`（或您选择的名称）
- 确保密码中没有特殊字符，或已正确 URL 编码

**在 Vercel 中配置：**
- 变量名：`MONGODB_URI`
- 变量值：粘贴完整的连接字符串
- 环境：选择 **Production**（或所有环境）

---

### 2. JWT_SECRET（JWT 密钥）

#### 生成 JWT Secret：

**方法一：使用 PowerShell（Windows）**

打开 PowerShell，运行：
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**方法二：使用 Node.js**

打开命令行，运行：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**方法三：在线生成工具**

访问：https://www.random.org/strings/
- 长度：32
- 字符集：数字、大写字母、小写字母
- 生成并复制

**示例 JWT Secret：**
```
a7f8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6
```

⚠️ **重要**：
- 至少 32 个字符
- 使用强随机字符串
- 不要使用弱密码或可预测的字符串
- 妥善保存，丢失后无法恢复

**在 Vercel 中配置：**
- 变量名：`JWT_SECRET`
- 变量值：您生成的随机字符串
- 环境：选择 **Production**（或所有环境）

---

### 3. NODE_ENV（环境类型）

**在 Vercel 中配置：**
- 变量名：`NODE_ENV`
- 变量值：`production`
- 环境：选择 **Production**（或所有环境）

---

### 4. FRONTEND_URL（前端 URL，用于 CORS）

**在 Vercel 中配置：**
- 变量名：`FRONTEND_URL`
- 变量值：`https://xubo-327.github.io/TransGuyane`
- 环境：选择 **Production**（或所有环境）

⚠️ **注意**：
- 确保 URL 与您的 GitHub Pages 地址完全匹配
- 如果前端部署在其他域名，请相应修改

---

### 5. WECHAT_APPID 和 WECHAT_SECRET（可选）

如果您的应用使用微信登录功能，需要配置：

**在 Vercel 中配置：**
- 变量名：`WECHAT_APPID`
- 变量值：您的微信 AppID
- 环境：选择 **Production**（或所有环境）

- 变量名：`WECHAT_SECRET`
- 变量值：您的微信 Secret
- 环境：选择 **Production**（或所有环境）

⚠️ **注意**：如果暂时不使用微信登录，可以跳过这两项。

---

## ✅ 第三步：验证环境变量配置

### 检查清单

配置完所有环境变量后，确认：

- [ ] `MONGODB_URI` 已配置（包含正确的用户名、密码和集群地址）
- [ ] `JWT_SECRET` 已配置（至少32字符的随机字符串）
- [ ] `NODE_ENV` 已配置（值为 `production`）
- [ ] `FRONTEND_URL` 已配置（GitHub Pages URL）
- [ ] 所有变量都已选择 **Production** 环境（或需要的环境）

### 重新部署

配置或更新环境变量后，**必须重新部署项目**才能生效：

1. 进入项目 → **Deployments** 标签页
2. 找到最新部署
3. 点击右侧 **"..."** → **Redeploy**
4. 确认重新部署

---

## 🧪 第四步：测试部署

### 1. 测试健康检查端点

部署完成后，使用 curl 或浏览器测试：

```bash
curl https://your-project.vercel.app/api/health
```

**预期响应：**
```json
{
  "status": "ok",
  "message": "服务器运行正常"
}
```

### 2. 测试 API 根路径

```bash
curl https://your-project.vercel.app/api
```

应该返回 API 信息。

### 3. 检查日志

如果出现问题，查看 Vercel 部署日志：

1. 进入项目 → **Deployments**
2. 点击部署
3. 查看 **Build Logs** 和 **Function Logs**

---

## 🐛 常见问题

### 问题1：MongoDB 连接失败

**可能原因：**
- 连接字符串格式错误
- 用户名或密码错误
- 网络访问未配置（MongoDB Atlas IP 白名单）

**解决方法：**
1. 检查连接字符串格式
2. 验证用户名和密码
3. 在 MongoDB Atlas 中配置网络访问：`0.0.0.0/0`（允许所有 IP）

### 问题2：CORS 错误

**可能原因：**
- `FRONTEND_URL` 配置错误
- 前端 URL 与实际部署地址不匹配

**解决方法：**
1. 检查 `FRONTEND_URL` 是否正确
2. 确保包含完整 URL（包括 `https://`）
3. 重新部署项目

### 问题3：环境变量未生效

**可能原因：**
- 环境变量配置后未重新部署
- 选择了错误的环境（Production/Preview/Development）

**解决方法：**
1. 确保选择正确的环境类型
2. 配置后重新部署项目
3. 检查部署日志确认环境变量已加载

### 问题4：JWT Secret 错误

**可能原因：**
- Secret 太短（少于32字符）
- 包含特殊字符导致解析错误

**解决方法：**
1. 使用至少32字符的随机字符串
2. 避免特殊字符，使用字母和数字
3. 使用上述生成方法重新生成

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

- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas 连接指南](./MongoDB%20Atlas配置指南.md)
- [完整部署方案](./Vercel后端+GitHub%20Pages前端部署方案.md)

---

## 💡 提示

1. **安全性**：不要在代码中硬编码环境变量，始终使用 Vercel 的环境变量功能
2. **备份**：记录下您的环境变量值，特别是 JWT_SECRET，丢失后无法恢复
3. **测试**：部署后立即测试 API 端点，确保所有功能正常
4. **日志**：遇到问题时查看 Vercel 日志，有助于快速定位问题

---

**配置完成后，您的后端就可以正常运行了！** 🎉
