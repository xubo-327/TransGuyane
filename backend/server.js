const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 信任代理（阿里云/Nginx 反向代理必需）
app.set('trust proxy', 1);

// CORS 配置
// GitHub Pages 部署在子目录时，浏览器发送的 origin 只包含域名，不包含子路径
const allowedOrigins = process.env.NODE_ENV === 'production' && process.env.FRONTEND_URL
  ? [
      process.env.FRONTEND_URL,  // 例如: https://xubo-327.github.io
      `${process.env.FRONTEND_URL}/TransGuyane`,  // 如果需要，也可以支持子路径
      `${process.env.FRONTEND_URL}/TransGuyane/`  // 支持尾部斜杠
    ]
  : true;  // 开发环境或未配置时允许所有来源

const corsOptions = {
  origin: allowedOrigins,
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

// 临时端点：批量创建管理员账户（仅在第一次部署时使用，创建后建议删除）
app.post('/api/create-admins', async (req, res) => {
  try {
    // 确保数据库已连接
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri, mongooseOptions);
    }

    const User = require('./models/User');
    
    // 定义要创建的管理员账户列表
    const adminUsers = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'superadmin',
        nickname: '超级管理员',
        loginType: 'account'
      },
      {
        username: 'xubo327',
        password: '3273279x',
        role: 'admin',
        nickname: '普通管理员',
        loginType: 'account'
      },
      {
        username: 'zhousuda',
        password: '20260101',
        role: 'admin',
        nickname: '普通管理员',
        loginType: 'account'
      }
    ];

    const results = [];
    
    for (const userData of adminUsers) {
      try {
        // 检查是否已存在
        let user = await User.findOne({ username: userData.username });

        if (user) {
          // 更新现有用户为管理员
          user.role = userData.role;
          user.password = userData.password;
          user.nickname = userData.nickname;
          await user.save();
          results.push({
            username: userData.username,
            status: 'updated',
            role: user.role,
            message: `管理员账号 ${userData.username} 已更新`
          });
        } else {
          // 创建新管理员
          user = new User(userData);
          await user.save();
          results.push({
            username: userData.username,
            status: 'created',
            role: user.role,
            message: `管理员账号 ${userData.username} 创建成功`
          });
        }
      } catch (error) {
        results.push({
          username: userData.username,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: '批量创建管理员账户完成',
      results,
      accounts: adminUsers.map(u => ({
        username: u.username,
        password: u.password,
        role: u.role,
        nickname: u.nickname
      }))
    });
  } catch (error) {
    console.error('批量创建管理员失败:', error);
    res.status(500).json({
      success: false,
      error: '批量创建管理员失败',
      message: error.message
    });
  }
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
