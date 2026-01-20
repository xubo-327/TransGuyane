const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 认证中间件（必须登录）
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: '未授权，请先登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'token无效或已过期' });
  }
};

// 可选认证中间件（允许未登录访问，但如果提供token则验证）
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        const user = await User.findById(decoded.userId);
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // token无效但允许继续（未登录访问）
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// 管理员权限中间件（普通管理员或超级管理员）
const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
};

// 超级管理员权限中间件（仅超级管理员）
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: '需要超级管理员权限' });
  }
  next();
};

module.exports = { authenticate, optionalAuthenticate, requireAdmin, requireSuperAdmin };
