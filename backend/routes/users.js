const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');
const User = require('../models/User');

// 搜索用户（用于新建对话，管理员可以搜索所有用户，普通用户只能搜索管理员）
router.get('/search', authenticate, async (req, res) => {
  try {
    const { keyword } = req.query;
    const query = {};

    // 普通用户只能搜索管理员，管理员可以搜索所有用户
    if (req.user.role !== 'admin') {
      query.role = 'admin';
    }

    if (keyword) {
      query.$or = [
        { nickname: new RegExp(keyword, 'i') },
        { username: new RegExp(keyword, 'i') }
      ];
    }

    // 排除自己
    query._id = { $ne: req.user._id };

    const users = await User.find(query)
      .select('_id nickname username avatar role')
      .limit(20)
      .lean();

    res.json(users);
  } catch (error) {
    console.error('搜索用户错误:', error);
    res.status(500).json({ error: '搜索用户失败' });
  }
});

// 获取用户列表（管理员）
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, role, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { nickname: new RegExp(search, 'i') },
        { username: new RegExp(search, 'i') },
        { openid: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ error: '获取用户列表失败' });
  }
});

// 获取单个用户
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).json({ error: '获取用户失败' });
  }
});

// 更新用户角色（仅超级管理员）
router.put('/:id/role', authenticate, requireSuperAdmin, logAction('update', 'user'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: '无效的角色' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 不能修改自己的角色
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: '不能修改自己的角色' });
    }

    user.role = role;
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('更新用户角色错误:', error);
    res.status(500).json({ error: '更新用户角色失败' });
  }
});

// 删除用户（管理员）
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 不能删除自己
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: '不能删除自己的账号' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: '用户已删除' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ error: '删除用户失败' });
  }
});

module.exports = router;
