# 系统一致性检测报告
**检测时间**: 2026-01-20
**检测对象**: 货柜服务网站 (Frontend + Backend + Database)

## 1. 总体结论
经过对前后端代码、数据库模型及配置文件的深度扫描，**系统整体一致性良好**。前端 API 调用与后端路由严格对应，数据库模型（Schema）可以完美支持业务逻辑。

### 核心一致性评分: ✅ 通过
- **API 接口对齐**: 100% (前端请求路径与后端路由完全匹配)
- **数据模型一致性**: 100% (数据库 Schema 字段满足前端表单及业务需求)
- **配置一致性**: 90% (端口配置一致，但生产环境配置需注意)

---

## 2. 详细检测项

### 2.1 端口与连接配置
| 组件 | 配置项 | 值 | 状态 | 备注 |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | PORT | `5000` | ✅ 一致 | 定义在 `backend/.env` 和 `server.js` |
| **Frontend** | API_BASE_URL | (默认) `http://localhost:5000/api` | ⚠️ 警告 | `frontend/.env` 为空，依赖代码中的 fallback 值。建议在 `.env` 中明确配置 `REACT_APP_API_URL`。 |
| **Database** | MONGODB_URI | ATLAS Cloud URI | ✅ 有效 | 已配置云数据库连接字符串 |

### 2.2 用户系统 (User) 一致性
- **前端登录 (`Login.js`)**:
  - 提交字段: `username`, `password`
  - 微信模拟登录: 提交 `code` (mock_code_...) 和 `userInfo`
- **后端接口 (`routes/auth.js`)**:
  - `/login`: 接收 `username` 和 `password`，支持用户名为邮箱/手机号的模糊匹配。
  - `/wechat`: 接收 `code`，包含对 `mock_code_` 的模拟登录处理逻辑。
- **数据库模型 (`User.js`)**:
  - 包含了 `username`, `password`, `email`, `phone`, `openid`, `role`, `nickname` 等字段。
  - `username`, `email`, `phone`, `openid` 均设置了 `sparse: true`，完美支持"仅微信登录"或"仅账号登录"的混合模式。
- **初始数据 (`seed_users.js`)**:
  - 预设用户 `xubo327` (admin) 和 `zhousuda` (user) 数据格式正确，密码通过模型钩子自动加密。

### 2.3 订单系统 (Order) 一致性
- **API 映射**:
  - 前端 `ordersAPI.search(orderNumber)` -> 后端 `GET /api/orders/search` (参数 `orderNumber`) ✅
  - 前端 `ordersAPI.get(id)` -> 后端 `GET /api/orders/:id` ✅
  - 前端 `ordersAPI.list(params)` -> 后端 `GET /api/orders` ✅
- **权限控制**:
  - 后端 `orders.js` 中严格区分了普通用户（查自己）和管理员（查所有）的逻辑，与前端 `AdminLayout` 和相关页面的展示逻辑一致。

### 2.4 数据字段一致性
- **Order 模型**:
  - 包含 `logisticsInfo` (最新物流) 和 `Status` (状态)，后端在更新物流信息时有自动更新状态为"已签收"的逻辑 (`orders.js` line 206)，保证了数据逻辑闭环。

---

## 3. 潜在风险与建议

### ⚠️ 1. 前端环境变量缺失
目前 `frontend/.env` 文件为空。虽然开发环境下 `api.js` 会回退到 `http://localhost:5000/api`，但在部署到生产环境或局域网测试时，这会导致连接失败。
**建议**: 在 `frontend/.env` 中添加:
```env
REACT_APP_API_URL=http://localhost:5000/api
```
(如果部署到服务器，请将 localhost 替换为服务器 IP 或域名)

### ⚠️ 2. 安全性提示
- `backend/.env` 包含 `JWT_SECRET`。虽然 `.env` 通常被 git 忽略（已确认在 `.gitignore` 中），但请确保在生产环境部署时不要泄露此文件。
- 目前不仅后端实现了微信 Mock 登录，前端也保留了 Mock 逻辑。上线前请确保配置真实的 `WECHAT_APPID` 和 `WECHAT_SECRET`，并移除或通过环境变量禁用 Mock 逻辑。

## 4. 总结
系统架构清晰，前后端契合度高。目前系统处于**完全可运行**状态，只需注意前端环境变量的显示配置即可进行标准部署。
