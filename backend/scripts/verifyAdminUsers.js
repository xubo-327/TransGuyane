const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function verifyAdminUsers() {
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
    console.log(`数据库: ${mongoose.connection.name}`);
    console.log('');

    // 定义期望的管理员账户
    const expectedAdmins = [
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

    console.log('='.repeat(70));
    console.log('验证管理员账户一致性');
    console.log('='.repeat(70));
    console.log('');

    const results = [];

    for (const expected of expectedAdmins) {
      try {
        const user = await User.findOne({ username: expected.username });
        
        if (!user) {
          results.push({
            username: expected.username,
            status: 'missing',
            message: '账户不存在'
          });
          console.log(`❌ ${expected.username}: 账户不存在`);
          continue;
        }

        // 验证各个字段
        const issues = [];
        
        if (user.role !== expected.role) {
          issues.push(`角色不匹配: 期望 ${expected.role}, 实际 ${user.role}`);
        }
        
        if (user.loginType !== expected.loginType) {
          issues.push(`登录类型不匹配: 期望 ${expected.loginType}, 实际 ${user.loginType}`);
        }
        
        if (user.nickname !== expected.nickname) {
          issues.push(`昵称不匹配: 期望 ${expected.nickname}, 实际 ${user.nickname}`);
        }

        // 验证密码
        const passwordValid = await user.comparePassword(expected.password);
        if (!passwordValid) {
          issues.push('密码不匹配');
        }

        if (issues.length > 0) {
          results.push({
            username: expected.username,
            status: 'inconsistent',
            issues
          });
          console.log(`⚠️  ${expected.username}: 存在不一致`);
          issues.forEach(issue => console.log(`   - ${issue}`));
        } else {
          results.push({
            username: expected.username,
            status: 'valid',
            role: user.role,
            loginType: user.loginType,
            nickname: user.nickname
          });
          console.log(`✅ ${expected.username}: 验证通过`);
          console.log(`   角色: ${user.role}, 登录类型: ${user.loginType}, 昵称: ${user.nickname}`);
        }
      } catch (error) {
        results.push({
          username: expected.username,
          status: 'error',
          error: error.message
        });
        console.error(`❌ ${expected.username}: 验证失败 - ${error.message}`);
      }
      console.log('');
    }

    // 总结
    console.log('='.repeat(70));
    console.log('验证总结');
    console.log('='.repeat(70));
    console.log('');

    const validCount = results.filter(r => r.status === 'valid').length;
    const invalidCount = results.filter(r => r.status !== 'valid').length;

    console.log(`✅ 验证通过: ${validCount} 个账户`);
    console.log(`❌ 需要修复: ${invalidCount} 个账户`);
    console.log('');

    if (invalidCount > 0) {
      console.log('不一致的账户:');
      results.filter(r => r.status !== 'valid').forEach(result => {
        console.log(`  - ${result.username}: ${result.status}`);
        if (result.issues) {
          result.issues.forEach(issue => console.log(`    ${issue}`));
        }
      });
      console.log('');
      console.log('建议: 运行 node scripts/createAdmin.js 来修复这些账户');
    }

    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    console.log('');
    
    process.exit(invalidCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('');
    console.error('验证失败:');
    console.error('  错误信息:', error.message);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}

verifyAdminUsers();
