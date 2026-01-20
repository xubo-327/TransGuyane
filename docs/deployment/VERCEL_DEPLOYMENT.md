# Vercel 后端部署指南

## 📋 概述

Vercel是一个现代化的部署平台，特别适合Serverless函数和Node.js应用。本指南将帮助您将后端API部署到Vercel。

## 🎯 Vercel的优势

- ✅ **完全免费**（Hobby计划）
- ✅ 自动HTTPS和CDN
- ✅ 全球边缘网络
- ✅ 自动部署（GitHub集成）
- ✅ Serverless函数，按需计费
- ✅ 零配置部署

## 🆓 免费额度

**Vercel Hobby计划（免费）**：
- 无限请求
- 100GB带宽/月
- 无服务器函数执行时间限制（Hobby计划）
- 自动HTTPS
- 全球CDN

## 🚀 部署步骤

### 第一步：准备工作

#### 1.1 注册Vercel账号

1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 使用GitHub账号登录（推荐，便于后续集成）

#### 1.2 准备项目

确保项目结构正确：

```
backend/
├── api/
│   └── index.js          # Vercel Serverless入口（已创建）
├── routes/               # API路由
├── models/               # 数据模型
├── middleware/           # 中间件
├── server.js             # Express应用（已修改）
├── vercel.json           # Vercel配置（已创建）
└── package.json          # 依赖配置
```

### 第二步：配置环境变量

#### 2.1 在Vercel中配置

1. 登录Vercel控制台
2. 创建新项目后，进入项目设置
3. 导航到 **Settings** → **Environment Variables**
4. 添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas连接字符串 |
| `JWT_SECRET` | `your_secret_key` | JWT密钥（至少32字符） |
| `NODE_ENV` | `production` | 环境变量 |
| `FRONTEND_URL` | `https://your-username.github.io` | 前端URL（用于CORS） |
| `WECHAT_APPID` | `your_appid` | 微信AppID（可选） |
| `WECHAT_SECRET` | `your_secret` | 微信Secret（可选） |

