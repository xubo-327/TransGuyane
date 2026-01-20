# 部署到GitHub - 完整指南

## 📋 当前状态

您的项目已经：
- ✅ Git仓库已初始化
- ✅ 代码已提交到本地
- ⚠️ 远程仓库URL需要配置

## 🚀 部署步骤

### 第一步：创建GitHub仓库

1. **访问GitHub**
   - 打开 https://github.com
   - 登录您的账号（如果没有账号，请先注册）

2. **创建新仓库**
   - 点击右上角 "+" → "New repository"
   - 填写仓库信息：
     - **Repository name**: `TransGuyane` （或您喜欢的名称）
     - **Description**: `TransGuyane 仓库管理系统`
     - **Visibility**: 选择 **Public**（如果使用GitHub Pages部署前端）
     - ⚠️ **不要**勾选 "Initialize this repository with a README"（我们已经有了代码）
   - 点击 "Create repository"

3. **复制仓库URL**
   - 创建完成后，GitHub会显示仓库URL
   - 格式类似：`https://github.com/your-username/TransGuyane.git`
   - **复制这个URL**，下一步需要用到

### 第二步：配置远程仓库

在项目目录打开PowerShell，运行：

```powershell
# 删除旧的远程仓库（如果存在）
git remote remove origin

# 添加您的GitHub仓库URL（替换为您的实际URL）
git remote add origin https://github.com/your-username/TransGuyane.git

# 验证配置
git remote -v
```

### 第三步：推送到GitHub

```powershell
# 推送到GitHub（首次推送）
git push -u origin main
```

### 第四步：输入凭证

如果提示输入用户名和密码：
- **Username**: 您的GitHub用户名
- **Password**: 使用Personal Access Token（不是GitHub密码）

**如何创建Personal Access Token**：
1. GitHub → 右上角头像 → **Settings**
2. 左侧菜单 → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. 点击 **Generate new token (classic)**
5. 填写信息：
   - Note: `Git操作`
   - Expiration: 选择期限（建议90天或No expiration）
   - Scopes: 勾选 **repo**（全部权限）
6. 点击 **Generate token**
7. **复制并保存token**（只显示一次，请妥善保存）
8. 推送时，密码输入框粘贴这个token

## ✅ 验证部署

推送完成后，访问您的GitHub仓库页面，应该能看到所有文件。

## 🔄 后续更新代码

完成首次推送后，后续更新代码的流程：

```powershell
# 1. 查看更改
git status

# 2. 添加更改的文件
git add .

# 3. 提交更改
git commit -m "描述你的更改"

# 4. 推送到GitHub
git push
```

## 🐛 常见问题

### 问题1：推送被拒绝

如果提示 "Updates were rejected"：

```powershell
# 先拉取远程更改
git pull origin main --rebase

# 然后再推送
git push
```

### 问题2：认证失败

- 确保使用Personal Access Token而不是GitHub密码
- 检查token是否已过期
- 确保token有repo权限

### 问题3：找不到仓库

- 检查GitHub仓库URL是否正确
- 确保仓库名称拼写正确
- 确保您有该仓库的访问权限

## 📚 下一步

部署到GitHub后，您可以：

1. **部署前端到GitHub Pages**
   - 参考：`docs/deployment/GITHUB_PAGES_DEPLOYMENT.md`

2. **部署后端到Vercel**
   - 参考：`docs/deployment/VERCEL_DEPLOYMENT.md`

3. **设置GitHub Actions自动部署**
   - 自动化前端构建和部署流程

---

**需要帮助？** 如果遇到任何问题，请检查GitHub仓库是否存在，URL是否正确。
