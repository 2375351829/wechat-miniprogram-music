const db = require('../config/db-sqlite');
const response = require('../utils/response');
const log = require('../utils/logger');

const BLESSING_TYPES = [
    { index: 0, name: '生日祝福' },
    { index: 1, name: '节日祝福' },
    { index: 2, name: '毕业祝福' },
    { index: 3, name: '表白祝福' },
    { index: 4, name: '友情祝福' },
    { index: 5, name: '其他' }
];

const submitBlessing = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, typeName, receiver, content, playDate, isAnonymous } = req.body;
        
        if (!content || !receiver) {
            return res.status(400).json(response.error(1001, '祝福内容和接收者不能为空'));
        }
        
        const result = await db.runAsync(
            `INSERT INTO blessing_table (user_id, content, receiver, type, type_name, is_anonymous, status) 
            VALUES (?, ?, ?, ?, ?, ?, 0)`,
            [userId, content, receiver, type || 5, typeName || '其他', isAnonymous ? 1 : 0]
        );
        
        const blessing = await db.getAsync('SELECT * FROM blessing_table WHERE id = ?', [result.id]);
        
        log.info(`祝福提交成功: 用户${userId}`);
        
        res.json(response.success(blessing, '祝福提交成功，请等待审核'));
    } catch (err) {
        log.error('提交祝福失败:', err);
        res.status(500).json(response.error(500, '提交失败'));
    }
};

const getMyBlessings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, pageSize = 20 } = req.query;
        const offset = (page - 1) * pageSize;
        
        const countResult = await db.getAsync(
            'SELECT COUNT(*) as total FROM blessing_table WHERE user_id = ?',
            [userId]
        );
        
        const list = await db.allAsync(
            `SELECT * FROM blessing_table WHERE user_id = ? ORDER BY create_time DESC LIMIT ? OFFSET ?`,
            [userId, parseInt(pageSize), parseInt(offset)]
        );
        
        res.json(response.success(response.paginate(list, countResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取我的祝福失败:', err);
        res.status(500).json(response.error(500, '获取失败'));
    }
};

const getBlessingList = async (req, res) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const offset = (page - 1) * pageSize;
        
        const countResult = await db.getAsync(
            'SELECT COUNT(*) as total FROM blessing_table WHERE status = 1'
        );
        
        const list = await db.allAsync(
            `SELECT b.id, b.content, b.receiver, b.type_name, b.is_anonymous, b.create_time, 
                CASE WHEN b.is_anonymous = 1 THEN '匿名用户' ELSE u.nickname END as nickname
            FROM blessing_table b 
            LEFT JOIN user_table u ON b.user_id = u.id 
            WHERE b.status = 1 
            ORDER BY b.create_time DESC 
            LIMIT ? OFFSET ?`,
            [parseInt(pageSize), parseInt(offset)]
        );
        
        res.json(response.success(response.paginate(list, countResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取祝福列表失败:', err);
        res.status(500).json(response.error(500, '获取失败'));
    }
};

const getPendingBlessings = async (req, res) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const offset = (page - 1) * pageSize;
        
        const countResult = await db.getAsync(
            'SELECT COUNT(*) as total FROM blessing_table WHERE status = 0'
        );
        
        const list = await db.allAsync(
            `SELECT b.*, u.nickname, u.class_name 
            FROM blessing_table b 
            LEFT JOIN user_table u ON b.user_id = u.id 
            WHERE b.status = 0 
            ORDER BY b.create_time ASC 
            LIMIT ? OFFSET ?`,
            [parseInt(pageSize), parseInt(offset)]
        );
        
        res.json(response.success(response.paginate(list, countResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取待审核祝福失败:', err);
        res.status(500).json(response.error(500, '获取失败'));
    }
};

const auditBlessing = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const adminId = req.admin.id;
        
        if (![1, 2].includes(parseInt(status))) {
            return res.status(400).json(response.error(1001, '审核状态无效'));
        }
        
        if (parseInt(status) === 2 && !reason) {
            return res.status(400).json(response.error(1001, '驳回原因不能为空'));
        }
        
        const blessing = await db.getAsync('SELECT * FROM blessing_table WHERE id = ?', [id]);
        if (!blessing) {
            return res.status(404).json(response.error(5001, '祝福不存在'));
        }
        
        await db.runAsync(
            `UPDATE blessing_table SET status = ?, reviewer_id = ?, review_time = CURRENT_TIMESTAMP, review_remark = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?`,
            [parseInt(status), adminId, reason || null, id]
        );
        
        log.info(`审核祝福: ID=${id}, 状态=${status}, 审核人=${adminId}`);
        
        res.json(response.success({ id, status: parseInt(status) }, '审核完成'));
    } catch (err) {
        log.error('审核祝福失败:', err);
        res.status(500).json(response.error(500, '审核失败'));
    }
};

const batchAuditBlessings = async (req, res) => {
    try {
        const { ids, status, reason } = req.body;
        const adminId = req.admin.id;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json(response.error(1001, '请选择要审核的记录'));
        }
        
        if (![1, 2].includes(parseInt(status))) {
            return res.status(400).json(response.error(1001, '审核状态无效'));
        }
        
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(
            `UPDATE blessing_table SET status = ?, reviewer_id = ?, review_time = CURRENT_TIMESTAMP, review_remark = ?, update_time = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            [parseInt(status), adminId, reason || null, ...ids]
        );
        
        log.info(`批量审核祝福: ${ids.length}条, 状态=${status}`);
        
        res.json(response.success({ auditedCount: ids.length }, `成功审核 ${ids.length} 条记录`));
    } catch (err) {
        log.error('批量审核祝福失败:', err);
        res.status(500).json(response.error(500, '批量审核失败'));
    }
};

const cancelBlessing = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const blessing = await db.getAsync('SELECT * FROM blessing_table WHERE id = ?', [id]);
        
        if (!blessing) {
            return res.status(404).json(response.error(5001, '祝福不存在'));
        }
        
        if (blessing.user_id !== userId) {
            return res.status(403).json(response.error(5004, '非本人祝福，无权操作'));
        }
        
        if (blessing.status !== 0) {
            return res.status(400).json(response.error(5003, '祝福已审核，无法取消'));
        }
        
        await db.runAsync(
            'UPDATE blessing_table SET status = 4, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        
        res.json(response.success(null, '已取消'));
    } catch (err) {
        log.error('取消祝福失败:', err);
        res.status(500).json(response.error(500, '取消失败'));
    }
};

const deleteBlessing = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.runAsync('DELETE FROM blessing_table WHERE id = ?', [id]);
        
        res.json(response.success(null, '删除成功'));
    } catch (err) {
        log.error('删除祝福失败:', err);
        res.status(500).json(response.error(500, '删除失败'));
    }
};

module.exports = {
    submitBlessing,
    getMyBlessings,
    getBlessingList,
    getPendingBlessings,
    auditBlessing,
    batchAuditBlessings,
    cancelBlessing,
    deleteBlessing
};
