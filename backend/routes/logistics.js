const express = require('express');
const router = express.Router();
const { authenticate, optionalAuthenticate, requireAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const { queryLogistics, batchQueryLogistics, detectCourier } = require('../services/logisticsService');

/**
 * 查询单个订单物流信息
 * GET /api/logistics/:orderNumber
 */
router.get('/:orderNumber', optionalAuthenticate, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    // 查找订单
    const order = await Order.findOne({ orderNumber });
    
    // 检查是否需要重新查询（缓存5分钟）
    const needRefresh = !order?.lastQueryTime || 
      (Date.now() - order.lastQueryTime.getTime() > 5 * 60 * 1000);
    
    if (order && !needRefresh && order.logisticsHistory?.length > 0) {
      // 返回缓存的物流信息
      return res.json({
        success: true,
        cached: true,
        orderNumber,
        courierCode: order.courierCode,
        courierName: order.courierName,
        status: order.status,
        latestInfo: order.logisticsInfo,
        updateTime: order.logisticsUpdateTime,
        history: order.logisticsHistory
      });
    }
    
    // 查询最新物流信息
    const result = await queryLogistics(orderNumber);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error || '查询失败' });
    }
    
    // 更新订单物流信息
    if (order) {
      order.courierCode = result.courierCode;
      order.courierName = result.courierName;
      order.logisticsHistory = result.data || [];
      order.logisticsInfo = result.data?.[0]?.description || '';
      order.logisticsUpdateTime = new Date();
      order.lastQueryTime = new Date();
      order.logisticsQueryStatus = result.data?.length > 0 ? 'success' : 'no_record';
      
      // 根据物流状态更新订单状态
      if (result.data?.[0]?.status === '已签收' || result.state === '3') {
        order.status = '已签收';
      }
      
      await order.save();
    }
    
    res.json({
      success: true,
      cached: false,
      orderNumber,
      courierCode: result.courierCode,
      courierName: result.courierName,
      status: order?.status || '在路上',
      latestInfo: result.data?.[0]?.description || '暂无物流信息',
      updateTime: new Date(),
      history: result.data || [],
      isMock: result.isMock
    });
  } catch (error) {
    console.error('查询物流信息错误:', error);
    res.status(500).json({ error: '查询物流信息失败' });
  }
});

/**
 * 批量查询物流信息
 * POST /api/logistics/batch
 */
router.post('/batch', authenticate, requireAdmin, async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: '请提供订单ID列表' });
    }
    
    // 限制单次查询数量
    if (orderIds.length > 50) {
      return res.status(400).json({ error: '单次最多查询50个订单' });
    }
    
    // 获取订单
    const orders = await Order.find({ _id: { $in: orderIds } });
    
    if (orders.length === 0) {
      return res.status(404).json({ error: '未找到订单' });
    }
    
    // 批量查询
    const results = await batchQueryLogistics(orders);
    
    // 批量更新订单
    const bulkOps = results.map(result => ({
      updateOne: {
        filter: { _id: result.orderId },
        update: {
          $set: {
            courierCode: result.courierCode,
            courierName: result.courierName,
            logisticsHistory: result.data || [],
            logisticsInfo: result.data?.[0]?.description || '',
            logisticsUpdateTime: new Date(),
            lastQueryTime: new Date(),
            logisticsQueryStatus: result.data?.length > 0 ? 'success' : 'no_record',
            ...(result.state === '3' ? { status: '已签收' } : {})
          }
        }
      }
    }));
    
    await Order.bulkWrite(bulkOps);
    
    res.json({
      success: true,
      total: results.length,
      successCount: results.filter(r => r.success).length,
      results: results.map(r => ({
        orderId: r.orderId,
        success: r.success,
        latestInfo: r.data?.[0]?.description || '暂无信息'
      }))
    });
  } catch (error) {
    console.error('批量查询物流错误:', error);
    res.status(500).json({ error: '批量查询失败' });
  }
});

/**
 * 手动刷新订单物流信息
 * POST /api/logistics/refresh/:id
 */
router.post('/refresh/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    // 非管理员只能刷新自己的订单
    if (req.user.role !== 'admin' && order.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: '无权操作此订单' });
    }
    
    // 查询物流
    const result = await queryLogistics(order.orderNumber);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error || '查询失败' });
    }
    
    // 更新订单
    order.courierCode = result.courierCode;
    order.courierName = result.courierName;
    order.logisticsHistory = result.data || [];
    order.logisticsInfo = result.data?.[0]?.description || '';
    order.logisticsUpdateTime = new Date();
    order.lastQueryTime = new Date();
    order.logisticsQueryStatus = result.data?.length > 0 ? 'success' : 'no_record';
    
    if (result.state === '3' || result.data?.[0]?.status === '已签收') {
      order.status = '已签收';
    }
    
    await order.save();
    
    res.json({
      success: true,
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        logisticsInfo: order.logisticsInfo,
        logisticsHistory: order.logisticsHistory,
        courierName: order.courierName
      }
    });
  } catch (error) {
    console.error('刷新物流信息错误:', error);
    res.status(500).json({ error: '刷新失败' });
  }
});

/**
 * 识别快递公司
 * GET /api/logistics/detect/:orderNumber
 */
router.get('/detect/:orderNumber', (req, res) => {
  const courier = detectCourier(req.params.orderNumber);
  res.json(courier);
});

module.exports = router;
