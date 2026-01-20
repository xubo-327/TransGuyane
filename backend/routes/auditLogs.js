const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

// 获取操作日志列表（仅超级管理员）
router.get('/', authenticate, requireSuperAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 20,
            startDate,
            endDate,
            username,
            resource,
            action
        } = req.query;

        const query = {};

        // 日期范围筛选
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        // 用户名筛选
        if (username) {
            query.username = new RegExp(username, 'i');
        }

        // 资源类型筛选
        if (resource) {
            query.resource = resource;
        }

        // 操作类型筛选
        if (action) {
            query.action = action;
        }

        const skip = (parseInt(page) - 1) * parseInt(pageSize);

        const logs = await AuditLog.find(query)
            .populate('userId', 'username nickname')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(pageSize))
            .lean();

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
            total,
            page: parseInt(page),
            pageSize: parseInt(pageSize)
        });
    } catch (error) {
        console.error('获取操作日志错误:', error);
        res.status(500).json({ error: '获取操作日志失败' });
    }
});

// 获取操作统计（仅超级管理员）
router.get('/stats', authenticate, requireSuperAdmin, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const stats = await AuditLog.aggregate([
            { $match: query },
            {
                $group: {
                    _id: { resource: '$resource', action: '$action' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({ stats });
    } catch (error) {
        console.error('获取操作统计错误:', error);
        res.status(500).json({ error: '获取操作统计失败' });
    }
});

module.exports = router;
