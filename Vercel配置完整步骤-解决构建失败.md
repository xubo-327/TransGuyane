# Vercel 配置完整步骤 - 解决构建失败

## 🔴 当前错误

**错误信息**：`函数运行时必须具有有效版本,例如now-php@1.0.0`

**原因**：Vercel 找不到 `vercel.json` 配置文件，因为 Root Directory 没有设置为 `backend`

---

## ✅ 完整配置步骤

### 步骤 1：登录 Vercel Dashboard

1. 访问：https://vercel.com/dashboard
2. 使用您的账号登录

### 步骤 2：选择项目

1. 在项目列表中找到：`trans-guyane`
2. 点击项目名称进入项目页面

### 步骤 3：进入项目设置

1. 点击顶部菜单：**Settings**
2. 在左侧菜单中点击：**General**

### 步骤 4：配置 Root Directory（最关键！）

1. 在 General 页面中，向下滚动找到：**Root Directory**
2. 点击 **Edit** 按钮
3. 在输入框中输入：`backend`（不要包含斜杠 `/`）
4. 点击 **Save** 保存

**重要提示**：
- Root Directory 必须设置为 `backend`
- 这样 Vercel 才能在 `backend/` 目录下找到 `vercel.json`
- 如果不设置，Vercel 会在根目录查找，找不到配置文件就会报错

### 步骤 5：检查其他设置（可选但推荐）

在 General 页面中，确认以下设置：

1. **Framework Preset**：可以设置为 `Other` 或留空
2. **Build Command**：留空（Vercel 会自动检测）
3. **Output Directory**：留空
4. **Install Command**：留空（使用默认 `npm install`）

### 步骤 6：重新部署

配置完成后，必须重新部署：

1. **方法一（推荐）**：
   - 保存 Root Directory 后，页面可能会自动提示重新部署
   - 点击 **Redeploy** 或 **Confirm**

2. **方法二（手动）**：
   - 点击顶部菜单：**Deployments**
   - 找到最新的部署（显示 "Error" 的那个）
   - 点击右侧的 **"..."**（三个点）
   - 选择：**Redeploy**
   - 确认重新部署

### 步骤 7：等待部署完成

1. 在 **Deployments** 页面查看部署状态
2. 等待状态变为：**Ready**（绿色）
3. 通常需要 1-2 分钟

### 步骤 8：验证部署成功

部署完成后，运行诊断脚本：

```batch
完整诊断Vercel部署.bat
```

---

## 📋 配置检查清单

配置完成后，确认以下所有项：

- [ ] Root Directory 设置为 `backend`
- [ ] 已点击 Save 保存设置
- [ ] 已触发重新部署
- [ ] 部署状态为 "Ready"（不再是 "Error"）
- [ ] Build Logs 中没有错误
- [ ] `/api` 端点可以访问
- [ ] `/api/create-admins` 不再返回 404

---

## 🔍 为什么会出现这个错误？

### 项目结构：
```
TransGuyane/              ← GitHub 仓库根目录
├── frontend/
├── backend/              ← 后端代码在这里
│   ├── api/
│   │   └── index.js
│   ├── server.js
│   ├── vercel.json       ← 配置文件在这里！
│   └── package.json
└── README.md
```

### 如果 Root Directory 未设置或设置为 `/`：

1. Vercel 在根目录查找 `vercel.json`
2. 找不到配置文件
3. Vercel 无法确定项目类型
4. 尝试使用默认运行时（可能是 PHP）
5. 报错：`函数运行时必须具有有效版本`

### 如果 Root Directory 设置为 `backend`：

1. Vercel 在 `backend/` 目录查找 `vercel.json`
2. 找到配置文件
3. 读取配置：`"use": "@vercel/node"`
4. 使用正确的 Node.js 运行时
5. 构建成功！

---

## 🎯 成功标志

配置正确后，您应该看到：

1. **部署状态**：从 "Error" 变为 "Ready"（绿色）
2. **Build Logs**：显示构建成功，没有错误
3. **API 测试**：所有端点都可以访问

运行 `完整诊断Vercel部署.bat` 应该看到：

```
[步骤 1] 检查 API 根路径...
✅ API 根路径可访问

[步骤 2] 检查健康检查端点...
✅ 健康检查端点可访问

[步骤 3] 检查创建管理员端点...
✅ 创建管理员端点可访问
管理员账户创建成功！
```

---

## 🐛 如果仍然失败

### 检查 1：确认 Root Directory 已保存

1. 回到 Settings → General
2. 确认 Root Directory 显示为 `backend`
3. 如果不是，重新设置并保存

### 检查 2：查看 Build Logs

1. 进入 Deployments → 最新部署
2. 查看 **Build Logs**
3. 查找具体的错误信息
4. 如果看到其他错误，告诉我具体的错误信息

### 检查 3：确认文件存在

在 GitHub 仓库中确认：
- `backend/vercel.json` 存在
- `backend/api/index.js` 存在
- `backend/server.js` 存在

---

## 📞 需要帮助？

如果按照以上步骤操作后仍然失败：

1. **截图提供**：
   - Root Directory 设置页面的截图
   - Build Logs 的完整截图
   - 错误信息的详细截图

2. **查看详细文档**：
   - `Vercel 404错误完整解决方案.md`
   - `立即修复404错误-关键步骤.md`

3. **Vercel 官方文档**：
   - https://vercel.com/docs/projects/project-configuration#root-directory

---

**最后更新**：2025-01-21
