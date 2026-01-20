const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // 账号密码登录字段
  username: {
    type: String,
    sparse: true,
    unique: true,
    index: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  email: {
    type: String,
    sparse: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    sparse: true,
    unique: true,
    index: true,
    trim: true
  },
  password: {
    type: String,
    minlength: 6
  },
  // 微信登录字段
  openid: {
    type: String,
    sparse: true,
    unique: true,
    index: true
  },
  nickname: {
    type: String,
    default: '用户'
  },
  avatar: {
    type: String,
    default: ''
  },
  loginType: {
    type: String,
    enum: ['account', 'wechat'],
    default: 'account'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
});

// 密码加密中间件
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 密码验证方法
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
