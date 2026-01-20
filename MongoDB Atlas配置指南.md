# MongoDB Atlas 云数据库配置指南

## 简介

MongoDB Atlas 是 MongoDB 官方的云数据库服务，无需本地安装 MongoDB，即可使用数据库功能。

## 步骤 1: 注册 MongoDB Atlas 账号

1. 访问：https://www.mongodb.com/cloud/atlas/register
2. 使用邮箱注册账号（支持 Gmail、GitHub 等快速注册）
3. 完成邮箱验证

## 步骤 2: 创建免费集群

1. 登录后，点击 **"Build a Database"** 或 **"Create"** 按钮
2. 选择 **FREE (M0)** 免费套餐
3. 选择云服务商和区域（建议选择离您最近的区域，如 Asia Pacific）
4. 集群名称可以保持默认或自定义（如 `Cluster0`）
5. 点击 **"Create Cluster"** 创建集群
6. 等待 3-5 分钟，集群创建完成

## 步骤 3: 配置数据库用户

1. 在集群创建过程中或完成后，会提示创建数据库用户
2. 输入用户名（如：`warehouse_admin`）
3. 输入密码（建议使用强密码，至少 8 位）
4. **重要**：请记住用户名和密码，后续会用到
5. 选择用户权限：**"Read and write to any database"**
6. 点击 **"Create Database User"**

## 步骤 4: 配置网络访问

1. 在左侧菜单找到 **"Network Access"** 或 **"Security" -> "Network Access"**
2. 点击 **"Add IP Address"**
3. 为了方便开发，可以选择：
   - **"Allow Access from Anywhere"** (0.0.0.0/0) - 允许所有 IP（适合开发环境）
   - 或添加您的具体 IP 地址（更安全）
4. 点击 **"Confirm"**

## 步骤 5: 获取连接字符串

1. 在集群页面，点击 **"Connect"** 按钮
2. 选择 **"Connect your application"**
3. 选择驱动：**"Node.js"**，版本选择 **"5.5 or later"**
4. 复制连接字符串，格式如下：
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **重要修改**：
   - 将 `<username>` 替换为您创建的数据库用户名
   - 将 `<password>` 替换为您创建的数据库密码
   - 在 `mongodb.net/` 后面添加数据库名称，如：`warehouse_management`
   
   最终格式示例：
   ```
   mongodb+srv://warehouse_admin:yourpassword@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true&w=majority
   ```

## 步骤 6: 配置项目

### 方法一：使用配置脚本（推荐）

1. 双击运行 `配置MongoDB Atlas.bat`
2. 选择 `Y` 使用云数据库
3. 粘贴您的连接字符串
4. 完成配置

### 方法二：手动配置

1. 打开 `backend/.env` 文件
2. 找到 `MONGODB_URI` 这一行
3. 替换为您的 MongoDB Atlas 连接字符串：
   ```
   MONGODB_URI=mongodb+srv://warehouse_admin:yourpassword@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true&w=majority
   ```
4. 保存文件

## 步骤 7: 测试连接

运行以下命令测试连接：

```bash
cd backend
node scripts\createAdmin.js
```

如果看到 `MongoDB连接成功` 或 `MongoDB Atlas (云数据库) 连接成功`，说明配置正确！

## 常见问题

### 1. 连接超时

**问题**：`MongoServerSelectionError: connection timed out`

**解决方案**：
- 检查网络访问设置，确保 IP 地址已添加到白名单
- 检查防火墙设置
- 尝试使用 `Allow Access from Anywhere` (0.0.0.0/0)

### 2. 认证失败

**问题**：`Authentication failed`

**解决方案**：
- 检查用户名和密码是否正确
- 确保连接字符串中的用户名和密码已正确替换
- URL 编码：如果密码包含特殊字符，需要进行 URL 编码
  - `@` → `%40`
  - `:` → `%3A`
  - `/` → `%2F`
  - `?` → `%3F`
  - `#` → `%23`
  - `&` → `%26`

### 3. 找不到数据库

**问题**：数据库操作失败

**解决方案**：
- MongoDB Atlas 会在首次写入时自动创建数据库
- 确保连接字符串中包含了数据库名称：`mongodb.net/warehouse_management`

### 4. 连接字符串格式错误

**正确的格式**：
```
mongodb+srv://用户名:密码@集群地址.mongodb.net/数据库名?retryWrites=true&w=majority
```

**注意**：
- 不要包含 `<` 和 `>` 符号
- 密码中的特殊字符需要进行 URL 编码
- 数据库名应放在 `.net/` 之后，`?` 之前

## 免费套餐限制

MongoDB Atlas 免费套餐 (M0) 的限制：
- 512 MB 存储空间
- 共享 CPU 和 RAM
- 适合开发和测试环境
- 对于生产环境，建议升级到付费套餐

## 安全建议

1. **生产环境**：
   - 不要在连接字符串中硬编码密码
   - 使用环境变量存储敏感信息
   - 限制网络访问 IP 地址
   - 使用强密码

2. **开发环境**：
   - 可以使用 `0.0.0.0/0` 允许所有 IP
   - 但建议为团队成员单独添加 IP 地址

## 下一步

配置完成后：
1. 启动后端服务：`cd backend && npm run dev`
2. 创建管理员账号：`cd backend && node scripts\createAdmin.js`
3. 启动前端服务：`cd frontend && npm start`

祝您使用愉快！
