const AuditLog = require('../models/AuditLog');

/**
 * 创建操作日志中间件
 * @param {string} action - 操作类型: 'create', 'update', 'delete'
 * @param {string} resource - 资源类型: 'order', 'batch', 'user'
 */
const logAction = (action, resource) => {
    return (req, res, next) => {
        // 保存原始的 res.json 方法
        const originalJson = res.json.bind(res);

        // 重写 res.json 方法
        res.json = function (data) {
            // 仅记录成功操作（2xx 状态码）
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                // 异步记录日志，不阻塞响应
                setImmediate(async () => {
                    try {
                        const logData = {
                            userId: req.user._id,
                            username: req.user.username || req.user.nickname,
                            action,
                            resource,
                            resourceId: req.params.id || data._id || data.id,
                            details: {
                                body: req.body,
                                params: req.params,
                                query: req.query
                            },
                            ipAddress: req.ip || req.connection.remoteAddress
                        };

                        await AuditLog.create(logData);
                    } catch (err) {
                        console.error('日志记录失败:', err);
                    }
                });
            }

            // 调用原始的 res.json
            originalJson(data);
        };

        next();
    };
};

module.exports = { logAction };
