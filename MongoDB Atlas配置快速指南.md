# MongoDB Atlas 配置快速指南

## 🎯 目标

配置 MongoDB Atlas 云数据库，获取连接字符串，用于 Vercel 后端部署。

---

## 📋 第一步：注册 MongoDB Atlas 账号

1. **访问 MongoDB Atlas 官网**
   - 打开：https://www.mongodb.com/cloud/atlas/register

2. **注册账号**
   - 使用邮箱注册（支持 Gmail、GitHub 等快速注册）
   - 完成邮箱验证

---

## 🚀 第二步：创建免费集群

1. **登录后，创建数据库**
   - 点击 **"Build a Database"** 或 **"Create"** 按钮

2. **选择免费套餐**
   - 选择 **FREE (M0)** 套餐（完全免费）
   - 存储空间：512 MB（足够开发使用）

3. **选择云服务商和区域**
   - 云服务商：选择 **AWS**（推荐）
   - 区域：选择 **Asia Pacific (ap-southeast-1) - Singapore**（离中国最近）
   - 或选择 **Asia Pacific (ap-northeast-1) - Tokyo**

4. **创建集群**
   - 集群名称：保持默认 `Cluster0` 或自定义
   - 点击 **"Create Cluster"**
   - ⏱️ 等待 3-5 分钟，集群创建完成

---

## 👤 第三步：创建数据库用户

1. **进入数据库用户设置**
   - 在集群创建过程中会提示创建数据库用户
   - 或在左侧菜单找到 **"Database Access"** → 点击 **"Add New Database User"**

2. **配置用户信息**
   - **认证方式**：选择 **"Password"**
   - **用户名**：输入用户名（如：`admin` 或 `warehouse_admin`）
   - **密码**：输入密码（至少 8 位，请妥善保存）
     - ⚠️ **重要**：请记住用户名和密码，后续会用到
     - 建议使用强密码：字母+数字+特殊字符
   - **用户权限**：选择 **"Read and write to any database"**

3. **创建用户**
   - 点击 **"Add User"**
   - 用户创建完成

---

## 🌐 第四步：配置网络访问（关键步骤）

这一步很关键，允许 Vercel 服务器访问您的数据库。

1. **进入网络访问设置**
   - 在左侧菜单找到 **"Network Access"**
   - 或点击 **"Security"** → **"Network Access"**

2. **添加 IP 地址**
   - 点击 **"Add IP Address"** 按钮

3. **配置访问规则**
   - 选择 **"Allow Access from Anywhere"**
   - 这会自动添加 `0.0.0.0/0`（允许所有 IP 地址访问）
   - ⚠️ **说明**：这对于 Vercel Serverless 函数是必需的，因为 Vercel 的 IP 地址是动态的

4. **确认添加**
   - 点击 **"Confirm"**
   - ⏱️ 等待 1-2 分钟生效

---

## 🔗 第五步：获取连接字符串

1. **进入连接设置**
   - 在集群页面，找到 **"Connect"** 按钮
   - 点击 **"Connect"**

2. **选择连接方式**
   - 选择 **"Connect your application"**（连接您的应用程序）

3. **选择驱动和版本**
   - **驱动**：选择 **"Node.js"**
   - **版本**：选择 **"5.5 or later"**

4. **复制连接字符串**
   - 您会看到一个类似这样的字符串：
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - 点击 **"Copy"** 复制

5. **修改连接字符串**
   - 将 `<username>` 替换为您创建的数据库用户名
   - 将 `<password>` 替换为您创建的数据库密码
   - 在 `.mongodb.net/` 后面、`?` 前面添加数据库名称：`warehouse_management`

   **最终格式示例：**
   ```
   mongodb+srv://admin:MyPassword123@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true&w=majority
   ```

   **格式说明：**
   ```
   mongodb+srv://用户名:密码@集群地址.mongodb.net/数据库名?retryWrites=true&w=majority
   ```

---

## ⚠️ 重要提示

### 密码特殊字符处理

如果您的密码包含特殊字符，需要进行 **URL 编码**：

