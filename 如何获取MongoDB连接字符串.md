# 如何获取 MongoDB Atlas 连接字符串

## 📍 从 MongoDB Atlas 获取连接字符串

### 步骤 1: 登录 MongoDB Atlas

1. **访问 MongoDB Atlas**
   - 打开浏览器，访问：https://cloud.mongodb.com
   - 使用您的账号登录

### 步骤 2: 选择您的集群

1. **进入项目**
   - 登录后，如果您的账号中有多个项目，选择包含您数据库的项目
   - 默认情况下，您的集群会显示在主界面

2. **确认集群**
   - 查看集群名称（例如：`Cluster0`）
   - 确认集群状态为 **Running**（运行中）

### 步骤 3: 获取连接字符串

1. **点击 Connect（连接）按钮**
   - 在集群卡片上，找到并点击绿色的 **Connect**（连接）按钮
   - 或者点击集群名称进入详情页，然后点击 **Connect** 按钮

2. **选择连接方式**
   - 在弹出的对话框中，选择 **Connect your application**（连接您的应用程序）
   - ⚠️ **注意**：不要选择 "Connect with MongoDB Compass" 或 "Connect using MongoDB Shell"

3. **选择驱动和版本**
   - **Driver（驱动）**：选择 `Node.js`
   - **Version（版本）**：选择最新的稳定版本（例如：`5.5 or later`）

4. **复制连接字符串**
   - MongoDB Atlas 会显示一个连接字符串，格式类似：
     ```
     mongodb+srv://<username>:<password>@cluster0.4ooxxyp.mongodb.net/?appName=Cluster0
     ```
   - 点击 **Copy**（复制）按钮复制连接字符串

### 步骤 4: 替换用户名和密码

MongoDB Atlas 生成的连接字符串包含占位符 `<username>` 和 `<password>`，您需要替换为实际的用户名和密码。

**原始格式**：
```
mongodb+srv://<username>:<password>@cluster0.4ooxxyp.mongodb.net/?appName=Cluster0
```

**替换后**（使用您的实际用户名和密码）：
```
mongodb+srv://TransGuyane:clIn5TofaS4WRQVF@cluster0.4ooxxyp.mongodb.net/?appName=Cluster0
```

### 步骤 5: 添加数据库名称

⚠️ **重要**：MongoDB Atlas 生成的连接字符串默认**不包含数据库名称**，您需要手动添加。

**添加位置**：在 `.mongodb.net/` 之后，`?` 之前

**示例**：
```
mongodb+srv://TransGuyane:clIn5TofaS4WRQVF@cluster0.4ooxxyp.mongodb.net/warehouse_management?appName=Cluster0
                                                                                    ↑ 添加在这里
```

### 步骤 6: 添加标准连接参数

为了确保连接稳定，建议添加标准的连接参数。

**将**：
```
?appName=Cluster0
```

**替换为或添加**：
```
?retryWrites=true&w=majority&appName=Cluster0
```

或者简化为：
```
?retryWrites=true&w=majority
```

### 步骤 7: 最终连接字符串

**完整的、格式正确的连接字符串应该是**：
```
mongodb+srv://TransGuyane:clIn5TofaS4WRQVF@cluster0.4ooxxyp.mongodb.net/warehouse_management?retryWrites=true&w=majority
```

---

## 🔍 连接字符串格式解析

### 完整格式模板

```
mongodb+srv://用户名:密码@集群地址.mongodb.net/数据库名称?参数
```

### 各部分说明

| 部分 | 说明 | 示例 |
|------|------|------|
| `mongodb+srv://` | 连接协议（用于 MongoDB Atlas） | `mongodb+srv://` |
| `用户名` | 数据库用户名 | `TransGuyane` |
| `密码` | 数据库用户密码 | `clIn5TofaS4WRQVF` |
| `@` | 分隔符 | `@` |
| `集群地址` | MongoDB Atlas 集群地址 | `cluster0.4ooxxyp.mongodb.net` |
| `/数据库名称` | 数据库名称（**必须添加**） | `/warehouse_management` |
| `?参数` | 连接参数 | `?retryWrites=true&w=majority` |

---

## 📋 如果忘记用户名或密码

### 查看数据库用户

1. **进入数据库访问设置**
   - 在 MongoDB Atlas 左侧菜单中，点击 **Database Access**（数据库访问）
   - 或直接访问：https://cloud.mongodb.com/v2/[您的项目ID]/security/database/users

2. **查看用户列表**
   - 您会看到所有数据库用户的列表
   - 找到您的用户（例如：`TransGuyane`）

3. **查看或重置密码**
   - 点击用户右侧的 **Edit**（编辑）按钮
   - 可以查看用户信息，或者重置密码
   - ⚠️ **注意**：如果重置密码，需要同时更新 Vercel 中的连接字符串

---

## ✅ 验证连接字符串

### 检查清单

在将连接字符串添加到 Vercel 之前，请确认：

- [ ] ✅ 包含用户名和密码（已替换 `<username>` 和 `<password>`）
- [ ] ✅ 包含数据库名称（例如：`/warehouse_management`）
- [ ] ✅ 集群地址正确
- [ ] ✅ 包含连接参数（例如：`?retryWrites=true&w=majority`）
- [ ] ✅ 密码中没有特殊字符需要 URL 编码（如果有，需要编码）

### 常见错误格式

