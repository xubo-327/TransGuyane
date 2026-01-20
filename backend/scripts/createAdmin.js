const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    // 连接数据库
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/warehouse_management';
    const isAtlas = mongoUri.includes('mongodb+srv://');
    console.log('正在连接数据库...');
    if (isAtlas) {
      console.log('检测到 MongoDB Atlas 云数据库连接');
    }
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: isAtlas ? 10000 : 5000,
      socketTimeoutMS: isAtlas ? 45000 : 45000,
    });
    
    const dbType = isAtlas ? 'MongoDB Atlas (云数据库)' : '本地 MongoDB';
    console.log(`${dbType} 连接成功`);

    const username = 'xubo327';
    const password = '3273279x';

    // 检查是否已存在
    let user = await User.findOne({ username });

    if (user) {
      // 更新现有用户为管理员
      user.role = 'admin';
      user.password = password;
      await user.save();
      console.log(`管理员账号 ${username} 已更新为管理员角色`);
    } else {
      // 创建新管理员
      user = new User({
        username,
        password,
        nickname: '管理员',
        role: 'admin',
        loginType: 'account'
      });
      await user.save();
      console.log(`管理员账号 ${username} 创建成功`);
    }

    console.log('');
    console.log('管理员信息：');
    console.log(`  用户名: ${user.username}`);
    console.log(`  密码: ${password}`);
    console.log(`  角色: ${user.role}`);
    console.log(`  ID: ${user._id}`);
    console.log('');

    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    console.log('');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('创建管理员失败:');
    console.error('  错误信息:', error.message);
    if (error.name === 'MongoServerError' && error.code === 11000) {
      console.error('  原因: 用户名已存在');
    } else if (error.name === 'MongooseError' || error.message.includes('connect')) {
      console.error('  原因: 无法连接到MongoDB数据库');
      const isAtlas = (process.env.MONGODB_URI || '').includes('mongodb+srv://');
      if (isAtlas) {
        console.error('  请检查:');
        console.error('    1. MongoDB Atlas 网络访问是否已配置（IP 白名单）');
        console.error('    2. backend/.env 文件中的 MONGODB_URI 连接字符串是否正确');
        console.error('    3. 数据库用户名和密码是否正确');
        console.error('    4. 网络连接是否正常');
      } else {
        console.error('  请检查:');
        console.error('    1. MongoDB服务是否已启动');
        console.error('    2. backend/.env 文件中的 MONGODB_URI 配置是否正确');
        console.error('    3. 如需使用云数据库，请运行: 配置MongoDB Atlas.bat');
      }
    }
    console.error('');
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

createAdmin();
