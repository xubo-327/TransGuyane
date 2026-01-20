# GitHub Pages 部署指南

## 📋 前置要求

1. GitHub账号
2. 已创建GitHub仓库
3. 已配置Git远程仓库

## 🚀 部署步骤

### 方法一：使用GitHub Actions（推荐）

#### 1. 配置GitHub仓库

1. 进入仓库设置（Settings）
2. 点击左侧菜单的 "Pages"
3. 在 "Source" 中选择 "GitHub Actions"

#### 2. 配置Secrets（可选）

如果需要配置生产环境API地址：

1. 进入仓库设置 → Secrets and variables → Actions
2. 点击 "New repository secret"
3. 添加以下Secret：
   - `REACT_APP_API_URL`: 生产环境后端API地址（如：`https://api.yourdomain.com/api`）

#### 3. 推送代码

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

#### 4. 查看部署状态

1. 进入仓库的 "Actions" 标签页
2. 查看部署工作流状态
3. 部署成功后，访问：`https://your-username.github.io/warehouse-management`

### 方法二：使用gh-pages包（本地部署）

#### 1. 安装gh-pages

```bash
cd frontend
npm install --save-dev gh-pages
```

#### 2. 修改package.json

已添加以下脚本：
```json
{
  "homepage": "https://your-username.github.io/warehouse-management",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

**注意**：将 `your-username` 替换为你的GitHub用户名，`warehouse-management` 替换为你的仓库名。

#### 3. 配置环境变量

创建 `frontend/.env.production` 文件：

```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

#### 4. 部署

```bash
cd frontend
npm run deploy
```

## ⚙️ 配置说明

### 1. 更新API地址

#### 开发环境
创建 `frontend/.env.development`：
```env
REACT_APP_API_URL=http://localhost:5000/api
```

#### 生产环境
创建 `frontend/.env.production`：
```env
REACT_APP_API_URL=https://api.yourdomain.com/api
```

### 2. 更新package.json中的homepage

```json
{
  "homepage": "https://your-username.github.io/your-repo-name"
}
```

### 3. 处理路由问题

GitHub Pages是静态托管，不支持服务端路由。React Router需要使用HashRouter。

**如果遇到路由问题**，修改 `frontend/src/App.js`：

```javascript
// 将 BrowserRouter 改为 HashRouter
import { HashRouter as Router } from 'react-router-dom';
```

## 🔧 常见问题

### 1. 页面404错误

**原因**：GitHub Pages不支持客户端路由

**解决方案**：
- 使用HashRouter（推荐）
- 或配置404.html重定向

### 2. API请求失败

**原因**：CORS跨域问题

**解决方案**：
- 确保后端配置了正确的CORS
- 检查API地址是否正确

### 3. 资源加载失败

**原因**：路径问题

**解决方案**：
- 确保package.json中的homepage配置正确
- 使用相对路径或完整URL

## 📝 更新部署

### 自动部署（GitHub Actions）

每次推送到main分支会自动触发部署。

### 手动部署（gh-pages）

```bash
cd frontend
npm run build
npm run deploy
```

## 🔒 安全注意事项

1. **不要提交敏感信息**：确保.env文件在.gitignore中
2. **使用HTTPS**：GitHub Pages默认使用HTTPS
3. **配置CORS**：确保后端API允许GitHub Pages域名访问

## 📊 部署检查清单

- [ ] GitHub仓库已创建
- [ ] GitHub Actions已配置
- [ ] Secrets已配置（如需要）
- [ ] package.json中的homepage已更新
- [ ] 环境变量已配置
- [ ] 代码已推送到main分支
- [ ] 部署工作流已成功运行
- [ ] 网站可以正常访问
- [ ] API连接正常

## 🌐 自定义域名（可选）

1. 在仓库设置 → Pages → Custom domain 中添加域名
2. 在域名DNS中添加CNAME记录指向GitHub Pages
3. 启用HTTPS（GitHub会自动配置）

## 📚 相关文档

- [GitHub Pages官方文档](https://docs.github.com/en/pages)
- [React Router部署指南](https://reactrouter.com/en/main/start/overview#deployment)
- [GitHub Actions文档](https://docs.github.com/en/actions)
