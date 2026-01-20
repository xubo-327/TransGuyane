const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 信任代理（阿里云/Nginx 反向代理必需）
app.set('trust proxy', 1);

// CORS 配置
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || true  // 生产环境：配置前端域名或允许所有
    : true,  // 开发环境：允许所有来源
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 数据库连接（优化Serverless环境）
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/warehouse_management';
const isAtlas = mongoUri.includes('mongodb+srv://');
const isVercel = process.env.VERCEL || process.env.NOW_REGION;

// 连接选项
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: isAtlas ? 10000 : 5000,
  socketTimeoutMS: isAtlas ? 45000 : 45000,
};

// Serverless环境优化：使用连接池和快速连接
if (isVercel) {
  mongooseOptions.maxPoolSize = 10;
  mongooseOptions.minPoolSize = 2;
  mongooseOptions.maxIdleTimeMS = 30000;
}

// 如果已经有连接，复用现有连接（Serverless环境）
if (mongoose.connection.readyState === 0) {
  mongoose.connect(mongoUri, mongooseOptions)
    .then(() => {
      const dbType = isAtlas ? 'MongoDB Atlas (云数据库)' : '本地 MongoDB';
      console.log(`${dbType} 连接成功`);
      console.log(`数据库: ${mongoose.connection.name}`);
      if (isVercel) {
        console.log('运行在Vercel Serverless环境');
      }
    })
    .catch(err => {
      console.error('MongoDB连接失败:', err.message);
      if (isAtlas) {
        console.error('提示: 请检查 MongoDB Atlas 连接字符串和网络访问设置');
      } else {
        console.error('提示: 请确保本地 MongoDB 服务已启动，或配置云数据库连接字符串');
      }
    });
} else {
  console.log('复用现有MongoDB连接');
}

// API根路径
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: '仓库管理系统 API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      orders: '/api/orders',
      batches: '/api/batches',
      messages: '/api/messages',
      users: '/api/users',
      export: '/api/export',
      logistics: '/api/logistics',
      auditLogs: '/api/audit-logs'
    }
  });
});

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));
app.use('/api/export', require('./routes/export'));
app.use('/api/logistics', require('./routes/logistics'));
app.use('/api/audit-logs', require('./routes/auditLogs'));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' });
});

// 导出app供Vercel使用
module.exports = app;

// 如果不是Vercel环境，则启动本地服务器
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
}
