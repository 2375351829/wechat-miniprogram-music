const db = require('../config/db-sqlite');
const response = require('../utils/response');
const log = require('../utils/logger');

const submitRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { songId, songName, singer, receiver, blessing, playDate } = req.body;
        
        if (!songName || !singer) {
            return res.status(400).json(response.error(1001, '歌曲名称和歌手不能为空'));
        }
        
        const todayCount = await db.getAsync(
            `SELECT COUNT(*) as count FROM request_table 
            WHERE user_id = ? AND date(create_time) = date('now')`,
            [userId]
        );
        
        if (todayCount && todayCount.count >= 3) {
            return res.status(400).json(response.error(4003, '今日点歌次数已达上限'));
        }
        
        const result = await db.runAsync(
            `INSERT INTO request_table (user_id, song_id, song_name, singer, message, receiver, play_time, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
            [userId, songId || null, songName, singer, blessing || null, receiver || null, playDate || null]
        );
        
        const request = await db.getAsync('SELECT * FROM request_table WHERE id = ?', [result.id]);
        
        log.info(`点歌请求提交成功: ${songName} - ${singer} (用户${userId})`);
        
        res.json(response.success(request, '点歌请求提交成功，请等待审核'));
    } catch (err) {
        log.error('提交点歌请求失败:', err);
        res.status(500).json(response.error(500, '提交失败'));
    }
};

const getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, pageSize = 20, status } = req.query;
        const offset = (page - 1) * pageSize;
        
        let sql = 'SELECT * FROM request_table WHERE user_id = ?';
        const params = [userId];
        
        if (status !== undefined) {
            sql += ' AND status = ?';
            params.push(parseInt(status));
        }
        
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
        const totalResult = await db.getAsync(countSql, params);
        
        sql += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), parseInt(offset));
        
        const list = await db.allAsync(sql, params);
        
        res.json(response.success(response.paginate(list, totalResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取我的点歌请求失败:', err);
        res.status(500).json(response.error(500, '获取失败'));
    }
};

const getRequestHistory = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, status } = req.query;
        const offset = (page - 1) * pageSize;
        
        let sql = `SELECT r.*, u.nickname, u.avatar_url, u.class_name 
            FROM request_table r 
            LEFT JOIN user_table u ON r.user_id = u.id 
            WHERE 1=1`;
        const params = [];
        
        if (status !== undefined) {
            sql += ' AND r.status = ?';
            params.push(parseInt(status));
        }
        
        const countSql = sql.replace('SELECT r.*, u.nickname, u.avatar_url, u.class_name', 'SELECT COUNT(*) as total');
        const totalResult = await db.getAsync(countSql, params);
        
        sql += ' ORDER BY r.create_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), parseInt(offset));
        
        const list = await db.allAsync(sql, params);
        
        res.json(response.success(response.paginate(list, totalResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取点歌历史失败:', err);
        res.status(500).json(response.error(500, '获取失败'));
    }
};

const getRequestList = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, status } = req.query;
        const offset = (page - 1) * pageSize;
        
        let sql = `SELECT r.*, u.nickname, u.avatar_url, u.class_name, u.student_id 
            FROM request_table r 
            LEFT JOIN user_table u ON r.user_id = u.id 
            WHERE 1=1`;
        const params = [];
        
        if (status !== undefined) {
            sql += ' AND r.status = ?';
            params.push(parseInt(status));
        }
        
        const countSql = sql.replace('SELECT r.*, u.nickname, u.avatar_url, u.class_name, u.student_id', 'SELECT COUNT(*) as total');
        const totalResult = await db.getAsync(countSql, params);
        
        sql += ' ORDER BY r.create_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), parseInt(offset));
        
        const list = await db.allAsync(sql, params);
        
        res.json(response.success(response.paginate(list, totalResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取点歌列表失败:', err);
        res.status(500).json(response.error(500, '获取失败'));
    }
};

const getTodayRequests = async (req, res) => {
    try {
        const list = await db.allAsync(
            `SELECT r.id, r.song_name, r.singer, r.message, r.receiver, u.nickname, u.avatar_url 
            FROM request_table r 
            LEFT JOIN user_table u ON r.user_id = u.id 
            WHERE r.status = 1 AND date(r.create_time) = date('now') 
            ORDER BY r.create_time ASC`
        );
        
        res.json(response.success(list));
    } catch (err) {
        log.error('获取今日点歌失败:', err);
        res.status(500).json(response.error(500, '获取失败'));
    }
};

const getPendingRequests = async (req, res) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const offset = (page - 1) * pageSize;
        
        const countResult = await db.getAsync(
            'SELECT COUNT(*) as total FROM request_table WHERE status = 0'
        );
        
        const list = await db.allAsync(
            `SELECT r.*, u.nickname, u.class_name 
            FROM request_table r 
            LEFT JOIN user_table u ON r.user_id = u.id 
            WHERE r.status = 0 
            ORDER BY r.create_time ASC 
            LIMIT ? OFFSET ?`,
            [parseInt(pageSize), parseInt(offset)]
        );
        
        res.json(response.success(response.paginate(list, countResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取待审核点歌失败:', err);
        res.status(500).json(response.error(500, '获取失败'));
    }
};

const auditRequest = async (req, res) => {
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
        
        const request = await db.getAsync('SELECT * FROM request_table WHERE id = ?', [id]);
        if (!request) {
            return res.status(404).json(response.error(4001, '点歌请求不存在'));
        }
        
        await db.runAsync(
            `UPDATE request_table SET status = ?, reviewer_id = ?, review_time = CURRENT_TIMESTAMP, review_remark = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?`,
            [parseInt(status), adminId, reason || null, id]
        );
        
        log.info(`审核点歌请求: ID=${id}, 状态=${status}, 审核人=${adminId}`);
        
        res.json(response.success({ id, status: parseInt(status) }, status === 1 ? '审核通过' : '已驳回'));
    } catch (err) {
        log.error('审核点歌请求失败:', err);
        res.status(500).json(response.error(500, '审核失败'));
    }
};

const batchAuditRequests = async (req, res) => {
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
            `UPDATE request_table SET status = ?, reviewer_id = ?, review_time = CURRENT_TIMESTAMP, review_remark = ?, update_time = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            [parseInt(status), adminId, reason || null, ...ids]
        );
        
        log.info(`批量审核点歌请求: ${ids.length}条, 状态=${status}`);
        
        res.json(response.success({ auditedCount: ids.length }, `成功审核 ${ids.length} 条记录`));
    } catch (err) {
        log.error('批量审核失败:', err);
        res.status(500).json(response.error(500, '批量审核失败'));
    }
};

const cancelRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const request = await db.getAsync('SELECT * FROM request_table WHERE id = ?', [id]);
        
        if (!request) {
            return res.status(404).json(response.error(4001, '点歌请求不存在'));
        }
        
        if (request.user_id !== userId) {
            return res.status(403).json(response.error(4005, '非本人请求，无权操作'));
        }
        
        if (request.status !== 0) {
            return res.status(400).json(response.error(4004, '请求已审核，无法取消'));
        }
        
        await db.runAsync(
            'UPDATE request_table SET status = 4, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        
        res.json(response.success(null, '已取消'));
    } catch (err) {
        log.error('取消点歌请求失败:', err);
        res.status(500).json(response.error(500, '取消失败'));
    }
};

const markAsPlayed = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.runAsync(
            'UPDATE request_table SET status = 3, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        
        res.json(response.success(null, '已标记为已播放'));
    } catch (err) {
        log.error('标记播放失败:', err);
        res.status(500).json(response.error(500, '标记失败'));
    }
};

const deleteRequest = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.runAsync('DELETE FROM request_table WHERE id = ?', [id]);
        
        res.json(response.success(null, '删除成功'));
    } catch (err) {
        log.error('删除点歌请求失败:', err);
        res.status(500).json(response.error(500, '删除失败'));
    }
};

module.exports = {
    submitRequest,
    getMyRequests,
    getRequestHistory,
    getRequestList,
    getTodayRequests,
    getPendingRequests,
    auditRequest,
    batchAuditRequests,
    cancelRequest,
    markAsPlayed,
    deleteRequest
};
