# 📋 详细上线计划

## 🎯 目标

将完整的仓库管理系统部署到生产环境：
- **前端**：GitHub Pages（免费）
- **后端**：Vercel（免费）
- **数据库**：MongoDB Atlas（免费）

**总成本**：$0/月  
**预计时间**：1-2小时

---

## 📅 部署时间表

| 阶段 | 任务 | 预计时间 | 状态 |
|------|------|---------|------|
| 准备阶段 | 注册账号、准备环境 | 15分钟 | ⬜ |
| 数据库配置 | MongoDB Atlas设置 | 15分钟 | ⬜ |
| 后端部署 | Vercel部署 | 30分钟 | ⬜ |
| 前端部署 | GitHub Pages部署 | 30分钟 | ⬜ |
| 集成测试 | 功能测试和验证 | 30分钟 | ⬜ |
| 最终优化 | 性能优化和监控 | 15分钟 | ⬜ |

**总计**：约2小时

---

## 🔧 第一阶段：准备工作（15分钟）

### 1.0 Git初始化和提交（首次部署需要）

**⚠️ 重要**：如果项目还未提交到Git，请先完成这一步。

#### 快速方法（推荐）

在项目根目录运行：
```
初始化Git并提交.bat
```

然后运行：
```
连接到GitHub并推送.bat
```

#### 手动方法

详细步骤请查看：[Git设置指南](../../GIT_SETUP_GUIDE.md)

**快速命令**：
```bash
# 初始化Git仓库
git init

# 配置用户信息（首次使用需要）
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 添加文件
git add .

# 创建首次提交
git commit -m "Initial commit: Warehouse management system"

# 在GitHub创建仓库后，连接并推送
git remote add origin https://github.com/your-username/warehouse-management.git
git branch -M main
git push -u origin main
```

### 1.1 检查清单

在开始部署前，确保以下内容已准备：

- [ ] **项目代码已提交到Git** ✅（如果已完成上面的步骤）
  ```bash
  git status  # 检查是否有未提交的更改
  ```

- [ ] **GitHub账号已准备**
  - 访问 https://github.com
  - 如果没有账号，注册一个

- [ ] **邮箱和手机号已准备**
  - 用于注册各种服务

- [ ] **信用卡（仅用于验证，不扣费）**
  - MongoDB Atlas 和 Vercel 可能需要

### 1.2 注册账号

#### A. GitHub账号（前端部署需要）

1. 访问 https://github.com
2. 点击 "Sign up"
3. 填写信息并验证邮箱
4. 创建新仓库：
   - 仓库名：`warehouse-management`
   - 选择 Public（GitHub Pages需要）
   - 初始化 README（可选）

#### B. Vercel账号（后端部署需要）

1. 访问 https://vercel.com
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"（推荐）
4. 授权GitHub访问

#### C. MongoDB Atlas账号（数据库需要）

1. 访问 https://www.mongodb.com/cloud/atlas
2. 点击 "Try Free"
3. 填写注册信息
4. 验证邮箱

---

## 🗄️ 第二阶段：数据库配置（15分钟）

### 2.1 创建MongoDB Atlas集群

#### 步骤1：创建集群（5分钟）

1. 登录MongoDB Atlas控制台
2. 点击 "Build a Database"
3. 选择 **FREE** (M0) 集群
4. 选择云服务商和地域：
   - 推荐：**AWS** 和 **Asia Pacific (ap-southeast-1)** （新加坡）
   - 或选择离你最近的区域
5. 集群名称：`WarehouseCluster`（或自定义）
6. 点击 "Create"

**等待时间**：约3-5分钟（集群创建中）

#### 步骤2：配置数据库用户（3分钟）

1. 在 "Security" → "Database Access"
2. 点击 "Add New Database User"
3. 配置：
   - **Authentication Method**: Password
   - **Username**: `warehouse_admin`（或自定义）
   - **Password**: 点击 "Autogenerate Secure Password" 或自己设置
   - **⚠️ 重要**：复制并保存密码！
   - **Database User Privileges**: Read and write to any database
4. 点击 "Add User"

**保存信息**：
```
用户名: warehouse_admin
密码: [保存到安全的地方]
```

#### 步骤3：配置网络访问（2分钟）

1. 在 "Security" → "Network Access"
2. 点击 "Add IP Address"
3. 选择 "Allow Access from Anywhere"（开发阶段）
   - IP Address: `0.0.0.0/0`
   - Comment: "Allow all IPs"
4. 点击 "Confirm"

**⚠️ 安全提示**：生产环境建议只允许特定IP

