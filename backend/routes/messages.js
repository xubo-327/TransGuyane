const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// 获取对话列表
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // 获取所有与我相关的消息
    const messages = await Message.find({
      $or: [{ from: userId }, { to: userId }]
    })
      .populate('from', 'nickname username avatar')
      .populate('to', 'nickname username avatar')
      .sort({ createdAt: -1 });

    // 构建对话列表
    const conversations = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.from._id.toString() === userId.toString() 
        ? msg.to._id.toString() 
        : msg.from._id.toString();
      
      const otherUser = msg.from._id.toString() === userId.toString() 
        ? msg.to 
        : msg.from;

      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          userId: otherUserId,
          user: otherUser,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0
        });
      }

      // 计算未读消息数
      if (msg.to._id.toString() === userId.toString() && !msg.read) {
        conversations.get(otherUserId).unreadCount++;
      }
    });

    res.json(Array.from(conversations.values()));
  } catch (error) {
    console.error('获取对话列表错误:', error);
    res.status(500).json({ error: '获取对话列表失败' });
  }
});

// 创建新对话（实际上只是验证用户是否存在，对话在发送第一条消息时自动创建）
router.post('/conversation', authenticate, async (req, res) => {
  try {
    const { userId: targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: '请选择对话用户' });
    }

    // 不能和自己对话
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ error: '不能和自己对话' });
    }

    // 验证目标用户是否存在
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: '用户不存在' });
    }

    // 普通用户只能和管理员对话
    if (req.user.role === 'user' && targetUser.role !== 'admin') {
      return res.status(403).json({ error: '只能与管理员通信' });
    }

    // 检查是否已有对话
    const existingMessage = await Message.findOne({
      $or: [
        { from: req.user._id, to: targetUserId },
        { from: targetUserId, to: req.user._id }
      ]
    });

    res.json({
      userId: targetUserId,
      user: {
        _id: targetUser._id,
        nickname: targetUser.nickname,
        username: targetUser.username,
        avatar: targetUser.avatar
      },
      isNew: !existingMessage
    });
  } catch (error) {
    console.error('创建对话错误:', error);
    res.status(500).json({ error: '创建对话失败' });
  }
});

// 获取与特定用户的对话消息
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { from: currentUserId, to: targetUserId },
        { from: targetUserId, to: currentUserId }
      ]
    })
      .populate('from', 'nickname username avatar')
      .populate('to', 'nickname username avatar')
      .sort({ createdAt: 1 });

    // 标记消息为已读
    await Message.updateMany(
      { from: targetUserId, to: currentUserId, read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    console.error('获取对话消息错误:', error);
    res.status(500).json({ error: '获取对话消息失败' });
  }
});

// 发送消息
router.post('/', authenticate, async (req, res) => {
  try {
    const { to, content } = req.body;

    if (!to || !content) {
      return res.status(400).json({ error: '请提供接收人和消息内容' });
    }

    // 验证接收人是否存在
    const toUser = await User.findById(to);
    if (!toUser) {
      return res.status(404).json({ error: '接收人不存在' });
    }

    // 普通用户只能给管理员发消息，管理员可以给任何人发消息
    if (req.user.role === 'user' && toUser.role !== 'admin') {
      return res.status(403).json({ error: '只能与管理员通信' });
    }

    const message = new Message({
      from: req.user._id,
      to,
      content: content.trim()
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('from', 'nickname username avatar')
      .populate('to', 'nickname username avatar');

    res.json(populatedMessage);
  } catch (error) {
    console.error('发送消息错误:', error);
    res.status(500).json({ error: '发送消息失败' });
  }
});

// 标记消息为已读
router.put('/:messageId/read', authenticate, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    
    if (!message) {
      return res.status(404).json({ error: '消息不存在' });
    }

    if (message.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '无权操作此消息' });
    }

    message.read = true;
    await message.save();

    res.json({ message: '已标记为已读' });
  } catch (error) {
    console.error('标记消息已读错误:', error);
    res.status(500).json({ error: '标记失败' });
  }
});

module.exports = router;
