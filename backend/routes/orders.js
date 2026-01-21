const express = require('express');
const router = express.Router();
const { authenticate, optionalAuthenticate, requireAdmin } = require('../middleware/auth');
const { logAction } = require('../middleware/auditLogger');
const Order = require('../models/Order');
const Batch = require('../models/Batch');

// 搜索订单（允许未登录用户搜索所有公开订单）
router.get('/search', optionalAuthenticate, async (req, res) => {
  try {
    const { orderNumber } = req.query;

    if (!orderNumber) {
      return res.status(400).json({ error: '请输入单号' });
    }

    const query = { orderNumber: new RegExp(orderNumber, 'i') };

    // 管理员可以搜索所有订单
    // 已登录普通用户只能搜索自己的订单
    // 未登录用户可以搜索所有订单（公开数据）
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      query.userId = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('userId', 'nickname username')
      .populate('batch', 'name')
      .sort({ createdAt: -1 })
      .lean();

    // 未登录用户隐藏客户姓名（显示为密文）
    if (!req.user) {
      orders.forEach(order => {
        if (order.customerName && order.customerName.length > 0) {
          order.customerName = order.customerName.charAt(0) + '*'.repeat(order.customerName.length - 1);
        }
      });
    }

    res.json(orders);
  } catch (error) {
    console.error('搜索订单错误:', error);
    res.status(500).json({ error: '搜索失败' });
  }
});

// 获取订单列表（允许未登录用户查看）
router.get('/', optionalAuthenticate, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, batchName, customerName, search } = req.query;
    const query = {};

    // 管理员可以查看所有订单
    // 已登录普通用户只能查看自己的订单
    // 未登录用户可以查看所有订单（公开数据）
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      query.userId = req.user._id;
    }

    if (status) query.status = status;
    if (batchName) query.batchName = new RegExp(batchName, 'i');
    if (customerName) query.customerName = new RegExp(customerName, 'i');
    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { customerName: new RegExp(search, 'i') },
        { batchName: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const orders = await Order.find(query)
      .populate('userId', 'nickname username')
      .populate('batch', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean();

    // 未登录用户隐藏客户姓名（显示为密文）
    // 登录普通用户已经通过query.userId过滤，只能看到自己的订单，显示真实姓名
    // 管理员可以看到所有真实姓名
    if (!req.user) {
      orders.forEach(order => {
        if (order.customerName && order.customerName.length > 0) {
          order.customerName = order.customerName.charAt(0) + '*'.repeat(order.customerName.length - 1);
        }
      });
    }

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({ error: '获取订单列表失败' });
  }
});

// =============== 管理员专用接口 ===============

// 管理员获取所有订单列表（不受用户限制）
router.get('/admin/list', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, pageSize = 20, status, batchId, batchName, customerName, search, orderNumber } = req.query;
    const query = {};

    if (status) query.status = status;
    if (batchId) query.batch = batchId;
    if (batchName) query.batchName = new RegExp(batchName, 'i');
    if (customerName) query.customerName = new RegExp(customerName, 'i');
    if (orderNumber) query.orderNumber = new RegExp(orderNumber, 'i');
    if (search) {
      query.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { customerName: new RegExp(search, 'i') },
        { batchName: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(pageSize);

    const orders = await Order.find(query)
      .populate('userId', 'nickname username')
      .populate('batch', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(pageSize))
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize)
    });
  } catch (error) {
    console.error('管理员获取订单列表错误:', error);
    res.status(500).json({ error: '获取订单列表失败' });
  }
});

// 管理员创建单个订单
router.post('/admin/create', authenticate, requireAdmin, logAction('create', 'order'), async (req, res) => {
  try {
    const { orderNumber, customerName, batchId, status, logisticsInfo } = req.body;

    if (!orderNumber) {
      return res.status(400).json({ error: '请提供单号' });
    }

    // 检查单号是否已存在
    const existingOrder = await Order.findOne({ orderNumber });
    if (existingOrder) {
      return res.status(400).json({ error: '该单号已存在' });
    }

    let batch = null;
    let batchName = '';

    if (batchId) {
      batch = await Batch.findById(batchId);
      if (batch) {
        batchName = batch.name;
      }
    }

    const newOrder = new Order({
      orderNumber: orderNumber.trim(),
      customerName: customerName || '',
      batch: batch?._id || null,
      batchName: batchName,
      status: status || '在路上',
      logisticsInfo: logisticsInfo || '',
      createdBy: 'admin',
    });

    await newOrder.save();

    // 更新批次订单数量
    if (batch) {
      batch.orderCount = await Order.countDocuments({ batch: batch._id });
      await batch.save();
    }

    res.json(newOrder);
  } catch (error) {
    console.error('管理员创建订单错误:', error);
    res.status(500).json({ error: '创建订单失败' });
  }
});

