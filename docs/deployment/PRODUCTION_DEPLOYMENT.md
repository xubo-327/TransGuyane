# 生产环境部署指南

## 📋 部署架构

```
┌─────────────────┐
│  GitHub Pages   │  ← 前端静态文件
│  (前端部署)      │
└────────┬────────┘
         │ HTTPS
         │ API请求
         ▼
┌─────────────────┐
│   云服务器      │  ← 后端API服务
│  (Node.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MongoDB Atlas  │  ← 云数据库
│  (云数据库)      │
└─────────────────┘
```

## 🚀 部署步骤

### 第一部分：前端部署到GitHub Pages

参考 [GitHub Pages部署指南](./GITHUB_PAGES_DEPLOYMENT.md)

### 第二部分：后端部署到云服务器

#### 选项1：使用云服务器（推荐）

##### 1. 准备服务器

**推荐配置**：
- CPU: 2核
- 内存: 4GB
- 系统: Ubuntu 20.04 LTS
- 带宽: 5Mbps

##### 2. 安装Node.js

```bash
# 使用NodeSource安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

##### 3. 安装PM2（进程管理）

```bash
sudo npm install -g pm2
```

##### 4. 克隆项目

```bash
cd /var/www
git clone https://github.com/your-username/warehouse-management.git
cd warehouse-management/backend
```

##### 5. 安装依赖

```bash
npm install --production
```

##### 6. 配置环境变量

创建 `.env` 文件：

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/warehouse_management?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_secret_key_here_change_in_production
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
NODE_ENV=production
FRONTEND_URL=https://your-username.github.io
```

##### 7. 启动服务

```bash
# 使用PM2启动
pm2 start server.js --name warehouse-backend

# 设置开机自启
pm2 startup
pm2 save
```

##### 8. 配置Nginx反向代理

安装Nginx：

```bash
sudo apt update
sudo apt install nginx
```

配置Nginx：

```bash
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
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/warehouse-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

##### 9. 配置SSL证书（Let's Encrypt）

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

#### 选项2：使用Docker部署

##### 1. 安装Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

##### 2. 构建镜像

```bash
cd backend
docker build -t warehouse-backend .
```

##### 3. 运行容器

```bash
docker run -d \
  --name warehouse-backend \
  -p 5000:5000 \
  --env-file .env \
  warehouse-backend
```

### 第三部分：数据库配置

#### 使用MongoDB Atlas（推荐）

1. **创建集群**
   - 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - 创建免费集群（M0）

2. **配置网络访问**
   - 在Network Access中添加服务器IP或0.0.0.0/0（允许所有IP）

3. **创建数据库用户**
   - 在Database Access中创建用户
   - 设置强密码

4. **获取连接字符串**
   - 在Clusters中点击Connect
   - 选择Connect your application
   - 复制连接字符串
   - 替换 `<password>` 为实际密码

5. **配置连接字符串**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/warehouse_management?retryWrites=true&w=majority
   ```

## 🔧 配置CORS

确保后端允许GitHub Pages域名访问：

```javascript
// backend/server.js
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

## 📊 部署检查清单

### 前端
- [ ] GitHub仓库已创建
- [ ] GitHub Actions已配置
- [ ] package.json中的homepage已更新
- [ ] 环境变量已配置（REACT_APP_API_URL）
- [ ] 代码已推送到main分支
- [ ] 网站可以正常访问

### 后端
- [ ] 云服务器已准备
- [ ] Node.js已安装
- [ ] PM2已安装
- [ ] 项目代码已部署
- [ ] 环境变量已配置
- [ ] 服务已启动
- [ ] Nginx已配置
- [ ] SSL证书已配置
- [ ] API可以正常访问

### 数据库
- [ ] MongoDB Atlas集群已创建
- [ ] 网络访问已配置
- [ ] 数据库用户已创建
- [ ] 连接字符串已配置
- [ ] 连接测试成功

### 安全
- [ ] JWT_SECRET已更改
- [ ] 数据库密码已设置
- [ ] CORS已正确配置
- [ ] HTTPS已启用
- [ ] 防火墙已配置

## 🔍 测试部署

### 1. 测试前端

访问：`https://your-username.github.io/warehouse-management`

### 2. 测试后端API

```bash
curl https://api.yourdomain.com/api/health
```

应该返回：
```json
{
  "status": "ok",
  "message": "服务器运行正常"
}
```

### 3. 测试完整流程

1. 访问前端网站
2. 尝试登录
3. 检查API请求是否正常
4. 测试各项功能

## 🛠️ 维护和监控

### PM2监控

```bash
# 查看进程状态
pm2 status

# 查看日志
pm2 logs warehouse-backend

# 重启服务
pm2 restart warehouse-backend

# 停止服务
pm2 stop warehouse-backend
```

### 日志管理

```bash
# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看PM2日志
pm2 logs
```

### 备份数据库

MongoDB Atlas提供自动备份，也可以手动备份：

```bash
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/warehouse_management"
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

3. **限制API访问**
   - 配置防火墙
   - 使用API密钥（可选）

4. **监控和告警**
   - 设置服务器监控
   - 配置错误告警

## 📚 相关文档

- [PM2文档](https://pm2.keymetrics.io/)
- [Nginx文档](https://nginx.org/en/docs/)
- [MongoDB Atlas文档](https://docs.atlas.mongodb.com/)
- [Let's Encrypt文档](https://letsencrypt.org/docs/)