❌ **错误 1：缺少数据库名称**
```
mongodb+srv://TransGuyane:password@cluster0.4ooxxyp.mongodb.net/?appName=Cluster0
                                                              ↑ 缺少数据库名称
```

✅ **正确格式**：
```
mongodb+srv://TransGuyane:password@cluster0.4ooxxyp.mongodb.net/warehouse_management?retryWrites=true&w=majority
```

❌ **错误 2：包含占位符**
```
mongodb+srv://<username>:<password>@cluster0.4ooxxyp.mongodb.net/?appName=Cluster0
             ↑ 未替换用户名和密码
```

✅ **正确格式**：
```
mongodb+srv://TransGuyane:clIn5TofaS4WRQVF@cluster0.4ooxxyp.mongodb.net/warehouse_management?retryWrites=true&w=majority
```

❌ **错误 3：缺少连接参数**
```
mongodb+srv://TransGuyane:password@cluster0.4ooxxyp.mongodb.net/warehouse_management
                                                           ↑ 缺少参数
```

✅ **正确格式**：
```
mongodb+srv://TransGuyane:password@cluster0.4ooxxyp.mongodb.net/warehouse_management?retryWrites=true&w=majority
```

---

## 🧪 测试连接字符串

### 方法 1: 使用 MongoDB Compass（图形化工具）

1. **下载 MongoDB Compass**
   - 访问：https://www.mongodb.com/products/compass
   - 下载并安装

2. **测试连接**
   - 打开 MongoDB Compass
   - 粘贴连接字符串
   - 点击 **Connect**（连接）
   - 如果连接成功，说明连接字符串正确

### 方法 2: 使用 Node.js 脚本

创建一个测试脚本：

```javascript
const mongoose = require('mongoose');

const uri = 'mongodb+srv://TransGuyane:clIn5TofaS4WRQVF@cluster0.4ooxxyp.mongodb.net/warehouse_management?retryWrites=true&w=majority';

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB 连接成功！');
  console.log('数据库:', mongoose.connection.name);
  mongoose.connection.close();
})
.catch(err => {
  console.error('❌ 连接失败:', err.message);
  process.exit(1);
});
```

---

## 📝 在 Vercel 中配置

### 步骤 1: 登录 Vercel
- 访问：https://vercel.com/dashboard
- 登录您的账号

### 步骤 2: 进入项目设置
- 选择您的项目 `trans-guyane`
- 点击 **Settings**（设置）标签

### 步骤 3: 添加环境变量
- 点击左侧菜单的 **Environment Variables**（环境变量）
- 点击 **Add New**（添加新变量）或找到现有的 `MONGODB_URI` 并点击 **Edit**

### 步骤 4: 输入连接字符串
- **Key（键名）**：`MONGODB_URI`
- **Value（值）**：粘贴您准备好的完整连接字符串
  ```
  mongodb+srv://TransGuyane:clIn5TofaS4WRQVF@cluster0.4ooxxyp.mongodb.net/warehouse_management?retryWrites=true&w=majority
  ```
- ⚠️ **重要**：只输入连接字符串本身，**不要包含** `MONGODB_URI=` 前缀

### 步骤 5: 选择环境
- 勾选 **Production**（生产环境）
- 勾选 **Preview**（预览环境）
- 勾选 **Development**（开发环境，如果有）

### 步骤 6: 保存并重新部署
- 点击 **Save**（保存）
- **重要**：修改环境变量后，必须在 **Deployments** 中点击 **Redeploy** 才能生效！

---

## 🆘 常见问题

### Q1: MongoDB Atlas 生成的连接字符串不包含数据库名称？

**A**: 这是正常的。MongoDB Atlas 默认不包含数据库名称，您需要手动添加。

在 `.mongodb.net/` 之后添加 `/warehouse_management`（或您的数据库名称）。

### Q2: 如何确定数据库名称？

**A**: 
- 如果您已经创建了数据库，在 MongoDB Atlas 的 **Database** 页面可以看到
- 如果您还没有创建，可以任意命名（例如：`warehouse_management`）
- MongoDB 会在第一次写入时自动创建数据库

### Q3: 密码中有特殊字符怎么办？

**A**: 如果密码包含特殊字符（如 `@`, `:`, `/`, `?`, `#`, `[`, `]`），需要进行 URL 编码：

| 字符 | URL 编码 |
|------|----------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `?` | `%3F` |
| `#` | `%23` |
| `[` | `%5B` |
| `]` | `%5D` |

**示例**：
如果密码是 `pass@word`，应该编码为 `pass%40word`

### Q4: 忘记了数据库用户名或密码？

**A**: 
1. 登录 MongoDB Atlas
2. 进入 **Database Access**（数据库访问）
3. 找到用户，点击 **Edit**（编辑）
4. 可以查看或重置密码

---

## 📚 相关文档

- [500错误立即修复指南.md](./500错误立即修复指南.md)
- [MongoDB连接字符串修正指南.md](./MongoDB连接字符串修正指南.md)
- [Vercel数据库配置完整步骤.md](./Vercel数据库配置完整步骤.md)

---

**总结**：获取 MongoDB 连接字符串的关键步骤是：
1. 从 MongoDB Atlas 复制基础连接字符串
2. 替换用户名和密码
3. **添加数据库名称**（最重要！）
4. 添加连接参数
5. 在 Vercel 中配置并重新部署
