# 免费云服务器部署指南

## 🆓 免费云服务器选项

### 推荐方案：Oracle Cloud Free Tier（永久免费）

**优势**：
- ✅ **永久免费**（不是试用期）
- ✅ 2个AMD实例（每个1核1GB）或4个ARM实例（每个4核24GB）
- ✅ 10TB出站流量/月
- ✅ 200GB存储空间
- ✅ 支持Ubuntu系统

**注册地址**：https://www.oracle.com/cloud/free/

---

## 🚀 Oracle Cloud 部署步骤

### 第一步：注册和创建实例

#### 1.1 注册账号

1. 访问 https://www.oracle.com/cloud/free/
2. 点击 "Start for Free"
3. 填写注册信息（需要信用卡验证，但不会扣费）
4. 验证邮箱和手机号

#### 1.2 创建计算实例

1. 登录Oracle Cloud控制台
2. 导航到：**Compute** → **Instances**
3. 点击 **Create Instance**

**配置选项**：
- **Name**: `warehouse-backend`
- **Image**: Ubuntu 22.04 LTS
- **Shape**: 
  - 选择 **Always Free Eligible**
  - AMD: 1 OCPU, 1GB内存（推荐用于小项目）
  - ARM: 4 OCPU, 24GB内存（推荐，性能更好）
- **Networking**: 使用默认VCN
- **SSH Keys**: 上传你的SSH公钥或让系统生成

4. 点击 **Create**

#### 1.3 配置安全规则（重要！）

1. 导航到：**Networking** → **Virtual Cloud Networks**
2. 选择你的VCN → **Security Lists** → **Default Security List**
3. 点击 **Add Ingress Rules**，添加以下规则：

**规则1：SSH（22端口）**
- Source Type: CIDR
- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port Range: `22`

**规则2：HTTP（80端口）**
- Source Type: CIDR
- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port Range: `80`

**规则3：HTTPS（443端口）**
- Source Type: CIDR
- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port Range: `443`

**规则4：后端API（5000端口）**
- Source Type: CIDR
- Source CIDR: `0.0.0.0/0`
- IP Protocol: TCP
- Destination Port Range: `5000`

4. 点击 **Add Ingress Rules** 保存

### 第二步：连接到服务器

#### 2.1 获取公网IP

1. 在实例详情页面，找到 **Public IP Address**
2. 复制这个IP地址

#### 2.2 SSH连接

**Windows用户**（使用PowerShell或Git Bash）：
```bash
ssh -i path/to/your-private-key ubuntu@your-public-ip
```

**Mac/Linux用户**：
```bash
ssh -i ~/.ssh/your-private-key ubuntu@your-public-ip
```

**首次连接**：
```bash
# 如果使用系统生成的密钥，下载私钥文件后
chmod 400 path/to/your-private-key
ssh -i path/to/your-private-key ubuntu@your-public-ip
```

### 第三步：服务器初始化

#### 3.1 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

#### 3.2 安装Node.js

```bash
# 安装Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v  # 应该显示 v18.x.x
npm -v   # 应该显示 9.x.x
```

#### 3.3 安装PM2

```bash
sudo npm install -g pm2
```

#### 3.4 安装Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 3.5 安装Git

```bash
sudo apt install git -y
```

### 第四步：部署后端代码

#### 4.1 克隆项目

```bash
# 创建项目目录
sudo mkdir -p /var/www/warehouse
cd /var/www/warehouse

# 克隆项目（替换为你的GitHub仓库地址）
git clone https://github.com/your-username/warehouse-management.git .

# 进入后端目录
cd backend
```

#### 4.2 安装依赖

```bash
npm install --production
```

#### 4.3 配置环境变量

```bash
# 创建.env文件
nano .env
```

添加以下内容（根据实际情况修改）：

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/warehouse_management?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_secret_key_at_least_32_characters_long_change_this
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
NODE_ENV=production
FRONTEND_URL=https://your-username.github.io
```

保存文件：`Ctrl + X`，然后 `Y`，然后 `Enter`

#### 4.4 启动服务

```bash
# 使用PM2启动
pm2 start server.js --name warehouse-backend

# 设置开机自启
pm2 startup
# 执行上面命令输出的命令（通常是sudo开头的）
pm2 save

