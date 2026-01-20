const express = require('express');
const router = express.Router();
const { authenticate, optionalAuthenticate, requireAdmin, requireSuperAdmin } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');
const Batch = require('../models/Batch');
const Order = require('../models/Order');
const User = require('../models/User');

// 获取批次列表（允许未登录用户查看所有批次）
router.get('/', optionalAuthenticate, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search } = req.query;
    const query = {};

    if (search) {
      query.name = new RegExp(search, 'i');
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    let batches = await Batch.find(query)
      .sort({ year: -1, month: -1, period: -1 })
      .skip(skip)
      .limit(parseInt(pageSize));

    // 如果有用户登录且不是管理员，只返回有自己订单的批次
    if (req.user && req.user.role !== 'admin') {
      const userOrderBatches = await Order.distinct('batch', { userId: req.user._id });
      batches = batches.filter(batch => userOrderBatches.includes(batch._id));
    }
    // 未登录用户可以查看所有批次（公开数据）

    // 获取每个批次的详细信息（优化：批量查询）
    const batchIds = batches.map(b => b._id);
    const orderQuery = { batch: { $in: batchIds } };
    if (req.user && req.user.role !== 'admin') {
      orderQuery.userId = req.user._id;
    }

    // 批量获取订单统计
    const orderStats = await Order.aggregate([
      { $match: orderQuery },
      {
        $group: {
          _id: '$batch',
          orderCount: { $sum: 1 },
          orders: {
            $push: {
              _id: '$_id',
              orderNumber: '$orderNumber',
              customerName: '$customerName',
              status: '$status',
              createdAt: '$createdAt',
              userId: '$userId'
            }
          }
        }
      }
    ]);

    const statsMap = new Map(orderStats.map(s => [s._id.toString(), s]));

    // 获取用户信息（批量populate优化）
    const userIds = [...new Set(orderStats.flatMap(s => s.orders.map(o => o.userId).filter(Boolean)))];
    const users = userIds.length > 0 ? await User.find({ _id: { $in: userIds } }).select('_id nickname').lean() : [];
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    const batchesWithDetails = batches.map(batch => {
      const stats = statsMap.get(batch._id.toString());
      const orders = (stats?.orders || []).map(order => ({
        ...order,
        userId: order.userId ? {
          _id: order.userId,
          nickname: userMap.get(order.userId.toString())?.nickname || ''
        } : null
      }));

      return {
        ...batch.toObject(),
        orderCount: stats?.orderCount || 0,
        orders
      };
    });

    const total = await Batch.countDocuments(query);

    res.json({
      batches: batchesWithDetails,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取批次列表错误:', error);
    res.status(500).json({ error: '获取批次列表失败' });
  }
});

// 获取单个批次详情（允许未登录用户查看）
router.get('/:id', optionalAuthenticate, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: '批次不存在' });
    }

    const orderQuery = { batch: batch._id };
    if (req.user && req.user.role !== 'admin') {
      orderQuery.userId = req.user._id;
    }

    const orders = await Order.find(orderQuery)
      .populate('userId', 'nickname')
      .sort({ createdAt: -1 });

    res.json({
      ...batch.toObject(),
      orders
    });
  } catch (error) {
    console.error('获取批次详情错误:', error);
    res.status(500).json({ error: '获取批次详情失败' });
  }
});

// 创建批次（管理员）
router.post('/', authenticate, requireAdmin, logAction('create', 'batch'), async (req, res) => {
  try {
    const { name, period, month, year, dispatchTime } = req.body;

    if (!name || !period || !month || !year) {
      return res.status(400).json({ error: '请提供批次名称、时期、月份和年份' });
    }

    const existingBatch = await Batch.findOne({ name });
    if (existingBatch) {
      return res.status(400).json({ error: '批次已存在' });
    }

    const batch = new Batch({
      name,
      period,
      month: parseInt(month),
      year: parseInt(year),
      dispatchTime: dispatchTime ? new Date(dispatchTime) : null,
      createdBy: req.user._id
    });

    await batch.save();
    res.json(batch);
  } catch (error) {
    console.error('创建批次错误:', error);
    res.status(500).json({ error: '创建批次失败' });
  }
});

// 更新批次（管理员）
router.put('/:id', authenticate, requireAdmin, logAction('update', 'batch'), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: '批次不存在' });
    }

    const { name, period, month, year, dispatchTime } = req.body;

    if (name) batch.name = name;
    if (period) batch.period = period;
    if (month) batch.month = parseInt(month);
    if (year) batch.year = parseInt(year);
    if (dispatchTime !== undefined) batch.dispatchTime = dispatchTime ? new Date(dispatchTime) : null;

    await batch.save();

    // 如果批次名称改变，更新所有关联订单的batchName
    if (name && name !== batch.name) {
      await Order.updateMany(
        { batch: batch._id },
        { $set: { batchName: name } }
      );
    }

    res.json(batch);
  } catch (error) {
    console.error('更新批次错误:', error);
    res.status(500).json({ error: '更新批次失败' });
  }
});

// 删除批次（仅超级管理员）
router.delete('/:id', authenticate, requireSuperAdmin, logAction('delete', 'batch'), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);

    if (!batch) {
      return res.status(404).json({ error: '批次不存在' });
    }

    // 检查是否有订单关联
    const orderCount = await Order.countDocuments({ batch: batch._id });
    if (orderCount > 0) {
      return res.status(400).json({ error: `批次中还有 ${orderCount} 个订单，无法删除` });
    }

    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: '批次已删除' });
  } catch (error) {
    console.error('删除批次错误:', error);
    res.status(500).json({ error: '删除批次失败' });
  }
});

module.exports = router;