#### 2.2 环境变量格式

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/warehouse_management?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_secret_key_at_least_32_characters_long
NODE_ENV=production
FRONTEND_URL=https://your-username.github.io
```

### 第三步：部署到Vercel

#### 方法一：通过GitHub集成（推荐）

##### 3.1 将项目推送到GitHub

```bash
# 在项目根目录
git init
git add .
git commit -m "Add Vercel deployment configuration"
git branch -M main
git remote add origin https://github.com/your-username/warehouse-management.git
git push -u origin main
```

##### 3.2 在Vercel中导入项目

1. 登录Vercel控制台
2. 点击 **Add New...** → **Project**
3. 选择你的GitHub仓库
4. 选择仓库后，配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: 留空（或 `npm install`）
   - **Output Directory**: 留空
   - **Install Command**: `npm install`

5. 点击 **Deploy**

##### 3.3 配置环境变量

在部署前，确保已添加所有环境变量（参考第二步）

#### 方法二：使用Vercel CLI

##### 3.1 安装Vercel CLI

```bash
npm install -g vercel
```

##### 3.2 登录Vercel

```bash
vercel login
```

##### 3.3 部署项目

```bash
cd backend
vercel
```

按照提示操作：
- 选择项目设置
- 配置环境变量
- 确认部署

##### 3.4 生产环境部署

```bash
vercel --prod
```

### 第四步：配置自定义域名（可选）

1. 在Vercel项目设置中，进入 **Settings** → **Domains**
2. 添加你的域名（如：`api.yourdomain.com`）
3. 按照提示配置DNS记录
4. Vercel会自动配置SSL证书

### 第五步：配置CORS

确保后端CORS配置包含前端URL：

```javascript
// backend/server.js
const corsOptions = {
  origin: [
    'https://your-username.github.io',  // GitHub Pages
    'https://yourdomain.com',            // 自定义域名
    'http://localhost:3000'              // 开发环境
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## 🔧 Vercel配置说明

### vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

**配置说明**：
- `builds`: 指定使用Node.js运行时
- `routes`: 将所有 `/api/*` 请求路由到 `api/index.js`
- `version`: 使用Vercel 2.0配置格式

### api/index.js

```javascript
// Vercel Serverless 函数入口
const app = require('../server');
module.exports = app;
```

这个文件作为Serverless函数的入口点，导出Express应用。

## 📊 部署检查清单

- [ ] Vercel账号已注册
- [ ] 项目已推送到GitHub
- [ ] vercel.json已创建
- [ ] api/index.js已创建
- [ ] server.js已导出app
- [ ] 环境变量已配置
- [ ] CORS已配置
- [ ] 项目已部署
- [ ] API可以访问
- [ ] 功能测试通过

## 🧪 测试部署

### 1. 测试健康检查

```bash
curl https://your-project.vercel.app/api/health
```

应该返回：
```json
{"status":"ok","message":"服务器运行正常"}
```

### 2. 测试API根路径

```bash
curl https://your-project.vercel.app/api
```

### 3. 测试完整功能

1. 访问前端网站
2. 尝试登录/注册
3. 测试各项功能
4. 检查控制台是否有错误

## 🔄 自动部署

### GitHub集成

当您推送代码到GitHub时，Vercel会自动：
1. 检测代码变更
2. 构建项目
3. 运行部署
4. 更新生产环境

**分支部署**：
- `main` 分支 → 生产环境
- 其他分支 → 预览环境

### 手动部署

使用Vercel CLI：

```bash
cd backend
vercel --prod
```

## 🐛 常见问题

### 1. 函数超时

**原因**：Serverless函数执行时间限制

**解决**：
- Hobby计划：10秒超时
- 优化数据库查询
- 使用连接池
- 考虑异步处理长时间任务

### 2. MongoDB连接问题

**原因**：Serverless环境连接管理问题

**解决**：
- 使用MongoDB Atlas（云数据库）
- 配置连接池
- 处理冷启动连接

### 3. 环境变量未生效

**原因**：环境变量配置错误

**解决**：
- 检查环境变量名称是否正确
- 确保已保存环境变量
- 重新部署项目

### 4. CORS错误

**原因**：CORS配置不正确

**解决**：
- 检查前端URL是否正确
- 更新CORS配置
- 重新部署

## 🔒 安全建议

1. **环境变量安全**
   - 不要在前端代码中暴露敏感信息
   - 使用Vercel环境变量存储密钥

2. **API密钥管理**
   - 定期轮换JWT_SECRET
   - 使用强密码

3. **数据库安全**
   - 使用MongoDB Atlas IP白名单
   - 使用强密码

## 📈 性能优化

### 1. 数据库连接优化

```javascript
// 使用连接池
mongoose.connect(mongoUri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 2. 缓存策略

- 使用Redis缓存（可选）
- 实现API响应缓存
- 使用Vercel Edge Functions（高级功能）

### 3. 代码分割

- 优化依赖包大小
- 使用动态导入
- 移除未使用的依赖

## 💡 Vercel CLI命令

```bash
# 登录
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod

# 查看部署日志
vercel logs

# 查看项目信息
vercel inspect

# 删除部署
vercel remove
```

## 📚 相关文档

- [Vercel官方文档](https://vercel.com/docs)
- [Vercel Node.js运行时](https://vercel.com/docs/runtimes)
- [MongoDB Atlas文档](https://docs.atlas.mongodb.com/)
- [完整部署方案](./DEPLOYMENT_PLAN.md)
- [GitHub Pages部署指南](./GITHUB_PAGES_DEPLOYMENT.md)

## 🎉 总结

使用Vercel部署后端具有以下优势：

✅ **完全免费**（Hobby计划）
✅ **自动HTTPS和CDN**
✅ **全球边缘网络**
✅ **自动部署**
✅ **易于维护**

**总成本：$0/月** 🆓

---

**最后更新**：2026年1月
