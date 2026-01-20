# 项目部署计划 (基于 GitHub)

根据您的要求，本计划旨在将现有的 MERN (MongoDB, Express, React, Node.js) 堆栈项目部署到云端，并使用 GitHub 进行代码托管和版本控制。

本方案选择 **GitHub** 作为代码仓库，**Render** 作为后端和数据库托管平台（或继续使用 MongoDB Atlas），**Vercel** 或 **Render** 作为前端托管。这是一个现代、低成本且维护简便的方案。

## 1. 架构总览
- **代码仓库**: GitHub (私有仓库)
- **数据库**: MongoDB Atlas (云数据库) - *目前已配置*
- **后端 API**: Render Web Service (Node.js)
- **前端页面**: Vercel (推荐) 或 GitHub Pages

---

## 2. 部署前清理与准备 (已完成部分)
为了确保部署顺利，我们已经进行了以下清理工作：
- [x] 清理了项目根目录下的临时报告和备份文件 (主要移动至 `archive` 目录)。
- [x] 删除了冗余的 `.env.backup` 文件。
- [ ] **关键检查**: 确保 `backend/.env` 中的 `MONGODB_URI` 连接字符串是有效的，并且指向 MongoDB Atlas (非本地 localhost)。

---

## 3. 详细部署步骤

### 第一步：代码托管至 GitHub
1.  **创建仓库**: 在 GitHub 上创建一个新的空仓库 (例如命名为 `warehouse-management-system`)。
2.  **提交代码**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit for deployment"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/warehouse-management-system.git
    git push -u origin main
    ```
    *(注意: 确保 `.gitignore` 包含 `node_modules` 和 `.env`，不要将敏感密钥上传到 GitHub)*

### 第二步：数据库配置 (MongoDB Atlas)
1.  **网络访问**: 登录 MongoDB Atlas 后台，在 `Network Access` 中添加 IP 地址 `0.0.0.0/0` (允许所有 IP 访问)，这是云部署的必要步骤，因为 Render 服务器的 IP 是动态的。
2.  **获取连接串**: 确保你手头有最新的 `MONGODB_URI` (在该计划的最后的环境变量部分备用)。

### 第三步：后端部署 (Render)
Render 是一个对 Node.js 非常友好的平台，支持自动从 GitHub 部署。
1.  注册/登录 [Render.com](https://render.com)。
2.  点击 **New +** -> **Web Service**。
3.  连接你的 GitHub 账号并选择刚才创建的 `warehouse-management-system` 仓库。
4.  **配置**:
    - **Name**: `warehouse-backend`
    - **Root Directory**: `backend` (非常重要，因为后端代码在子目录下)
    - **Environment**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
5.  **环境变量 (Environment Variables)**:
    - 添加 `MONGODB_URI`: 填入你的 Atlas 连接字符串。
    - 添加 `JWT_SECRET`: 设置一个复杂的字符串用于加密 Token。
    - 添加 `PORT`: `10000` (Render 默认端口，或者让代码适配 `process.env.PORT`)。
6.  点击 **Create Web Service**。Render 会自动构建并启动。启动成功后，你会获得一个 URL (例如 `https://warehouse-backend.onrender.com`)。

### 第四步：前端部署 (Vercel)
Vercel 是部署 React 应用的最佳选择，速度快且配置简单。
1.  注册/登录 [Vercel.com](https://vercel.com)。
2.  点击 **Add New...** -> **Project**。
3.  导入 GitHub 仓库 `warehouse-management-system`。
4.  **配置 Project Settings**:
    - **Framework Preset**: Create React App
    - **Root Directory**: 点击 Edit，选择 `frontend` 目录。
5.  **环境变量**:
    - 添加 `REACT_APP_API_URL`: 填入上一步获取的 **后端 URL** (例如 `https://warehouse-backend.onrender.com/api`)。注意末尾加上 `/api`（取决于你的路由前缀）。
6.  点击 **Deploy**。Vercel 会自动运行 `npm build` 并发布。

---

## 4. 一致性检查清单
在部署完成后，请进行以下一致性验证：

1.  **API 连接**: 访问前端部署后的网址，尝试登录。如果不能登录，检查浏览器控制台 (F12 -> Network) 的请求地址是否正确指向了 Render 的后端地址。
2.  **数据一致性**: 在前端录入一条测试数据，登录 MongoDB Atlas 查看 `orders` 集合，确认数据已写入。
3.  **管理员权限**: 确认在后端 `.env` (Render 环境变量) 中设置的密钥与逻辑生成的 Token 能被正确解析。

建议您先从**第一步：上传代码到 GitHub** 开始。如果您需要我协助执行 Git 命令，请告诉我您的 GitHub 仓库地址。
