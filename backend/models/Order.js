const mongoose = require('mongoose');

// 物流记录子模式
const logisticsRecordSchema = new mongoose.Schema({
  time: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: ''
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    index: true
  },
  batchName: {
    type: String,
    index: true
  },
  status: {
    type: String,
    enum: ['在路上', '已签收', '已发出'],
    default: '在路上'
  },
  // 最新物流信息（快速显示用）
  logisticsInfo: {
    type: String,
    default: ''
  },
  logisticsUpdateTime: {
    type: Date,
    default: Date.now
  },
  // 物流历史记录（完整轨迹）
  logisticsHistory: {
    type: [logisticsRecordSchema],
    default: []
  },
  // 快递公司编码（用于物流查询）
  courierCode: {
    type: String,
    default: ''
  },
  // 快递公司名称
  courierName: {
    type: String,
    default: ''
  },
  // 物流查询状态
  logisticsQueryStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'no_record'],
    default: 'pending'
  },
  // 上次物流查询时间
  lastQueryTime: {
    type: Date,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  createdBy: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 复合索引：优化查询性能
orderSchema.index({ orderNumber: 1, batchName: 1 });
orderSchema.index({ userId: 1, updatedAt: -1 });
orderSchema.index({ status: 1, updatedAt: -1 });
orderSchema.index({ batch: 1, createdAt: -1 });
orderSchema.index({ customerName: 1 });
orderSchema.index({ logisticsQueryStatus: 1, lastQueryTime: 1 });

module.exports = mongoose.model('Order', orderSchema);
