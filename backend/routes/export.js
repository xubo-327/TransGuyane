const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const Batch = require('../models/Batch');
const XLSX = require('xlsx');

// 导出单个批次订单（Excel）
router.get('/batch/:batchId', authenticate, requireAdmin, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    if (!batch) {
      return res.status(404).json({ error: '批次不存在' });
    }

    const orders = await Order.find({ batch: batch._id })
      .populate('userId', 'nickname username')
      .sort({ createdAt: -1 });

    // 准备Excel数据
    const data = orders.map((order, index) => ({
      '序号': index + 1,
      '单号': order.orderNumber,
      '客户姓名': order.customerName,
      '批次': batch.name,
      '状态': order.status,
      '物流信息': order.logisticsInfo || '',
      '创建时间': order.createdAt.toLocaleString('zh-CN'),
      '更新时间': order.updatedAt.toLocaleString('zh-CN'),
      '创建者': order.createdBy === 'user' ? '用户' : '管理员',
      '用户': order.userId?.nickname || order.userId?.username || ''
    }));

    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(data);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 6 },   // 序号
      { wch: 20 },  // 单号
      { wch: 12 },  // 客户姓名
      { wch: 16 },  // 批次
      { wch: 10 },  // 状态
      { wch: 40 },  // 物流信息
      { wch: 20 },  // 创建时间
      { wch: 20 },  // 更新时间
      { wch: 10 },  // 创建者
      { wch: 12 },  // 用户
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '订单数据');

    // 生成Excel buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(batch.name)}订单数据.xlsx"`);

    res.send(excelBuffer);
  } catch (error) {
    console.error('导出批次订单错误:', error);
    res.status(500).json({ error: '导出失败' });
  }
});

// 导出多个批次订单（Excel）
router.post('/batches', authenticate, requireAdmin, async (req, res) => {
  try {
    const { batchIds } = req.body;
    
    if (!batchIds || !Array.isArray(batchIds) || batchIds.length === 0) {
      return res.status(400).json({ error: '请选择要导出的批次' });
    }

    const batches = await Batch.find({ _id: { $in: batchIds } });
    if (batches.length === 0) {
      return res.status(404).json({ error: '未找到指定批次' });
    }

    const orders = await Order.find({ batch: { $in: batchIds } })
      .populate('userId', 'nickname username')
      .populate('batch', 'name')
      .sort({ batch: 1, createdAt: -1 });

    // 准备Excel数据
    const data = orders.map((order, index) => ({
      '序号': index + 1,
      '单号': order.orderNumber,
      '客户姓名': order.customerName,
      '批次': order.batch?.name || order.batchName || '',
      '状态': order.status,
      '物流信息': order.logisticsInfo || '',
      '创建时间': order.createdAt.toLocaleString('zh-CN'),
      '更新时间': order.updatedAt.toLocaleString('zh-CN'),
      '创建者': order.createdBy === 'user' ? '用户' : '管理员',
      '用户': order.userId?.nickname || order.userId?.username || ''
    }));

    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(data);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 6 },   // 序号
      { wch: 20 },  // 单号
      { wch: 12 },  // 客户姓名
      { wch: 16 },  // 批次
      { wch: 10 },  // 状态
      { wch: 40 },  // 物流信息
      { wch: 20 },  // 创建时间
      { wch: 20 },  // 更新时间
      { wch: 10 },  // 创建者
      { wch: 12 },  // 用户
    ];
    
    const wb = XLSX.utils.book_new();
    const batchNames = batches.map(b => b.name).join('_');
    XLSX.utils.book_append_sheet(wb, ws, '订单数据');

    // 生成Excel buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    const now = new Date();
    const filename = `批次订单_${batchNames.substring(0, 30)}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    res.send(excelBuffer);
  } catch (error) {
    console.error('导出多个批次订单错误:', error);
    res.status(500).json({ error: '导出失败' });
  }
});

// 导出所有订单（Excel）
router.get('/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'nickname username')
      .populate('batch', 'name')
      .sort({ createdAt: -1 });

    // 准备Excel数据
    const data = orders.map((order, index) => ({
      '序号': index + 1,
      '单号': order.orderNumber,
      '客户姓名': order.customerName,
      '批次': order.batch?.name || order.batchName || '',
      '状态': order.status,
      '物流信息': order.logisticsInfo || '',
      '创建时间': order.createdAt.toLocaleString('zh-CN'),
      '更新时间': order.updatedAt.toLocaleString('zh-CN'),
      '创建者': order.createdBy === 'user' ? '用户' : '管理员',
      '用户': order.userId?.nickname || order.userId?.username || ''
    }));

    // 创建工作簿
    const ws = XLSX.utils.json_to_sheet(data);
    
    // 设置列宽
    ws['!cols'] = [
      { wch: 6 },   // 序号
      { wch: 20 },  // 单号
      { wch: 12 },  // 客户姓名
      { wch: 16 },  // 批次
      { wch: 10 },  // 状态
      { wch: 40 },  // 物流信息
      { wch: 20 },  // 创建时间
      { wch: 20 },  // 更新时间
      { wch: 10 },  // 创建者
      { wch: 12 },  // 用户
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '所有订单数据');

    // 生成Excel buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    const now = new Date();
    const filename = `全部订单数据_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    res.send(excelBuffer);
  } catch (error) {
    console.error('导出所有订单错误:', error);
    res.status(500).json({ error: '导出失败' });
  }
});

// 导出所有批次（每个批次一个Sheet）
router.get('/all-batches', authenticate, requireAdmin, async (req, res) => {
  try {
    const batches = await Batch.find().sort({ year: -1, month: -1, period: 1 });
    
    if (batches.length === 0) {
      return res.status(404).json({ error: '没有批次数据' });
    }

    const wb = XLSX.utils.book_new();
    
    for (const batch of batches) {
      const orders = await Order.find({ batch: batch._id })
        .populate('userId', 'nickname username')
        .sort({ createdAt: -1 });

      // 准备Excel数据
      const data = orders.map((order, index) => ({
        '序号': index + 1,
        '单号': order.orderNumber,
        '客户姓名': order.customerName,
        '状态': order.status,
        '物流信息': order.logisticsInfo || '',
        '创建时间': order.createdAt.toLocaleString('zh-CN'),
        '更新时间': order.updatedAt.toLocaleString('zh-CN'),
        '创建者': order.createdBy === 'user' ? '用户' : '管理员',
        '用户': order.userId?.nickname || order.userId?.username || ''
      }));

      // 如果批次没有订单，添加空白行提示
      if (data.length === 0) {
        data.push({ '序号': '', '单号': '暂无订单', '客户姓名': '', '状态': '', '物流信息': '', '创建时间': '', '更新时间': '', '创建者': '', '用户': '' });
      }

      // 创建工作表
      const ws = XLSX.utils.json_to_sheet(data);
      
      // 设置列宽
      ws['!cols'] = [
        { wch: 6 },   // 序号
        { wch: 20 },  // 单号
        { wch: 12 },  // 客户姓名
        { wch: 10 },  // 状态
        { wch: 40 },  // 物流信息
        { wch: 20 },  // 创建时间
        { wch: 20 },  // 更新时间
        { wch: 10 },  // 创建者
        { wch: 12 },  // 用户
      ];
      
      // Sheet名称不能超过31个字符
      const sheetName = batch.name.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    // 生成Excel buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // 设置响应头
    const now = new Date();
    const filename = `全部批次数据_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

    res.send(excelBuffer);
  } catch (error) {
    console.error('导出所有批次错误:', error);
    res.status(500).json({ error: '导出失败' });
  }
});

module.exports = router;
