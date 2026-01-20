# 🚀 完整上线方案

## 📋 概述

本方案提供从开发环境到生产环境的完整部署流程，包括前端GitHub Pages部署和后端云服务器部署。

## 🎯 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                     用户访问                              │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  GitHub Pages   │    │   云服务器       │
│  (前端静态文件)  │    │  (后端API)       │
│  HTTPS          │    │  HTTPS           │
└────────┬────────┘    └────────┬────────┘
         │                      │
         │  API请求             │
         └──────────┬───────────┘
                    │
                    ▼
         ┌─────────────────┐
         │ MongoDB Atlas   │
         │  (云数据库)      │
         └─────────────────┘
```

## 📅 部署时间表

### 阶段一：准备工作（1-2天）

- [ ] 注册GitHub账号并创建仓库
- [ ] 注册云服务器（阿里云/腾讯云/AWS等）
- [ ] 注册MongoDB Atlas账号
- [ ] 准备域名（可选）

### 阶段二：前端部署（1天）

- [ ] 配置GitHub仓库
- [ ] 配置GitHub Actions
- [ ] 更新环境变量
- [ ] 测试前端部署

### 阶段三：后端部署（推荐Vercel，30分钟）

**推荐使用Vercel（免费，最简单）**：
- [ ] 注册Vercel账号
- [ ] 连接GitHub仓库
- [ ] 配置环境变量
- [ ] 部署项目
- [ ] 测试API

**详细步骤**：参考 [Vercel部署指南](./VERCEL_DEPLOYMENT.md) ⭐

**备选方案：免费云服务器**：
- [ ] 参考 [免费云服务器部署指南](./FREE_SERVER_DEPLOYMENT.md)

### 阶段四：数据库配置（半天）

- [ ] 创建MongoDB Atlas集群
- [ ] 配置网络访问
- [ ] 测试连接

### 阶段五：集成测试（1天）

- [ ] 测试完整流程
- [ ] 性能测试
- [ ] 安全测试
- [ ] 修复问题

## 🛠️ 详细步骤

### 第一步：GitHub仓库准备

1. **创建仓库**
   ```bash
   # 在GitHub上创建新仓库
   # 仓库名：warehouse-management
   # 设置为Public（GitHub Pages需要）
   ```

2. **初始化本地仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/warehouse-management.git
   git push -u origin main
   ```

3. **配置GitHub Pages**
   - 进入仓库Settings → Pages
   - Source选择：GitHub Actions

### 第二步：前端部署配置

1. **更新package.json**
   - 已添加homepage字段
   - 已添加deploy脚本

2. **配置环境变量**
   创建 `frontend/.env.production`：
   ```env
   REACT_APP_API_URL=https://api.yourdomain.com/api
   ```

3. **配置GitHub Actions**
   - 文件已创建：`frontend/.github/workflows/deploy.yml`
   - 如需自定义API地址，在仓库Secrets中添加 `REACT_APP_API_URL`

4. **推送代码触发部署**
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

### 第三步：后端部署配置

#### 3.1 后端部署选项

**选项1：Vercel（强烈推荐，最简单快速）** ⭐
- **成本**：$0/月（Hobby计划）
- **优势**：零配置、自动HTTPS、全球CDN、自动部署
- **时间**：30分钟
- **详细步骤**：参考 [Vercel部署指南](./VERCEL_DEPLOYMENT.md)

**选项2：Oracle Cloud Free Tier（备选）**
- 系统：Ubuntu 22.04 LTS
- 配置：ARM实例（4核24GB）或AMD实例（1核1GB）
- 存储：200GB
- 流量：10TB/月
- **成本**：$0/月（永久免费）
- **详细步骤**：参考 [免费云服务器部署指南](./FREE_SERVER_DEPLOYMENT.md)

#### 3.2 服务器初始化

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. 安装PM2
sudo npm install -g pm2

# 4. 安装Nginx
sudo apt install nginx -y
```

#### 3.3 部署后端代码

```bash
# 1. 创建项目目录
sudo mkdir -p /var/www/warehouse
cd /var/www/warehouse

# 2. 克隆项目（或上传代码）
git clone https://github.com/your-username/warehouse-management.git .

# 3. 进入后端目录
cd backend

# 4. 安装依赖
npm install --production

# 5. 创建环境变量文件
nano .env
```

#### 3.4 配置环境变量

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/warehouse_management?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_secret_key_at_least_32_characters_long
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
NODE_ENV=production
FRONTEND_URL=https://your-username.github.io
```

#### 3.5 启动服务

```bash
# 使用PM2启动
pm2 start server.js --name warehouse-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看状态
pm2 status
pm2 logs warehouse-backend
```

#### 3.6 配置Nginx

```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/warehouse-api
```

添加配置：

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/warehouse-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3.7 配置SSL证书

```bash
# 安装Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d api.yourdomain.com

# 自动续期（已自动配置）
```

