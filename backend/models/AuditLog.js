const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true
    },
    action: {
        type: String,
        enum: ['create', 'update', 'delete'],
        required: true,
        index: true
    },
    resource: {
        type: String,
        enum: ['order', 'batch', 'user'],
        required: true,
        index: true
    },
    resourceId: {
        type: String
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// 复合索引优化查询
auditLogSchema.index({ timestamp: -1, resource: 1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
