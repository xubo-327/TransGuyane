const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 正确的连接字符串格式
const CORRECT_URI = 'mongodb+srv://TransGuyane:7TZd5SQxFjHgZ9H5@cluster0.4ooxxyp.mongodb.net/warehouse_management?retryWrites=true&w=majority';

function fixEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  console.log('========================================');
  console.log('修复 MongoDB Atlas 连接字符串');
  console.log('========================================');
  console.log();
  
  // 检查 .env 文件是否存在
  if (!fs.existsSync(envPath)) {
    console.log('[INFO] .env 文件不存在，正在创建...');
    const defaultEnv = `PORT=5000
MONGODB_URI=${CORRECT_URI}
JWT_SECRET=warehouse_management_secret_key_2024_change_in_production
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
`;
    fs.writeFileSync(envPath, defaultEnv, 'utf8');
    console.log('[OK] .env 文件已创建');
  } else {
    console.log('[步骤 1/3] 读取当前 .env 文件...');
    let envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    console.log();
    console.log('当前 MONGODB_URI 值:');
    const currentMongoLine = lines.find(line => line.startsWith('MONGODB_URI='));
    if (currentMongoLine) {
      console.log(currentMongoLine);
    }
    console.log();
    
    console.log('[步骤 2/3] 验证连接字符串格式...');
    
    // 检查格式
    let needsFix = false;
    if (!currentMongoLine) {
      console.log('[检测到] 未找到 MONGODB_URI 配置');
      needsFix = true;
    } else {
      const currentURI = currentMongoLine.replace('MONGODB_URI=', '').trim();
      
      // 检查是否包含必需的组件
      if (!currentURI.includes('warehouse_management')) {
        console.log('[检测到] 缺少数据库名称');
        needsFix = true;
      }
      
      if (!currentURI.includes('retryWrites=true')) {
        console.log('[检测到] retryWrites 参数格式不正确');
        needsFix = true;
      }
      
      if (!currentURI.includes('w=majority')) {
        console.log('[检测到] 缺少 w=majority 参数');
        needsFix = true;
      }
      
      // 检查是否有格式错误（如只有 retrywrites 没有值）
      if (currentURI.includes('?retrywrites') && !currentURI.includes('retryWrites=true')) {
        console.log('[检测到] retrywrites 参数缺少值');
        needsFix = true;
      }
    }
    
    console.log();
    
    if (needsFix) {
      console.log('[步骤 3/3] 修复连接字符串...');
      console.log();
      console.log('正确的连接字符串:');
      console.log(`MONGODB_URI=${CORRECT_URI}`);
      console.log();
      
      // 备份原文件
      const backupPath = envPath + '.backup';
      fs.copyFileSync(envPath, backupPath);
      console.log(`[OK] 已备份原文件到: ${backupPath}`);
      
      // 更新 .env 文件
      const updatedLines = lines.map(line => {
        if (line.startsWith('MONGODB_URI=')) {
          return `MONGODB_URI=${CORRECT_URI}`;
        }
        return line;
      });
      
      // 如果没有找到 MONGODB_URI，添加它
      if (!lines.some(line => line.startsWith('MONGODB_URI='))) {
        updatedLines.push(`MONGODB_URI=${CORRECT_URI}`);
      }
      
      fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');
      console.log('[OK] .env 文件已更新');
    } else {
      console.log('[步骤 3/3] 连接字符串格式正确，无需修复');
    }
  }
  
  console.log();
  console.log('========================================');
  console.log('验证修复结果');
  console.log('========================================');
  console.log();
  
  // 重新读取验证
  const finalEnvContent = fs.readFileSync(envPath, 'utf8');
  const finalMongoLine = finalEnvContent.split('\n').find(line => line.startsWith('MONGODB_URI='));
  
  if (finalMongoLine) {
    console.log('更新后的 MONGODB_URI:');
    console.log(finalMongoLine);
    console.log();
    
    const finalURI = finalMongoLine.replace('MONGODB_URI=', '').trim();
    const checks = {
      '包含数据库名称': finalURI.includes('warehouse_management'),
      '包含 retryWrites=true': finalURI.includes('retryWrites=true'),
      '包含 w=majority': finalURI.includes('w=majority'),
      '格式正确': finalURI === CORRECT_URI
    };
    
    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`${passed ? '[OK]' : '[ERROR]'} ${check}`);
    });
    
    if (finalURI === CORRECT_URI) {
      console.log();
      console.log('========================================');
      console.log('[SUCCESS] 连接字符串修复完成');
      console.log('========================================');
      process.exit(0);
    } else {
      console.log();
      console.log('[WARNING] 连接字符串格式可能仍有问题');
      process.exit(1);
    }
  } else {
    console.log('[ERROR] 未能读取 MONGODB_URI');
    process.exit(1);
  }
}

fixEnvFile();
