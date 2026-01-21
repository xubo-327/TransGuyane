# 修复 Vercel 线上环境管理员登录问题

经过排查代码，发现本地管理员能登录但线上不能登录的原因通常是：**线上数据库（MongoDB Atlas）中没有创建相应的管理员账户数据**。

您的后端代码中包含了一个修复工具 `/api/create-admins`，但根据您的反馈，该接口返回了 **404 Not Found**，这说明**由于某种原因，Vercel 上部署的代码没有包含最新的 backend/server.js 更新**。

## 解决方案

请按顺序执行以下步骤。

### 第一步：确认代码已推送并部署

您的本地代码中已经有修复逻辑，但线上环境似乎还是旧版本。

1. **推送最新代码**：
   打开终端，确保将所有更改推送到了 GitHub：
   ```bash
   git add backend/server.js
   git commit -m "Ensure create-admins endpoint is present"
   git push
   ```
   *注意：如果它提示 "nothing to commit"，说明已经提交了，直接运行 `git push`。*

2. **检查 Vercel 部署状态**：
   - 登录 [Vercel 控制台](https://vercel.com/dashboard)
   - 找到您的项目
   - 查看 "Deployments" 选项卡
   - **确保最新的部署状态是 "Ready"（且部署时间是刚刚）**。如果最新部署失败（Error），则新代码没有上线，请查看日志修复。

### 第二步：再次尝试修复数据

确认部署更新后，再次执行修复操作。

#### 方法 A：使用浏览器控制台 (推荐)
1. 打开您的前端网站。
2. 按 `F12` 打开控制台 (Console)。
3. 运行以下代码（注意：如果之前报404，这次应该能成功）：

```javascript
const BACKEND_URL = "https://trans-guyane.vercel.app";

// 先检查检查端点是否存在
fetch(`${BACKEND_URL}/api/check-admins`)
  .then(res => {
     console.log("检查端点状态:", res.status); 
     if(res.status === 404) alert("警告：后端仍然返回 404，说明代码未更新！");
     return res.json();
  })
  .then(data => console.log("当前账户状态:", data))
  .catch(e => console.log("检查失败", e));

// 尝试创建管理员
fetch(`${BACKEND_URL}/api/create-admins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
})
.then(res => res.json())
.then(data => {
    console.log("创建结果：", data);
    alert("管理员账户创建成功！请尝试登录。");
})
.catch(err => {
    console.error("请求失败：", err);
    alert("请求失败，请检查控制台。");
});
```

*如果仍然报 404，请尝试将 URL 中的 `create-admins` 改为 `create-admin` (去掉s) 试试，以防是旧版本代码的拼写差异。*

### 第三步：验证登录

修复成功后 (控制台显示 "created" 或 "updated")：
1. 回到前端登录页面。
2. 使用管理员账号登录：
   - 用户名: `xubo327`
   - 密码: `3273279x`

### 备用方案：手动在 MongoDB Atlas 创建

如果 API 方法一直无法通过，您可以直接在 MongoDB Atlas 网页端操作：
1. 登录 [MongoDB Atlas](https://cloud.mongodb.com/)。
2. 进入 Database -> Browse Collections。
3. 找到 `warehouse_management` -> `users` 集合。
4. 点击 "Insert Document"，填入以下内容：
   ```json
   {
     "username": "xubo327",
     "password": "$2a$10$YourHashedPasswordHere...", 
     "role": "admin",
     "nickname": "普通管理员",
     "loginType": "account"
   }
   ```
   *注意：直接插入会导致密码明文无法匹配（因为需要哈希）。所以**强烈建议使用 API 方法**，因为它会自动处理密码哈希。*