### 第四步：数据库配置

1. **创建MongoDB Atlas集群**
   - 访问 https://www.mongodb.com/cloud/atlas
   - 创建免费M0集群
   - 选择合适的地域

2. **配置网络访问**
   - Network Access → Add IP Address
   - 添加服务器IP或0.0.0.0/0（允许所有IP）

3. **创建数据库用户**
   - Database Access → Add New Database User
   - 设置用户名和强密码
   - 权限：Read and write to any database

4. **获取连接字符串**
   - Clusters → Connect → Connect your application
   - 复制连接字符串
   - 替换 `<password>` 为实际密码

### 第五步：配置CORS

更新 `backend/server.js`：

```javascript
const corsOptions = {
  origin: [
    'https://your-username.github.io',
    'https://yourdomain.com', // 如果有自定义域名
    'http://localhost:3000' // 开发环境
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## ✅ 部署检查清单

### 前端
- [ ] GitHub仓库已创建
- [ ] GitHub Actions工作流已配置
- [ ] package.json中的homepage已更新
- [ ] 环境变量已配置
- [ ] 代码已推送
- [ ] 部署已成功
- [ ] 网站可以访问

### 后端
- [ ] 云服务器已购买和配置
- [ ] Node.js已安装
- [ ] PM2已安装
- [ ] 代码已部署
- [ ] 环境变量已配置
- [ ] 服务已启动
- [ ] Nginx已配置
- [ ] SSL证书已配置
- [ ] API可以访问

### 数据库
- [ ] MongoDB Atlas集群已创建
- [ ] 网络访问已配置
- [ ] 数据库用户已创建
- [ ] 连接字符串已配置
- [ ] 连接测试成功

### 集成测试
- [ ] 前端可以访问后端API
- [ ] 登录功能正常
- [ ] 数据CRUD功能正常
- [ ] 文件上传功能正常
- [ ] 性能测试通过

## 🔍 测试步骤

### 1. 测试前端

访问：`https://your-username.github.io/warehouse-management`

### 2. 测试后端API

```bash
# 健康检查
curl https://api.yourdomain.com/api/health

# 应该返回：
# {"status":"ok","message":"服务器运行正常"}
```

### 3. 测试完整流程

1. 访问前端网站
2. 尝试注册/登录
3. 测试各项功能
4. 检查控制台是否有错误

## 🐛 常见问题

### 1. 前端无法连接后端

**原因**：CORS配置问题或API地址错误

**解决**：
- 检查后端CORS配置
- 检查前端环境变量
- 检查浏览器控制台错误

### 2. GitHub Pages 404错误

**原因**：路由配置问题

**解决**：
- 使用HashRouter
- 或配置404.html重定向

### 3. API请求失败

**原因**：网络或配置问题

**解决**：
- 检查服务器防火墙
- 检查Nginx配置
- 检查PM2日志

## 📊 监控和维护

### PM2监控

```bash
# 查看进程
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart warehouse-backend
```

### 日志查看

```bash
# Nginx访问日志
sudo tail -f /var/log/nginx/access.log

# Nginx错误日志
sudo tail -f /var/log/nginx/error.log

# PM2日志
pm2 logs warehouse-backend
```

## 🔒 安全建议

1. **定期更新依赖**
   ```bash
   npm audit
   npm update
   ```

2. **使用强密码**
   - JWT_SECRET至少32字符
   - 数据库密码至少16字符

3. **配置防火墙**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

4. **定期备份**
   - 数据库备份
   - 代码备份

## 📚 相关文档

- [GitHub Pages部署指南](./GITHUB_PAGES_DEPLOYMENT.md) - 前端部署
- [Vercel部署指南](./VERCEL_DEPLOYMENT.md) ⭐ **后端部署推荐**
- [免费云服务器部署指南](./FREE_SERVER_DEPLOYMENT.md) - 后端备选方案
- [生产环境部署指南](./PRODUCTION_DEPLOYMENT.md) - 高级配置
- [项目结构说明](../../PROJECT_STRUCTURE.md)

## 💰 成本估算

### 完全免费方案（推荐）⭐
- GitHub Pages：免费（前端）
- Vercel：免费（后端API）
- MongoDB Atlas M0：免费（512MB存储）
- **总成本：$0/月** 🆓
- **部署时间**：约1小时

### 升级方案（可选）
- GitHub Pages：免费
- MongoDB Atlas M2：$9/月（2GB存储）
- Oracle Cloud Free Tier：免费
- **总成本：$9/月**

### 高性能方案
- GitHub Pages：免费
- MongoDB Atlas M10：$57/月（10GB存储）
- 云服务器：$10-20/月（2核4GB）
- **总成本：$67-77/月**

## 🎉 上线后

1. **监控服务状态**
2. **收集用户反馈**
3. **定期更新和维护**
4. **性能优化**

---

**祝部署顺利！** 🚀