// 管理员更新订单
router.put('/admin/:id', authenticate, requireAdmin, logAction('update', 'order'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    const { orderNumber, customerName, batchId, status, logisticsInfo } = req.body;

    // 如果更改单号，检查是否重复
    if (orderNumber && orderNumber !== order.orderNumber) {
      const existingOrder = await Order.findOne({ orderNumber, _id: { $ne: order._id } });
      if (existingOrder) {
        return res.status(400).json({ error: '该单号已存在' });
      }
      order.orderNumber = orderNumber.trim();
    }

    if (customerName !== undefined) order.customerName = customerName;
    if (status) order.status = status;
    if (logisticsInfo !== undefined) {
      order.logisticsInfo = logisticsInfo;
      order.logisticsUpdateTime = new Date();
      // 如果物流信息包含"已签收"，自动更新状态
      if (logisticsInfo.includes('已签收') || logisticsInfo.includes('签收')) {
        order.status = '已签收';
      }
    }

    // 处理批次变更
    if (batchId !== undefined) {
      const oldBatchId = order.batch;

      if (batchId) {
        const newBatch = await Batch.findById(batchId);
        if (newBatch) {
          order.batch = newBatch._id;
          order.batchName = newBatch.name;
        }
      } else {
        order.batch = null;
        order.batchName = '';
      }

      // 更新旧批次和新批次的订单数量
      if (oldBatchId) {
        const oldBatch = await Batch.findById(oldBatchId);
        if (oldBatch) {
          oldBatch.orderCount = await Order.countDocuments({ batch: oldBatchId });
          await oldBatch.save();
        }
      }
      if (batchId) {
        const newBatch = await Batch.findById(batchId);
        if (newBatch) {
          newBatch.orderCount = await Order.countDocuments({ batch: batchId });
          await newBatch.save();
        }
      }
    }

    order.updatedAt = new Date();
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('管理员更新订单错误:', error);
    res.status(500).json({ error: '更新订单失败' });
  }
});

// 管理员删除订单
router.delete('/admin/:id', authenticate, requireAdmin, logAction('delete', 'order'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    const batchId = order.batch;
    await Order.findByIdAndDelete(req.params.id);

    // 更新批次订单数量
    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (batch) {
        batch.orderCount = await Order.countDocuments({ batch: batchId });
        await batch.save();
      }
    }

    res.json({ message: '订单已删除' });
  } catch (error) {
    console.error('管理员删除订单错误:', error);
    res.status(500).json({ error: '删除订单失败' });
  }
});

// 管理员批量删除订单
router.post('/admin/batch-delete', authenticate, requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请选择要删除的订单' });
    }

    // 获取要删除的订单，记录批次信息
    const orders = await Order.find({ _id: { $in: ids } });
    const batchIds = [...new Set(orders.filter(o => o.batch).map(o => o.batch.toString()))];

    // 执行删除
    const result = await Order.deleteMany({ _id: { $in: ids } });

    // 更新相关批次的订单数量
    for (const batchId of batchIds) {
      const batch = await Batch.findById(batchId);
      if (batch) {
        batch.orderCount = await Order.countDocuments({ batch: batchId });
        await batch.save();
      }
    }

    res.json({ message: `成功删除 ${result.deletedCount} 个订单` });
  } catch (error) {
    console.error('管理员批量删除订单错误:', error);
    res.status(500).json({ error: '批量删除失败' });
  }
});

// 管理员批量导入订单
router.post('/admin/import', authenticate, requireAdmin, async (req, res) => {
  try {
    const { batchId, batchName, customerName, orderNumbers } = req.body;

    if (!batchId || !customerName || !orderNumbers || !Array.isArray(orderNumbers)) {
      return res.status(400).json({ error: '请提供批次ID、客户姓名和单号列表' });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ error: '批次不存在' });
    }

    // 去重
    const uniqueOrderNumbers = [...new Set(orderNumbers.map(num => num.trim()).filter(num => num))];

    if (uniqueOrderNumbers.length === 0) {
      return res.status(400).json({ error: '单号列表不能为空' });
    }

    const orders = [];
    let matchedCount = 0;

    for (const orderNumber of uniqueOrderNumbers) {
      // 检查是否已有管理员创建的订单
      let existingAdminOrder = await Order.findOne({
        orderNumber,
        createdBy: 'admin'
      });

      // 检查是否有用户创建的订单（用于匹配判断）
      const userOrders = await Order.find({
        orderNumber,
        createdBy: 'user',
        status: { $ne: '已发出' }
      });

      if (existingAdminOrder) {
        // 更新现有管理员订单
        existingAdminOrder.customerName = customerName;
        existingAdminOrder.batch = batch._id;
        existingAdminOrder.batchName = batch.name;
        existingAdminOrder.updatedAt = new Date();
        await existingAdminOrder.save();
        orders.push(existingAdminOrder);
      } else {
        // 创建新管理员订单
        const newOrder = new Order({
          orderNumber,
          customerName,
          batch: batch._id,
          batchName: batch.name,
          createdBy: 'admin',
          status: '在路上'
        });
        await newOrder.save();
        orders.push(newOrder);
      }

      // 如果找到用户创建的订单，将其状态更新为"已发出"
      if (userOrders.length > 0) {
        await Order.updateMany(
          { _id: { $in: userOrders.map(o => o._id) } },
          { $set: { status: '已发出', updatedAt: new Date() } }
        );
        matchedCount += userOrders.length;
      }
    }

    // 更新批次订单数量
    batch.orderCount = await Order.countDocuments({ batch: batch._id });
    await batch.save();

    res.json({
      orders,
      matchedCount,
      message: `成功导入 ${orders.length} 个订单，匹配并更新 ${matchedCount} 个用户订单状态为"已发出"`
    });
  } catch (error) {
    console.error('管理员导入订单错误:', error);
    res.status(500).json({ error: '导入订单失败' });
  }
});

