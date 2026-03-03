const db = require('../config/db-sqlite');
const log = require('./logger');

const operationLog = {
    log: async (adminId, username, action, target, detail, ip = null) => {
        try {
            await db.runAsync(
                `INSERT INTO admin_operation_log_table (admin_id, username, action, target, detail, ip, create_time)
                 VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
                [adminId || 0, username || '系统', action, target, detail, ip]
            );
            log.info(`操作日志: [${username || '系统'}] ${action} - ${target} - ${detail}`);
        } catch (err) {
            log.error('记录操作日志失败:', err);
        }
    },
    
    logUserOperation: async (admin, action, userId, detail, req) => {
        const ip = req?.ip || req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || null;
        await operationLog.log(
            admin?.id || 0,
            admin?.username || '系统',
            action,
            `用户ID: ${userId}`,
            detail,
            ip
        );
    },
    
    logBatchOperation: async (admin, action, count, detail, req) => {
        const ip = req?.ip || req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || null;
        await operationLog.log(
            admin?.id || 0,
            admin?.username || '系统',
            action,
            `批量操作: ${count}条`,
            detail,
            ip
        );
    },
    
    getLogs: async (page = 1, pageSize = 20, filters = {}) => {
        const offset = (page - 1) * pageSize;
        let sql = 'SELECT * FROM admin_operation_log_table WHERE 1=1';
        const params = [];
        
        if (filters.admin_id) {
            sql += ' AND admin_id = ?';
            params.push(filters.admin_id);
        }
        if (filters.action) {
            sql += ' AND action LIKE ?';
            params.push(`%${filters.action}%`);
        }
        if (filters.start_date) {
            sql += ' AND create_time >= ?';
            params.push(filters.start_date);
        }
        if (filters.end_date) {
            sql += ' AND create_time <= ?';
            params.push(filters.end_date);
        }
        
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
        const totalResult = await db.getAsync(countSql, params);
        
        sql += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), parseInt(offset));
        
        const list = await db.allAsync(sql, params);
        
        return {
            list,
            total: totalResult?.total || 0
        };
    }
};

const ACTION_TYPES = {
    USER_CREATE: '创建用户',
    USER_UPDATE: '修改用户',
    USER_DELETE: '删除用户',
    USER_STATUS_ENABLE: '启用用户',
    USER_STATUS_DISABLE: '禁用用户',
    USER_PASSWORD_RESET: '重置密码',
    USER_BATCH_ENABLE: '批量启用',
    USER_BATCH_DISABLE: '批量禁用',
    USER_BATCH_DELETE: '批量删除',
    USER_BATCH_UPDATE: '批量修改',
    USER_BATCH_PASSWORD_RESET: '批量重置密码',
    USER_IMPORT: '导入用户',
    USER_EXPORT: '导出用户',
    ADMIN_LOGIN: '管理员登录',
    ADMIN_LOGOUT: '管理员登出',
    ADMIN_CREATE: '创建管理员',
    ADMIN_UPDATE: '修改管理员',
    ADMIN_DELETE: '删除管理员',
    SONG_ADD: '添加歌曲',
    SONG_UPDATE: '修改歌曲',
    SONG_DELETE: '删除歌曲',
    REQUEST_APPROVE: '审核通过',
    REQUEST_REJECT: '审核拒绝',
    BLESSING_APPROVE: '祝福审核通过',
    BLESSING_REJECT: '祝福审核拒绝'
};

module.exports = {
    operationLog,
    ACTION_TYPES
};
