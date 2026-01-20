const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('[ERROR] MONGODB_URI 未配置');
  process.exit(1);
}

console.log('正在连接数据库...');
console.log('连接字符串:', uri.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 45000
})
.then(() => {
  console.log('[SUCCESS] MongoDB Atlas 连接成功！');
  console.log('数据库:', mongoose.connection.name);
  mongoose.connection.close();
  process.exit(0);
})
.catch(err => {
  console.error('[ERROR] 连接失败:', err.message);
  process.exit(1);
});
