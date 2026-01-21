# GitHub Actions 全面故障排除指南

## 🔴 当前状态

所有工作流运行都失败了。让我们系统地排查问题。

---

## 📋 检查清单

### 1. 检查 GitHub Pages 设置

**最重要**：确保 GitHub Pages 已正确配置！

1. 进入仓库 → **Settings** → **Pages**
2. 检查 **Source** 设置：
   - ✅ 应该选择：**GitHub Actions**
   - ❌ 不要选择：Deploy from a branch
3. 如果设置错误，修改后保存

### 2. 检查工作流权限

确保工作流有正确的权限：

```yaml
permissions:
  contents: read      # ✅ 读取仓库内容
  pages: write        # ✅ 写入 Pages
  id-token: write     # ✅ OIDC 认证
```

### 3. 检查环境设置

工作流中使用的环境名称必须匹配：

```yaml
environment:
  name: github-pages  # ✅ 必须匹配 GitHub Pages 环境名称
```

**在 GitHub 中验证**：
1. 进入仓库 → **Settings** → **Environments**
2. 确保存在名为 `github-pages` 的环境
3. 如果没有，创建它

---

## 🔧 常见问题和解决方案

### 问题1：环境不存在

**错误症状**：工作流失败，提示环境未找到

**解决方法**：
1. 进入仓库 → **Settings** → **Environments**
2. 点击 **New environment**
3. 输入名称：`github-pages`
4. 点击 **Configure environment**
5. 保存（不需要额外配置）

### 问题2：权限不足

**错误症状**：部署步骤失败，提示权限错误

**解决方法**：
- 检查工作流文件的 `permissions` 部分
- 确保包含 `pages: write` 和 `id-token: write`

### 问题3：Artifact 问题

**错误症状**：Multiple artifacts found

**已修复**：
- ✅ 已添加 `concurrency` 控制
- ✅ `cancel-in-progress: true`

**如果仍然失败**：
1. 进入 **Actions** → **Artifacts**
2. 删除所有旧的 artifacts
3. 重新运行工作流

### 问题4：构建失败

**错误症状**：Install dependencies 或 Build 步骤失败

**可能原因**：
- `package-lock.json` 不存在或过时
- 依赖安装失败

**解决方法**：
- ✅ 已添加 `package-lock.json` 到仓库
- 确保 `frontend/package-lock.json` 存在

---

## ✅ 完整的工作流配置（已验证）

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: './frontend/package-lock.json'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build
        working-directory: ./frontend
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL || 'https://your-project.vercel.app/api' }}
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './frontend/build'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 🔍 诊断步骤

### 步骤1：检查最新运行的具体错误

1. 进入 **Actions** 标签页
2. 点击最新的失败运行
3. 展开 **build-and-deploy** job
4. 查看哪个步骤失败了
5. 阅读错误信息

### 步骤2：检查 GitHub Pages 配置

1. **Settings** → **Pages**
   - Source: **GitHub Actions** ✅
   - 如果显示 "Deploy from a branch"，改为 **GitHub Actions**

2. **Settings** → **Environments**
   - 确保存在 `github-pages` 环境
   - 如果不存在，创建它

### 步骤3：清理和重新部署

1. 删除所有旧的 artifacts：
   - **Actions** → **Artifacts** → 删除所有

2. 手动触发工作流：
   - **Actions** → 选择工作流 → **Run workflow**

---

## 💡 快速修复步骤

### 如果 GitHub Pages Source 设置错误：

1. 进入仓库 → **Settings** → **Pages**
2. 将 **Source** 从 "Deploy from a branch" 改为 **"GitHub Actions"**
3. 保存
4. 手动运行工作流

### 如果环境不存在：

1. 进入仓库 → **Settings** → **Environments**
2. 点击 **New environment**
3. 名称：`github-pages`
4. 点击 **Configure environment**
5. 直接保存（不需要额外配置）
6. 手动运行工作流

---

## 📊 预期结果

成功部署后，您应该看到：

1. ✅ 工作流状态：绿色（成功）
2. ✅ 部署完成：可以访问 `https://xubo-327.github.io/TransGuyane`
3. ✅ 只有一个 artifact（最新的）

---

## 🚨 如果仍然失败

请提供以下信息以便进一步诊断：

1. **最新运行的具体错误信息**：
   - 哪个步骤失败了？
   - 错误消息是什么？

2. **GitHub Pages 设置**：
   - Source 设置是什么？
   - 是否有环境配置？

3. **工作流日志**：
   - 失败的步骤的完整日志

---

## 📚 相关文档

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [GitHub Actions 部署 Pages 文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)

---

**请先检查 GitHub Pages 的 Source 设置，这是最常见的问题！** 🔍