# 查看状态
pm2 status
pm2 logs warehouse-backend
```

### 第五步：配置Nginx反向代理

#### 5.1 创建Nginx配置

```bash
sudo nano /etc/nginx/sites-available/warehouse-api
```

添加以下配置（将 `api.yourdomain.com` 替换为你的域名，或使用IP地址）：

```nginx
server {
    listen 80;
    server_name your-public-ip;  # 或使用域名 api.yourdomain.com

    # 增加请求体大小限制（用于文件上传）
    client_max_body_size 10M;

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
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

保存文件。

#### 5.2 启用配置

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/warehouse-api /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

#### 5.3 测试API

```bash
# 测试本地API
curl http://localhost:5000/api/health

# 测试公网API（使用你的公网IP）
curl http://your-public-ip/api/health
```

应该返回：
```json
{"status":"ok","message":"服务器运行正常"}
```

### 第六步：配置SSL证书（可选但推荐）

#### 6.1 安装Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 6.2 获取SSL证书

**如果有域名**：
```bash
sudo certbot --nginx -d api.yourdomain.com
```

**如果只有IP地址**：
- Certbot不支持IP地址的SSL证书
- 可以使用Cloudflare的免费SSL（需要域名）
- 或者暂时使用HTTP（不推荐生产环境）

### 第七步：配置CORS

更新 `backend/server.js` 中的CORS配置：

```javascript
const corsOptions = {
  origin: [
    'https://your-username.github.io',
    'http://your-public-ip',  // 临时测试用
    'http://localhost:3000'   // 开发环境
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

然后重启服务：
```bash
pm2 restart warehouse-backend
```

---

## 🔧 其他免费云服务器选项

### 1. Google Cloud Platform Free Tier

**免费额度**：
- $300免费额度（90天）
- 1个f1-micro实例（永久免费，但性能较低）

**注册地址**：https://cloud.google.com/free

### 2. AWS Free Tier

**免费额度**：
- 12个月免费
- t2.micro实例（1核1GB）

**注册地址**：https://aws.amazon.com/free/

### 3. Azure Free Tier

**免费额度**：
- $200免费额度（30天）
- 12个月免费服务

**注册地址**：https://azure.microsoft.com/free/

### 4. 阿里云/腾讯云

**免费试用**：
- 通常有7-30天免费试用期
- 需要实名认证

---

## 📊 Oracle Cloud 免费资源限制

| 资源 | 免费额度 |
|------|---------|
| 计算实例 | 2个AMD（1核1GB）或4个ARM（4核24GB） |
| 存储 | 200GB |
| 出站流量 | 10TB/月 |
| 入站流量 | 无限 |
| 数据库 | 2个Autonomous Database（各20GB） |

**注意**：ARM实例性能更好，推荐使用ARM实例。

---

## ✅ 部署检查清单

- [ ] Oracle Cloud账号已注册
- [ ] 计算实例已创建
- [ ] 安全规则已配置（22, 80, 443, 5000端口）
- [ ] SSH连接成功
- [ ] Node.js已安装
- [ ] PM2已安装
- [ ] Nginx已安装
- [ ] 项目代码已部署
- [ ] 环境变量已配置
- [ ] 服务已启动
- [ ] Nginx已配置
- [ ] API可以访问
- [ ] CORS已配置

---

## 🐛 常见问题

### 1. 无法SSH连接

**原因**：安全规则未配置或IP被阻止

**解决**：
- 检查安全规则是否允许22端口
- 检查实例是否运行中
- 尝试使用不同的网络

### 2. API无法访问

**原因**：防火墙或安全规则问题

**解决**：
- 检查安全规则是否允许5000端口
- 检查Nginx配置
- 检查PM2服务状态

### 3. 内存不足

**原因**：免费实例内存较小（1GB）

**解决**：
- 使用ARM实例（24GB内存）
- 优化Node.js内存使用
- 使用swap空间

### 4. 性能较慢

**原因**：免费实例CPU性能有限

**解决**：
- 使用ARM实例（4核）
- 优化代码性能
- 使用CDN加速静态资源

---

## 💡 优化建议

### 1. 使用ARM实例

Oracle Cloud的ARM实例（4核24GB）性能更好，推荐使用。

### 2. 配置Swap空间

如果使用AMD实例（1GB内存），可以配置swap：

```bash
# 创建2GB swap文件
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久启用
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3. 使用PM2集群模式

```bash
# 使用所有CPU核心
pm2 start server.js -i max --name warehouse-backend
```

### 4. 配置Nginx缓存

在Nginx配置中添加缓存：

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

server {
    # ... 其他配置 ...
    
    location /api/ {
        proxy_cache api_cache;
        proxy_cache_valid 200 10m;
        # ... 其他配置 ...
    }
}
```

---

## 📚 相关文档

- [完整部署方案](./DEPLOYMENT_PLAN.md)
- [生产环境部署指南](./PRODUCTION_DEPLOYMENT.md)
- [GitHub Pages部署指南](./GITHUB_PAGES_DEPLOYMENT.md)

---

## 🎉 总结

使用Oracle Cloud Free Tier可以**完全免费**部署后端服务，包括：

- ✅ 永久免费的计算实例
- ✅ 充足的存储空间
- ✅ 足够的网络流量
- ✅ 支持HTTPS（需要域名）

**总成本：$0/月** 🆓

---

**最后更新**：2026年1月