| 字符 | URL 编码 |
|------|----------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| `&` | `%26` |
| `%` | `%25` |
| ` ` (空格) | `%20` |

**示例：**
- 原始密码：`My@Pass#123`
- URL 编码后：`My%40Pass%23123`

### 完整的连接字符串格式

```
mongodb+srv://用户名:密码@cluster0.xxxxx.mongodb.net/warehouse_management?retryWrites=true&w=majority
```

**各部分说明：**
- `mongodb+srv://` - MongoDB 连接协议（SRV 记录）
- `用户名:密码` - 数据库用户凭据
- `@cluster0.xxxxx.mongodb.net` - 集群地址
- `/warehouse_management` - 数据库名称
- `?retryWrites=true&w=majority` - 连接参数

---

## ✅ 第六步：验证连接字符串

### 方法一：在 Vercel 中测试

1. 登录 Vercel：https://vercel.com
2. 进入项目 → **Settings** → **Environment Variables**
3. 添加 `MONGODB_URI` 环境变量
4. 重新部署项目
5. 查看部署日志，应该看到：`MongoDB Atlas (云数据库) 连接成功`

### 方法二：使用脚本测试（本地）

1. 创建临时测试文件 `test-mongo.js`：
   ```javascript
   const mongoose = require('mongoose');
   require('dotenv').config();
   
   const uri = process.env.MONGODB_URI;
   
   console.log('正在连接数据库...');
   mongoose.connect(uri, {
     useNewUrlParser: true,
     useUnifiedTopology: true,
   })
   .then(() => {
     console.log('✅ MongoDB Atlas 连接成功！');
     console.log('数据库:', mongoose.connection.name);
     mongoose.connection.close();
     process.exit(0);
   })
   .catch(err => {
     console.error('❌ 连接失败:', err.message);
     process.exit(1);
   });
   ```

2. 在 `backend` 目录下运行：
   ```bash
   cd backend
   node test-mongo.js
   ```

---

## 🐛 常见问题排查

### 问题 1：连接超时

**错误信息：**
```
MongoServerSelectionError: connection timed out
```

**解决方法：**
1. 检查 **Network Access** 设置
2. 确保已添加 `0.0.0.0/0`（允许所有 IP）
3. 等待 1-2 分钟让设置生效

### 问题 2：认证失败

**错误信息：**
```
Authentication failed
```

**解决方法：**
1. 检查用户名和密码是否正确
2. 确保连接字符串中的用户名和密码已正确替换
3. 如果密码包含特殊字符，进行 URL 编码

### 问题 3：找不到数据库

**说明：**
- MongoDB Atlas 会在首次写入数据时自动创建数据库
- 确保连接字符串中包含数据库名称：`mongodb.net/warehouse_management`

---

## 📊 检查清单

配置完成后，确认以下项目：

- [ ] MongoDB Atlas 账号已注册
- [ ] 免费集群已创建（FREE M0）
- [ ] 数据库用户已创建（用户名和密码已保存）
- [ ] 网络访问已配置（允许 `0.0.0.0/0`）
- [ ] 连接字符串已获取并修改正确
- [ ] 连接字符串中包含数据库名称
- [ ] 如果密码有特殊字符，已进行 URL 编码

---

## 🎉 配置完成

配置完成后，您将获得：

✅ MongoDB Atlas 连接字符串  
✅ 可以在 Vercel 中使用此连接字符串配置 `MONGODB_URI` 环境变量

**下一步：**
1. 将连接字符串复制
2. 在 Vercel 项目设置中添加 `MONGODB_URI` 环境变量
3. 重新部署项目
4. 测试数据库连接

---

## 📚 相关文档

- [Vercel 数据库配置完整步骤](./Vercel数据库配置完整步骤.md)
- [MongoDB Atlas 配置指南](./MongoDB%20Atlas配置指南.md)
- [Vercel 后端部署指南](./docs/deployment/VERCEL_DEPLOYMENT.md)

---

**配置完成后，请告诉我您的连接字符串（可以隐藏密码部分），我会帮您验证格式是否正确！** 🔒
