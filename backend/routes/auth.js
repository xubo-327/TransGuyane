const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// 用户注册
router.post('/register', [
  body('username').trim().isLength({ min: 2, max: 20 }).withMessage('姓名长度必须在2-20个字符之间'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
  body('email').optional().isEmail().withMessage('邮箱格式不正确'),
  body('phone').optional().matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { username, password, email, phone, nickname } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ 
      $or: [
        { username },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : [])
      ]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: '用户名已存在' });
      }
      if (email && existingUser.email === email) {
        return res.status(400).json({ error: '邮箱已被注册' });
      }
      if (phone && existingUser.phone === phone) {
        return res.status(400).json({ error: '手机号已被注册' });
      }
    }

    // 创建新用户
    const user = new User({
      username,
      password,
      email: email || undefined,
      phone: phone || undefined,
      nickname: nickname || username,
      loginType: 'account',
      role: 'user'
    });

    await user.save();

    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        loginType: user.loginType
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ error: `${field === 'username' ? '用户名' : field === 'email' ? '邮箱' : '手机号'}已存在` });
    }
    res.status(500).json({ error: '注册失败，请重试' });
  }
});

// 账号密码登录
router.post('/login', [
  body('username').notEmpty().withMessage('请输入用户名或邮箱或手机号'),
  body('password').notEmpty().withMessage('请输入密码')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { username, password } = req.body;

    // 查找用户（支持用户名、邮箱、手机号登录）
    const user = await User.findOne({
      $or: [
        { username },
        { email: username },
        { phone: username }
      ],
      loginType: 'account'
    });

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        loginType: user.loginType
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '登录失败，请重试' });
  }
});

// 微信登录
router.post('/wechat', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: '缺少授权码' });
    }

    // 开发模式：如果 code 是 mock_code_ 开头，则使用模拟登录
    if (code && code.startsWith('mock_code_')) {
      // 使用时间戳和随机字符串作为 openid，确保唯一性
      const mockOpenid = `mock_openid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 查找或创建用户
      let user = await User.findOne({ openid: mockOpenid });
      
      if (!user) {
        user = new User({
          openid: mockOpenid,
          nickname: req.body.nickname || '微信测试用户',
          avatar: req.body.avatar || '',
          loginType: 'wechat',
          role: 'user'
        });
        await user.save();
      } else {
        user.lastLoginAt = new Date();
        if (req.body.nickname) user.nickname = req.body.nickname;
        if (req.body.avatar) user.avatar = req.body.avatar;
        await user.save();
      }

      // 生成JWT token
      const token = jwt.sign(
        { userId: user._id, openid: user.openid, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: user._id,
          openid: user.openid,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
          loginType: user.loginType
        }
      });
    }

    // 生产模式：调用微信API
    const APPID = process.env.WECHAT_APPID || 'your_appid';
    const SECRET = process.env.WECHAT_SECRET || 'your_secret';

    if (APPID === 'your_appid' || SECRET === 'your_secret') {
      return res.status(400).json({ error: '请配置真实的微信AppID和Secret' });
    }

    // 获取openid
    const wechatResponse = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: APPID,
        secret: SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key, errcode, errmsg } = wechatResponse.data;

    if (errcode) {
      return res.status(400).json({ error: `微信登录失败: ${errmsg}` });
    }

    if (!openid) {
      return res.status(400).json({ error: '获取openid失败' });
    }

    // 查找或创建用户
    let user = await User.findOne({ openid });
    
    if (!user) {
      user = new User({
        openid,
        nickname: req.body.nickname || '微信用户',
        avatar: req.body.avatar || '',
        loginType: 'wechat',
        role: 'user'
      });
      await user.save();
    } else {
      user.lastLoginAt = new Date();
      if (req.body.nickname) user.nickname = req.body.nickname;
      if (req.body.avatar) user.avatar = req.body.avatar;
      await user.save();
    }

    // 生成JWT token
    const token = jwt.sign(
      { userId: user._id, openid: user.openid, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        loginType: user.loginType
      }
    });
  } catch (error) {
    console.error('微信登录错误:', error);
    res.status(500).json({ error: '登录失败，请重试' });
  }
});

// 验证token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '未提供token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        openid: user.openid,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        loginType: user.loginType
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'token无效' });
  }
});

module.exports = router;