#### 步骤4：获取连接字符串（5分钟）

1. 在 "Database" → 点击 "Connect"
2. 选择 "Connect your application"
3. 选择：
   - **Driver**: Node.js
   - **Version**: 5.5 or later
4. 复制连接字符串，格式：
   ```
   mongodb+srv://warehouse_admin:<password>@warehousecluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **替换 `<password>`** 为你的实际密码

**最终连接字符串示例**：
```
mongodb+srv://warehouse_admin:MyPassword123!@warehousecluster.xxxxx.mongodb.net/warehouse_management?retryWrites=true&w=majority
```

### 2.2 测试数据库连接（可选）

使用MongoDB Compass或命令行工具测试连接。

---

## 🚀 第三阶段：后端部署到Vercel（30分钟）

### 3.1 准备代码（5分钟）

#### 检查文件

确保以下文件存在：

```
backend/
├── api/
│   └── index.js          ✅ Vercel入口文件
├── vercel.json           ✅ Vercel配置文件
├── server.js             ✅ Express应用
├── package.json          ✅ 依赖配置
└── routes/               ✅ API路由
```

#### 提交代码到GitHub

```bash
# 在项目根目录
git init  # 如果还没有初始化
git add .
git commit -m "Prepare for Vercel deployment"
git branch -M main
git remote add origin https://github.com/your-username/warehouse-management.git
git push -u origin main
```

**替换** `your-username` 为你的GitHub用户名

### 3.2 在Vercel中创建项目（10分钟）

#### 步骤1：导入项目

1. 登录Vercel控制台：https://vercel.com/dashboard
2. 点击 **"Add New..."** → **"Project"**
3. 如果已连接GitHub，选择你的仓库 `warehouse-management`
4. 如果没有连接，点击 "Import Git Repository" 并授权GitHub

#### 步骤2：配置项目设置

**⚠️ 重要配置**：

1. **Project Name**: `warehouse-backend`（或自定义）
2. **Framework Preset**: 选择 **Other**
3. **Root Directory**: 点击 "Edit" → 输入 `backend`
   - 这告诉Vercel后端代码在backend目录
4. **Build Command**: 留空（或 `npm install`）
5. **Output Directory**: 留空
6. **Install Command**: `npm install`

**配置截图要点**：
- Root Directory必须设置为 `backend`
- Framework Preset选择 Other

#### 步骤3：配置环境变量（关键步骤）

点击 "Environment Variables"，添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `MONGODB_URI` | `mongodb+srv://...` | 数据库连接字符串（第二阶段获取） |
| `JWT_SECRET` | 生成32位随机字符串 | JWT密钥，至少32字符 |
| `NODE_ENV` | `production` | 环境标识 |
| `FRONTEND_URL` | `https://your-username.github.io` | 前端URL（用于CORS） |

**生成JWT_SECRET的方法**：
```bash
# 在命令行运行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**或使用在线工具**：https://randomkeygen.com/

**环境变量配置示例**：
```
MONGODB_URI=mongodb+srv://warehouse_admin:MyPassword123!@warehousecluster.xxxxx.mongodb.net/warehouse_management?retryWrites=true&w=majority
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
NODE_ENV=production
FRONTEND_URL=https://your-username.github.io
```

**⚠️ 重要**：
- 每个变量都要单独添加
- 确保值正确，没有多余空格
- `FRONTEND_URL` 先填写临时值，前端部署后更新

#### 步骤4：部署

1. 点击 **"Deploy"**
2. 等待部署完成（约2-5分钟）
3. 观察部署日志，确保没有错误

### 3.3 获取后端API地址（2分钟）

部署完成后：

1. 在项目页面，你会看到：
   - **Production URL**: `https://warehouse-backend-xxxxx.vercel.app`
2. **复制这个URL**，这是你的后端API地址

**API地址格式**：
```
https://your-project-name.vercel.app/api
```

**测试API**：
```bash
# 在浏览器访问或使用curl
curl https://your-project-name.vercel.app/api/health
```

**期望返回**：
```json
{"status":"ok","message":"服务器运行正常"}
```

### 3.4 配置自定义域名（可选，5分钟）

如果需要自定义域名（如 `api.yourdomain.com`）：

1. 在Vercel项目设置 → **Settings** → **Domains**
2. 输入域名：`api.yourdomain.com`
3. 按照提示配置DNS记录
4. 等待DNS生效（几分钟到几小时）

---

## 🎨 第四阶段：前端部署到GitHub Pages（30分钟）

### 4.1 配置前端代码（10分钟）