// =============== 普通用户接口 ===============

// 获取单个订单
router.get('/:id', authenticate, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    if (req.user && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      query.userId = req.user._id;
    }

    const order = await Order.findOne(query)
      .populate('userId', 'nickname username')
      .populate('batch', 'name')
      .lean();

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 未登录用户隐藏客户姓名（显示为密文）
    if (!req.user && order.customerName && order.customerName.length > 0) {
      order.customerName = order.customerName.charAt(0) + '*'.repeat(order.customerName.length - 1);
    }

    res.json(order);
  } catch (error) {
    console.error('获取订单错误:', error);
    res.status(500).json({ error: '获取订单失败' });
  }
});

// 创建订单（用户）
router.post('/', authenticate, async (req, res) => {
  try {
    const { customerName, orderNumbers } = req.body;

    if (!customerName || !orderNumbers || !Array.isArray(orderNumbers)) {
      return res.status(400).json({ error: '请提供客户姓名和单号列表' });
    }

    // 去重
    const uniqueOrderNumbers = [...new Set(orderNumbers.map(num => num.trim()).filter(num => num))];

    if (uniqueOrderNumbers.length === 0) {
      return res.status(400).json({ error: '单号列表不能为空' });
    }

    const orders = [];
    const now = new Date();
    const batchPeriod = now.getDate() <= 15 ? '上旬' : '下旬';
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const batchName = `${year}年${month}月${batchPeriod}`;

    // 查找或创建批次
    let batch = await Batch.findOne({ name: batchName });
    if (!batch) {
      batch = new Batch({
        name: batchName,
        period: batchPeriod,
        month,
        year
      });
      await batch.save();
    }

    for (const orderNumber of uniqueOrderNumbers) {
      // 检查是否已存在（同单号合并）
      let existingOrder = await Order.findOne({
        orderNumber,
        userId: req.user._id
      });

      if (existingOrder) {
        // 更新现有订单
        existingOrder.customerName = customerName;
        existingOrder.batch = batch._id;
        existingOrder.batchName = batchName;
        existingOrder.updatedAt = now;
        await existingOrder.save();
        orders.push(existingOrder);
      } else {
        // 创建新订单
        const newOrder = new Order({
          orderNumber,
          customerName,
          batch: batch._id,
          batchName,
          userId: req.user._id,
          createdBy: 'user',
          status: '在路上'
        });
        await newOrder.save();
        orders.push(newOrder);
      }
    }

    // 更新批次订单数量
    batch.orderCount = await Order.countDocuments({ batch: batch._id });
    await batch.save();

    res.json({ orders, message: `成功创建/更新 ${orders.length} 个订单` });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({ error: '创建订单失败' });
  }
});

// 更新订单
router.put('/:id', authenticate, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const order = await Order.findOne(query);
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    const { customerName, orderNumber, status, logisticsInfo } = req.body;

    if (customerName) order.customerName = customerName;
    if (orderNumber) order.orderNumber = orderNumber;
    if (status) order.status = status;
    if (logisticsInfo !== undefined) {
      order.logisticsInfo = logisticsInfo;
      order.logisticsUpdateTime = new Date();
      // 如果物流信息包含"已签收"，自动更新状态
      if (logisticsInfo.includes('已签收') || logisticsInfo.includes('签收')) {
        order.status = '已签收';
      }
    }

    order.updatedAt = new Date();
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('更新订单错误:', error);
    res.status(500).json({ error: '更新订单失败' });
  }
});

// 删除订单
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const query = { _id: req.params.id };

    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    }

    const order = await Order.findOneAndDelete(query);

    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }

    // 更新批次订单数量
    if (order.batch) {
      const batch = await Batch.findById(order.batch);
      if (batch) {
        batch.orderCount = await Order.countDocuments({ batch: batch._id });
        await batch.save();
      }
    }

    res.json({ message: '订单已删除' });
  } catch (error) {
    console.error('删除订单错误:', error);
    res.status(500).json({ error: '删除订单失败' });
  }
});

module.exports = router;
