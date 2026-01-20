const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  period: {
    type: String,
    enum: ['上旬', '下旬'],
    required: true
  },
  month: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  dispatchTime: {
    type: Date
  },
  orderCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// 复合索引：优化查询性能
batchSchema.index({ name: 1 });
batchSchema.index({ year: -1, month: -1, period: -1 }); // 批次排序查询

module.exports = mongoose.model('Batch', batchSchema);
