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

    console.log('');
    console.log('开始批量创建管理员账户...');
    console.log('');

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
          user.loginType = userData.loginType;
          await user.save();
          results.push({
            username: userData.username,
            status: 'updated',
            role: userData.role,
            password: userData.password
          });
          console.log(`✓ 管理员账号 ${userData.username} (${userData.role}) 已更新`);
        } else {
          // 创建新管理员
          user = new User(userData);
          await user.save();
          results.push({
            username: userData.username,
            status: 'created',
            role: userData.role,
            password: userData.password
          });
          console.log(`✓ 管理员账号 ${userData.username} (${userData.role}) 创建成功`);
        }
      } catch (error) {
        console.error(`✗ 管理员账号 ${userData.username} 创建失败:`, error.message);
        results.push({
          username: userData.username,
          status: 'error',
          error: error.message
        });
      }
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('管理员账户创建完成');
    console.log('='.repeat(60));
    console.log('');
    
    // 显示成功创建的账户信息
    const successResults = results.filter(r => r.status !== 'error');
    if (successResults.length > 0) {
      console.log('已创建/更新的管理员账户：');
      console.log('');
      successResults.forEach((result, index) => {
        console.log(`${index + 1}. 用户名: ${result.username}`);
        console.log(`   密码: ${result.password}`);
        console.log(`   角色: ${result.role}`);
        console.log(`   状态: ${result.status === 'created' ? '新建' : '已更新'}`);
        console.log('');
      });
    }

    // 显示失败的账户
    const errorResults = results.filter(r => r.status === 'error');
    if (errorResults.length > 0) {
      console.log('创建失败的账户：');
      errorResults.forEach(result => {
        console.log(`  - ${result.username}: ${result.error}`);
      });
      console.log('');
    }

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