#### 步骤1：更新package.json

打开 `frontend/package.json`，确保有以下配置：

```json
{
  "homepage": "https://your-username.github.io/warehouse-management",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

**替换**：
- `your-username` → 你的GitHub用户名
- `warehouse-management` → 你的仓库名

#### 步骤2：创建生产环境变量文件

创建 `frontend/.env.production`：

```env
REACT_APP_API_URL=https://your-project-name.vercel.app/api
```

**替换** `your-project-name.vercel.app` 为你的Vercel项目URL

#### 步骤3：更新CORS配置（如果需要）

如果后端部署成功，需要更新 `backend/server.js` 中的CORS：

```javascript
const corsOptions = {
  origin: [
    'https://your-username.github.io',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

然后重新部署后端。

### 4.2 配置GitHub Actions（10分钟）

#### 步骤1：检查GitHub Actions文件

确保文件存在：`frontend/.github/workflows/deploy.yml`

如果不存在，创建它（参考之前的文档）

#### 步骤2：配置GitHub Pages

1. 在GitHub仓库页面
2. 点击 **Settings** → **Pages**
3. 在 **Source** 选择：**GitHub Actions**
4. 保存

#### 步骤3：配置Secrets（可选）

如果需要自定义API地址：

1. 在仓库页面 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加：
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-project-name.vercel.app/api`

### 4.3 部署前端（10分钟）

#### 方法1：使用GitHub Actions（自动）

1. **推送代码到GitHub**：
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

2. **查看部署状态**：
   - 在GitHub仓库页面
   - 点击 **Actions** 标签
   - 查看部署工作流状态

3. **等待部署完成**（约5-10分钟）

4. **访问网站**：
   ```
   https://your-username.github.io/warehouse-management
   ```

#### 方法2：使用gh-pages（手动）

```bash
cd frontend
npm install --save-dev gh-pages
npm run deploy
```

### 4.4 验证前端部署

1. 访问：`https://your-username.github.io/warehouse-management`
2. 检查页面是否正常加载
3. 打开浏览器开发者工具（F12）
4. 检查Console是否有错误
5. 检查Network标签，确认API请求是否正常

---

## ✅ 第五阶段：集成测试和验证（30分钟）

### 5.1 API功能测试

#### 测试1：健康检查

```bash
curl https://your-project-name.vercel.app/api/health
```

**期望**：`{"status":"ok","message":"服务器运行正常"}`

#### 测试2：API根路径

```bash
curl https://your-project-name.vercel.app/api
```

**期望**：返回API端点列表

#### 测试3：CORS测试

在浏览器控制台运行：
```javascript
fetch('https://your-project-name.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

**期望**：成功返回数据，没有CORS错误

### 5.2 前端功能测试

#### 测试清单

- [ ] **页面加载**
  - 访问首页，页面正常显示
  - Logo和样式正常

- [ ] **未登录访问**
  - 可以查看信息页面
  - 可以查看批次页面
  - 不能访问录入页面（正确）

- [ ] **用户注册**
  - 点击注册
  - 填写信息
  - 注册成功，自动登录

- [ ] **用户登录**
  - 使用注册的账号登录
  - 登录成功，跳转到用户页面

- [ ] **订单管理**
  - 创建订单
  - 查看订单列表
  - 搜索订单
  - 更新订单
  - 删除订单

- [ ] **批次管理**
  - 查看批次列表
  - 查看批次详情
  - 创建批次（管理员）
  - 导出批次

- [ ] **消息功能**
  - 发送消息
  - 接收消息
  - 消息列表更新

- [ ] **管理员功能**（如果有管理员账号）
  - 管理员登录
  - 访问管理端页面
  - 管理用户
  - 管理订单
  - 管理批次

### 5.3 性能测试

- [ ] 页面加载速度（应该在3秒内）
- [ ] API响应速度（应该在1秒内）
- [ ] 图片和资源加载正常

### 5.4 跨浏览器测试

测试以下浏览器：
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] 移动端浏览器（Chrome Mobile, Safari Mobile）

---

## 🔧 第六阶段：最终优化和监控（15分钟）

### 6.1 更新配置

#### 更新后端CORS（如果前端URL已确定）

在Vercel中更新 `FRONTEND_URL` 环境变量：
1. Vercel控制台 → 项目 → Settings → Environment Variables
2. 编辑 `FRONTEND_URL`
3. 重新部署

#### 更新前端API地址（如果需要）

更新 `frontend/.env.production`，重新构建部署

### 6.2 配置监控

#### Vercel监控

1. 在Vercel项目页面
2. 查看 **Analytics** 和 **Logs**
3. 设置告警（可选）

#### 错误监控（可选）

- 考虑集成Sentry等错误监控服务
- 或使用Vercel内置的日志功能

### 6.3 性能优化

- [ ] 启用Gzip压缩（Vercel自动）
- [ ] 配置CDN缓存（GitHub Pages和Vercel都自动）
- [ ] 优化图片大小
- [ ] 减少API请求次数

---

## 🐛 故障排查指南

### 问题1：后端API无法访问

**症状**：404错误或连接超时

**排查步骤**：
1. 检查Vercel部署状态
2. 检查API URL是否正确
3. 检查环境变量是否配置
4. 查看Vercel日志：项目 → Logs

**常见原因**：
- 环境变量配置错误
- 代码错误导致部署失败
- 网络问题

### 问题2：CORS错误

**症状**：浏览器控制台显示CORS错误

**解决方法**：
1. 检查 `FRONTEND_URL` 环境变量
2. 更新后端CORS配置
3. 重新部署后端

### 问题3：数据库连接失败

**症状**：API返回500错误，日志显示数据库连接失败

**排查步骤**：
1. 检查 `MONGODB_URI` 是否正确
2. 检查MongoDB Atlas网络访问配置
3. 检查数据库用户名和密码
4. 测试连接字符串

### 问题4：前端无法加载

**症状**：页面显示404或空白

**排查步骤**：
1. 检查GitHub Pages部署状态
2. 检查仓库设置 → Pages配置
3. 检查 `homepage` 配置
4. 查看GitHub Actions日志

### 问题5：登录功能异常

**症状**：无法登录或登录后立即退出

**排查步骤**：
1. 检查JWT_SECRET配置
2. 检查Token存储（localStorage）
3. 检查API响应
4. 查看浏览器控制台错误

---

## 📋 部署后检查清单

### 基础设施
- [ ] 后端API可以访问
- [ ] 前端网站可以访问
- [ ] 数据库连接正常
- [ ] HTTPS正常工作

### 功能
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] 订单CRUD功能正常
- [ ] 批次管理功能正常
- [ ] 消息功能正常
- [ ] 导出功能正常

### 安全
- [ ] 环境变量已配置
- [ ] JWT密钥已设置
- [ ] 数据库密码已设置
- [ ] CORS已正确配置

### 性能
- [ ] 页面加载速度正常
- [ ] API响应速度正常
- [ ] 资源加载正常

---

## 📞 获取帮助

如果遇到问题：

1. **查看文档**：
   - [Vercel部署指南](./VERCEL_DEPLOYMENT.md)
   - [GitHub Pages部署指南](./GITHUB_PAGES_DEPLOYMENT.md)
   - [故障排查指南](#故障排查指南)

2. **查看日志**：
   - Vercel：项目 → Logs
   - GitHub Actions：仓库 → Actions

3. **社区支持**：
   - Vercel社区：https://github.com/vercel/vercel/discussions
   - GitHub Pages文档：https://docs.github.com/pages

---

## 🎉 部署完成

恭喜！您的应用已成功部署！

### 访问地址

- **前端**：`https://your-username.github.io/warehouse-management`
- **后端API**：`https://your-project-name.vercel.app/api`
- **API文档**：`https://your-project-name.vercel.app/api`（查看端点列表）

### 下一步

1. **创建管理员账号**：
   ```bash
   # 在本地运行
   cd backend
   npm run create-admin
   ```

2. **监控应用**：
   - 定期查看Vercel日志
   - 监控API响应时间
   - 检查错误率

3. **备份数据**：
   - MongoDB Atlas提供自动备份
   - 定期导出重要数据

4. **持续改进**：
   - 收集用户反馈
   - 优化性能
   - 添加新功能

---

## 📝 重要信息记录

请记录以下信息（保存在安全的地方）：

```
=== 部署信息 ===
部署日期: ___________
部署人员: ___________

=== GitHub ===
用户名: ___________
仓库名: ___________
前端URL: https://___________.github.io/___________

=== Vercel ===
项目名: ___________
API URL: https://___________.vercel.app/api

=== MongoDB Atlas ===
集群名: ___________
用户名: ___________
密码: ___________
连接字符串: mongodb+srv://...

=== 环境变量 ===
JWT_SECRET: ___________

=== 管理员账号 ===
用户名: ___________
密码: ___________
```

---

**祝部署顺利！** 🚀

如有任何问题，请参考故障排查章节或查看详细文档。
