# Git 初始化和首次提交指南

## 📋 概述

本指南将帮助您初始化Git仓库、准备首次提交，并为部署到GitHub和Vercel做好准备。

---

## 🔧 第一步：检查Git是否已安装

### Windows用户

打开PowerShell或命令提示符，运行：

```bash
git --version
```

如果显示版本号（如 `git version 2.x.x`），说明已安装。

如果未安装，请：
1. 访问 https://git-scm.com/download/win
2. 下载并安装Git for Windows
3. 安装时保持默认选项即可

---

## 🚀 第二步：初始化Git仓库

### 2.1 打开终端

在项目根目录打开PowerShell或命令提示符：

```bash
cd "D:\【网站设计】\货柜服务网站"
```

### 2.2 初始化Git仓库

```bash
git init
```

这会在项目目录创建 `.git` 文件夹。

### 2.3 检查.gitignore文件

确保 `.gitignore` 文件存在且包含以下内容：

```
node_modules/
*/node_modules/
.env
.env.local
.env.production
backend/.env
frontend/.env
build/
dist/
*.log
.DS_Store
Thumbs.db
```

如果文件不存在或需要更新，我会帮您创建/更新。

---

## 📝 第三步：配置Git用户信息（首次使用需要）

### 3.1 配置用户名和邮箱

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**替换为您的实际信息**：
- `Your Name` → 您的名字（可以是GitHub用户名）
- `your.email@example.com` → 您的邮箱（最好是GitHub注册邮箱）

### 3.2 验证配置

```bash
git config --global user.name
git config --global user.email
```

---

## 📦 第四步：添加文件到Git

### 4.1 查看文件状态

```bash
git status
```

这会显示所有未跟踪和已修改的文件。

### 4.2 添加所有文件

```bash
git add .
```

这会添加所有文件到暂存区（除了.gitignore中排除的文件）。

### 4.3 检查将要提交的文件

```bash
git status
```

现在应该看到所有文件都是绿色的（已暂存）。

---

## 💾 第五步：创建首次提交

### 5.1 提交文件

```bash
git commit -m "Initial commit: Warehouse management system"
```

### 5.2 验证提交

```bash
git log
```

应该看到您的首次提交记录。

---

## 🌐 第六步：创建GitHub仓库

### 6.1 在GitHub上创建仓库

1. 访问 https://github.com
2. 登录您的账号（如果没有，先注册）
3. 点击右上角 "+" → "New repository"
4. 填写信息：
   - **Repository name**: `warehouse-management`
   - **Description**: `TransGuyane 仓库管理系统`
   - **Visibility**: 选择 **Public**（GitHub Pages需要）
   - **⚠️ 不要**勾选 "Initialize this repository with a README"（我们已经有了）
5. 点击 "Create repository"

### 6.2 获取仓库URL

创建完成后，GitHub会显示仓库URL，格式：
```
https://github.com/your-username/warehouse-management.git
```

**复制这个URL**，下一步会用到。

---

## 🔗 第七步：连接本地仓库到GitHub

### 7.1 添加远程仓库

```bash
git remote add origin https://github.com/your-username/warehouse-management.git
```

**替换** `your-username` 为您的GitHub用户名。

### 7.2 重命名默认分支为main（如果需要）

```bash
git branch -M main
```

### 7.3 验证远程仓库

```bash
git remote -v
```

应该显示：
```
origin  https://github.com/your-username/warehouse-management.git (fetch)
origin  https://github.com/your-username/warehouse-management.git (push)
```

---

## ⬆️ 第八步：推送到GitHub

### 8.1 首次推送

```bash
git push -u origin main
```

### 8.2 输入凭证

如果提示输入用户名和密码：
- **Username**: 您的GitHub用户名
- **Password**: 使用Personal Access Token（不是GitHub密码）

**如何创建Personal Access Token**：
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 填写：
   - Note: `Git operations`
   - Expiration: 选择期限（建议90天或No expiration）
   - Scopes: 勾选 `repo`（全部权限）
4. 点击 "Generate token"
5. **复制并保存token**（只显示一次）

**使用token作为密码**：推送时密码输入框粘贴token。

### 8.3 验证推送

推送完成后，访问您的GitHub仓库页面，应该能看到所有文件。

---

## ✅ 完成检查清单

- [ ] Git已安装
- [ ] Git用户信息已配置
- [ ] Git仓库已初始化
- [ ] .gitignore文件已配置
- [ ] 所有文件已添加
- [ ] 首次提交已创建
- [ ] GitHub仓库已创建
- [ ] 远程仓库已连接
- [ ] 代码已推送到GitHub

---

## 🔄 后续提交工作流

完成首次提交后，后续的提交流程：

### 1. 查看更改

```bash
git status
```

### 2. 添加更改的文件

```bash
git add .
# 或指定文件
git add filename.js
```

### 3. 提交更改

```bash
git commit -m "描述你的更改"
```

### 4. 推送到GitHub

```bash
git push
```

---

## 🐛 常见问题

### 问题1：推送时要求认证

**解决方法**：
- 使用Personal Access Token作为密码
- 或配置SSH密钥（高级选项）

### 问题2：文件太大无法推送

**解决方法**：
- 检查.gitignore是否正确配置
- 移除大文件（如node_modules）
- 使用Git LFS（如果需要版本控制大文件）

### 问题3：推送被拒绝

**解决方法**：
```bash
# 先拉取远程更改
git pull origin main --rebase

# 然后再推送
git push
```

### 问题4：想撤销上次提交

**解决方法**：
```bash
# 撤销提交但保留更改
git reset --soft HEAD~1

# 完全撤销（谨慎使用）
git reset --hard HEAD~1
```

---

## 📚 下一步

完成Git设置后，您可以：

1. **继续部署流程**：
   - 参考 [详细上线计划](./deployment/DETAILED_LAUNCH_PLAN.md)
   - 开始第二阶段：数据库配置

2. **配置GitHub Actions**：
   - 前端自动部署到GitHub Pages

3. **连接到Vercel**：
   - 后端自动部署到Vercel

---

## 💡 实用Git命令参考

```bash
# 查看状态
git status

# 查看提交历史
git log

# 查看文件差异
git diff

# 添加文件
git add .

# 提交更改
git commit -m "提交信息"

# 推送更改
git push

# 拉取更改
git pull

# 创建新分支
git checkout -b branch-name

# 切换分支
git checkout branch-name

# 查看分支
git branch

# 合并分支
git merge branch-name
```

---

## 🎉 完成！

恭喜！您的项目已成功连接到GitHub，可以继续进行部署了！

**下一步**：查看 [详细上线计划](./deployment/DETAILED_LAUNCH_PLAN.md) 开始部署流程。
