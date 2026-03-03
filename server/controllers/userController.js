const db = require('../config/db-sqlite');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const response = require('../utils/response');
const log = require('../utils/logger');
const { operationLog, ACTION_TYPES } = require('../utils/operationLog');

const generateToken = (user, isAdmin = false) => {
    return jwt.sign(
        {
            id: user.id,
            openid: user.openid,
            student_id: user.student_id,
            nickname: user.nickname,
            isAdmin,
            role: user.role
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
    );
};

const login = async (req, res) => {
    try {
        const { code, nickName, avatarUrl, gender, city, province, country } = req.body;
        
        if (!code) {
            return res.status(400).json(response.error(1001, '缺少code参数'));
        }
        
        const mockOpenid = `mock_openid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        let user = await db.getAsync('SELECT * FROM user_table WHERE openid = ?', [mockOpenid]);
        
        if (!user) {
            const insertResult = await db.runAsync(
                `INSERT INTO user_table (openid, nickname, avatar_url, gender, status) VALUES (?, ?, ?, ?, 0)`,
                [mockOpenid, nickName || '微信用户', avatarUrl || '', gender || 0]
            );
            
            const userId = insertResult.id;
            if (!userId) {
                return res.status(500).json(response.error(500, '无法获取用户ID'));
            }
            
            user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [userId]);
        }
        
        if (!user) {
            return res.status(500).json(response.error(500, '用户创建失败'));
        }
        
        if (user.status === 1) {
            return res.status(403).json(response.error(2003, '账号已被禁用'));
        }
        
        await db.runAsync(
            'UPDATE user_table SET last_login_time = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );
        
        const token = generateToken(user);
        
        res.json(response.success({
            token,
            userInfo: formatUserInfo(user)
        }, '登录成功'));
    } catch (err) {
        log.error('登录失败:', err);
        res.status(500).json(response.error(500, '登录失败: ' + err.message));
    }
};

const loginByStudent = async (req, res) => {
    try {
        const { student_id, password } = req.body;
        
        if (!student_id || !password) {
            return res.status(400).json(response.error(1001, '学号和密码不能为空'));
        }
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE student_id = ?', [student_id]);
        
        if (!user) {
            return res.status(400).json(response.error(2007, '学号不存在'));
        }
        
        if (user.status === 1) {
            return res.status(403).json(response.error(2003, '账号已被禁用'));
        }
        
        if (!user.password) {
            return res.status(400).json(response.error(2002, '该账号未设置密码，请使用微信登录'));
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json(response.error(2002, '密码错误'));
        }
        
        await db.runAsync(
            'UPDATE user_table SET last_login_time = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );
        
        const token = generateToken(user);
        
        res.json(response.success({
            token,
            userInfo: formatUserInfo(user)
        }, '登录成功'));
    } catch (err) {
        log.error('学号登录失败:', err);
        res.status(500).json(response.error(500, '登录失败'));
    }
};

const formatUserInfo = (user) => {
    return {
        id: user.id,
        openid: user.openid,
        student_id: user.student_id,
        real_name: user.real_name,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        gender: user.gender,
        college: user.college,
        major: user.major,
        grade: user.grade,
        class_name: user.class_name,
        counselor: user.counselor,
        enrollment_year: user.enrollment_year,
        phone: user.phone,
        wechat_name: user.wechat_name,
        wechat_account: user.wechat_account
    };
};

const formatUserList = (user) => {
    return {
        id: user.id,
        openid: user.openid,
        student_id: user.student_id,
        real_name: user.real_name,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        gender: user.gender,
        college: user.college,
        major: user.major,
        grade: user.grade,
        class_name: user.class_name,
        counselor: user.counselor,
        enrollment_year: user.enrollment_year,
        phone: user.phone,
        wechat_name: user.wechat_name,
        wechat_account: user.wechat_account,
        status: user.status,
        create_time: user.create_time,
        request_count: user.request_count || 0
    };
};

const bindStudent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { student_id, real_name, college, major, grade, class_name, counselor, enrollment_year } = req.body;
        
        if (!student_id || !real_name) {
            return res.status(400).json(response.error(1001, '学号和姓名不能为空'));
        }
        
        const existingUser = await db.getAsync(
            'SELECT * FROM user_table WHERE student_id = ? AND id != ?',
            [student_id, userId]
        );
        
        if (existingUser) {
            return res.status(400).json(response.error(2008, '学号已被绑定'));
        }
        
        await db.runAsync(
            `UPDATE user_table SET 
                student_id = ?, 
                real_name = ?, 
                college = ?, 
                major = ?, 
                grade = ?, 
                class_name = ?,
                counselor = ?,
                enrollment_year = ?,
                update_time = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [student_id, real_name, college || null, major || null, grade || null, class_name || null, counselor || null, enrollment_year || null, userId]
        );
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [userId]);
        
        res.json(response.success(formatUserInfo(user), '绑定成功'));
    } catch (err) {
        log.error('绑定学号失败:', err);
        res.status(500).json(response.error(500, '绑定失败'));
    }
};

const getUserInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [userId]);
        
        if (!user) {
            return res.status(404).json(response.error(2001, '用户不存在'));
        }
        
        const stats = await db.getAsync(
            `SELECT 
                COUNT(*) as total_requests,
                SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as approved_requests,
                SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pending_requests
            FROM request_table WHERE user_id = ?`,
            [userId]
        );
        
        const blessingStats = await db.getAsync(
            `SELECT COUNT(*) as total_blessings FROM blessing_table WHERE user_id = ?`,
            [userId]
        );
        
        res.json(response.success({
            ...formatUserInfo(user),
            create_time: user.create_time,
            update_time: user.update_time,
            stats: {
                total_requests: stats?.total_requests || 0,
                approved_requests: stats?.approved_requests || 0,
                total_blessings: blessingStats?.total_blessings || 0
            }
        }));
    } catch (err) {
        log.error('获取用户信息失败:', err);
        res.status(500).json(response.error(500, '获取用户信息失败'));
    }
};

const updateUserInfo = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nickname, avatar_url, gender, college, major, grade, class_name, counselor, enrollment_year, phone, wechat_name, wechat_account } = req.body;
        
        const updateFields = [];
        const updateValues = [];
        
        const fields = { nickname, avatar_url, gender, college, major, grade, class_name, counselor, enrollment_year, phone, wechat_name, wechat_account };
        
        Object.keys(fields).forEach(key => {
            if (fields[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(fields[key]);
            }
        });
        
        if (updateFields.length === 0) {
            return res.status(400).json(response.error(1001, '没有要更新的字段'));
        }
        
        updateFields.push('update_time = CURRENT_TIMESTAMP');
        updateValues.push(userId);
        
        await db.runAsync(
            `UPDATE user_table SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [userId]);
        
        res.json(response.success(formatUserInfo(user), '更新成功'));
    } catch (err) {
        log.error('更新用户信息失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const checkLogin = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [userId]);
        
        if (!user) {
            return res.status(401).json(response.error(401, '用户不存在'));
        }
        
        res.json(response.success({
            isLogin: true,
            userInfo: formatUserInfo(user)
        }, '已登录'));
    } catch (err) {
        log.error('检查登录状态失败:', err);
        res.status(500).json(response.error(500, '检查登录状态失败'));
    }
};

const logout = async (req, res) => {
    res.json(response.success(null, '退出成功'));
};

const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const requestStats = await db.getAsync(
            `SELECT 
                COUNT(*) as total_requests,
                SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as approved_requests,
                SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as pending_requests,
                SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as rejected_requests
            FROM request_table WHERE user_id = ?`,
            [userId]
        );
        
        const blessingStats = await db.getAsync(
            `SELECT 
                COUNT(*) as total_blessings,
                SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as approved_blessings
            FROM blessing_table WHERE user_id = ?`,
            [userId]
        );
        
        res.json(response.success({
            total_requests: requestStats?.total_requests || 0,
            approved_requests: requestStats?.approved_requests || 0,
            pending_requests: requestStats?.pending_requests || 0,
            rejected_requests: requestStats?.rejected_requests || 0,
            total_blessings: blessingStats?.total_blessings || 0,
            approved_blessings: blessingStats?.approved_blessings || 0
        }));
    } catch (err) {
        log.error('获取用户统计失败:', err);
        res.status(500).json(response.error(500, '获取统计数据失败'));
    }
};

const getUserHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, pageSize = 20 } = req.query;
        const offset = (page - 1) * pageSize;
        
        const list = await db.allAsync(
            `SELECT id, song_id, song_name, singer, message, status, create_time 
            FROM request_table 
            WHERE user_id = ? 
            ORDER BY create_time DESC 
            LIMIT ? OFFSET ?`,
            [userId, parseInt(pageSize), parseInt(offset)]
        );
        
        const totalResult = await db.getAsync(
            'SELECT COUNT(*) as total FROM request_table WHERE user_id = ?',
            [userId]
        );
        
        res.json(response.success(response.paginate(list, totalResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取用户历史失败:', err);
        res.status(500).json(response.error(500, '获取历史记录失败'));
    }
};

const getUserList = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, keyword, college, major, grade, class_name, counselor, enrollment_year, status } = req.query;
        const offset = (page - 1) * pageSize;
        
        let sql = `SELECT u.*, 
            (SELECT COUNT(*) FROM request_table r WHERE r.user_id = u.id) as request_count
            FROM user_table u WHERE 1=1`;
        const params = [];
        
        if (keyword) {
            sql += ' AND (u.nickname LIKE ? OR u.student_id LIKE ? OR u.real_name LIKE ? OR u.class_name LIKE ? OR u.phone LIKE ?)';
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword, likeKeyword, likeKeyword, likeKeyword);
        }
        if (college) {
            sql += ' AND u.college = ?';
            params.push(college);
        }
        if (major) {
            sql += ' AND u.major = ?';
            params.push(major);
        }
        if (grade) {
            sql += ' AND u.grade = ?';
            params.push(grade);
        }
        if (class_name) {
            sql += ' AND u.class_name = ?';
            params.push(class_name);
        }
        if (counselor) {
            sql += ' AND u.counselor LIKE ?';
            params.push(`%${counselor}%`);
        }
        if (enrollment_year) {
            sql += ' AND u.enrollment_year = ?';
            params.push(enrollment_year);
        }
        if (status !== undefined) {
            sql += ' AND u.status = ?';
            params.push(parseInt(status));
        }
        
        const countSql = sql.replace(/SELECT u\.\*,.*FROM/, 'SELECT COUNT(*) as total FROM');
        const totalResult = await db.getAsync(countSql, params);
        
        sql += ' ORDER BY u.create_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), parseInt(offset));
        
        const list = await db.allAsync(sql, params);
        
        const formattedList = list.map(formatUserList);
        
        res.json(response.success(response.paginate(formattedList, totalResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取用户列表失败:', err);
        res.status(500).json(response.error(500, '获取用户列表失败'));
    }
};

const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [id]);
        
        if (!user) {
            return res.status(404).json(response.error(2001, '用户不存在'));
        }
        
        const requestCount = await db.getAsync(
            'SELECT COUNT(*) as count FROM request_table WHERE user_id = ?',
            [id]
        );
        
        const blessingCount = await db.getAsync(
            'SELECT COUNT(*) as count FROM blessing_table WHERE user_id = ?',
            [id]
        );
        
        const result = formatUserList(user);
        result.request_count = requestCount?.count || 0;
        result.blessing_count = blessingCount?.count || 0;
        
        res.json(response.success(result));
    } catch (err) {
        log.error('获取用户详情失败:', err);
        res.status(500).json(response.error(500, '获取用户详情失败'));
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (status === undefined || ![0, 1].includes(parseInt(status))) {
            return res.status(400).json(response.error(1001, '状态值无效'));
        }
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json(response.error(2001, '用户不存在'));
        }
        
        await db.runAsync(
            'UPDATE user_table SET status = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [parseInt(status), id]
        );
        
        const action = status === 0 ? ACTION_TYPES.USER_STATUS_ENABLE : ACTION_TYPES.USER_STATUS_DISABLE;
        await operationLog.logUserOperation(
            req.admin,
            action,
            id,
            `${action}: ${user.real_name || user.nickname} (${user.student_id || '无学号'})`,
            req
        );
        
        res.json(response.success(null, status === 0 ? '已启用用户' : '已禁用用户'));
    } catch (err) {
        log.error('更新用户状态失败:', err);
        res.status(500).json(response.error(500, '更新状态失败'));
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { real_name, nickname, college, major, grade, class_name, counselor, enrollment_year, phone, wechat_name, wechat_account } = req.body;
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json(response.error(2001, '用户不存在'));
        }
        
        const updateFields = [];
        const updateValues = [];
        
        const fields = { real_name, nickname, college, major, grade, class_name, counselor, enrollment_year, phone, wechat_name, wechat_account };
        
        Object.keys(fields).forEach(key => {
            if (fields[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(fields[key]);
            }
        });
        
        if (updateFields.length === 0) {
            return res.status(400).json(response.error(1001, '没有要更新的字段'));
        }
        
        updateFields.push('update_time = CURRENT_TIMESTAMP');
        updateValues.push(id);
        
        await db.runAsync(
            `UPDATE user_table SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        
        const updatedUser = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [id]);
        
        await operationLog.logUserOperation(
            req.admin,
            ACTION_TYPES.USER_UPDATE,
            id,
            `修改用户信息: ${updatedUser.real_name || updatedUser.nickname} (${updatedUser.student_id || '无学号'})`,
            req
        );
        
        res.json(response.success(formatUserList(updatedUser), '更新成功'));
    } catch (err) {
        log.error('更新用户失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json(response.error(2001, '用户不存在'));
        }
        
        await db.runAsync('DELETE FROM user_table WHERE id = ?', [id]);
        
        await operationLog.logUserOperation(
            req.admin,
            ACTION_TYPES.USER_DELETE,
            id,
            `删除用户: ${user.real_name || user.nickname} (${user.student_id || '无学号'})`,
            req
        );
        
        res.json(response.success(null, '删除成功'));
    } catch (err) {
        log.error('删除用户失败:', err);
        res.status(500).json(response.error(500, '删除失败'));
    }
};

const batchDeleteUsers = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json(response.error(1001, '请选择要删除的用户'));
        }
        
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(`DELETE FROM user_table WHERE id IN (${placeholders})`, ids);
        
        await operationLog.logBatchOperation(
            req.admin,
            ACTION_TYPES.USER_BATCH_DELETE,
            ids.length,
            `批量删除用户ID: ${ids.join(', ')}`,
            req
        );
        
        res.json(response.success({ deletedCount: ids.length }, `成功删除 ${ids.length} 个用户`));
    } catch (err) {
        log.error('批量删除用户失败:', err);
        res.status(500).json(response.error(500, '批量删除失败'));
    }
};

const batchUpdateStatus = async (req, res) => {
    try {
        const { ids, status } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json(response.error(1001, '请选择要操作的用户'));
        }
        
        if (status === undefined || ![0, 1].includes(parseInt(status))) {
            return res.status(400).json(response.error(1001, '状态值无效'));
        }
        
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(
            `UPDATE user_table SET status = ?, update_time = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            [parseInt(status), ...ids]
        );
        
        const action = status === 0 ? ACTION_TYPES.USER_BATCH_ENABLE : ACTION_TYPES.USER_BATCH_DISABLE;
        await operationLog.logBatchOperation(
            req.admin,
            action,
            ids.length,
            `批量${status === 0 ? '启用' : '禁用'}用户ID: ${ids.join(', ')}`,
            req
        );
        
        const actionText = status === 0 ? '启用' : '禁用';
        res.json(response.success({ updatedCount: ids.length }, `成功${actionText} ${ids.length} 个用户`));
    } catch (err) {
        log.error('批量更新状态失败:', err);
        res.status(500).json(response.error(500, '批量操作失败'));
    }
};

const batchUpdateUsers = async (req, res) => {
    try {
        const { ids, field, value, data } = req.body;
        
        const userIds = ids || [];
        const updateData = data || (field && value !== undefined ? { [field]: value } : null);
        
        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json(response.error(1001, '请选择要操作的用户'));
        }
        
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json(response.error(1001, '没有要更新的字段'));
        }
        
        const allowedFields = ['college', 'major', 'grade', 'class_name', 'counselor', 'enrollment_year', 'nickname', 'phone', 'wechat_name', 'wechat_account'];
        
        const updateFields = [];
        const updateValues = [];
        
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key) && updateData[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(updateData[key]);
            }
        });
        
        if (updateFields.length === 0) {
            return res.status(400).json(response.error(1001, '没有可更新的字段'));
        }
        
        updateFields.push('update_time = CURRENT_TIMESTAMP');
        
        const placeholders = userIds.map(() => '?').join(',');
        await db.runAsync(
            `UPDATE user_table SET ${updateFields.join(', ')} WHERE id IN (${placeholders})`,
            [...updateValues, ...userIds]
        );
        
        await operationLog.logBatchOperation(
            req.admin,
            ACTION_TYPES.USER_BATCH_UPDATE,
            userIds.length,
            `批量更新用户信息: ${updateFields.join(', ')}`,
            req
        );
        
        res.json(response.success({ updatedCount: userIds.length }, '批量更新成功'));
    } catch (err) {
        log.error('批量更新用户失败:', err);
        res.status(500).json(response.error(500, '批量更新失败'));
    }
};

const batchResetPassword = async (req, res) => {
    try {
        const { ids, password } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json(response.error(1001, '请选择要操作的用户'));
        }
        
        const defaultPassword = password || '123456';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(
            `UPDATE user_table SET password = ?, update_time = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            [hashedPassword, ...ids]
        );
        
        await operationLog.logBatchOperation(
            req.admin,
            ACTION_TYPES.USER_BATCH_PASSWORD_RESET,
            ids.length,
            `批量重置密码, 用户ID: ${ids.join(', ')}`,
            req
        );
        
        res.json(response.success({ updatedCount: ids.length }, `成功重置 ${ids.length} 个用户的密码`));
    } catch (err) {
        log.error('批量重置密码失败:', err);
        res.status(500).json(response.error(500, '批量重置密码失败'));
    }
};

const importUsers = async (req, res) => {
    try {
        const { users, mode } = req.body;
        
        console.log('[导入用户] 接收数据:', { 
            userCount: users ? users.length : 0, 
            mode,
            firstUser: users && users[0] ? JSON.stringify(users[0]) : 'null'
        });
        
        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json(response.error(1001, '没有用户数据'));
        }
        
        const cleanValue = (val) => {
            if (val === undefined || val === null || val === '') return null;
            const str = String(val).trim();
            return str || null;
        };
        
        const validateUserData = (user, index) => {
            const errors = [];
            
            if (!user.student_id && user.student_id !== 0) {
                errors.push('学号为空');
            } else {
                const studentId = cleanValue(user.student_id);
                if (!studentId) {
                    errors.push('学号无效');
                }
            }
            
            return errors;
        };
        
        let successCount = 0;
        let updateCount = 0;
        let failCount = 0;
        const errors = [];
        
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            try {
                console.log(`[导入用户] 处理第${i + 1}条:`, user.student_id, user.real_name);
                
                const validationErrors = validateUserData(user, i);
                if (validationErrors.length > 0) {
                    const errorMsg = `第${i + 1}条数据验证失败: ${validationErrors.join(', ')}`;
                    console.log('[导入用户] 验证错误:', errorMsg);
                    errors.push(errorMsg);
                    failCount++;
                    continue;
                }
                
                const userData = {
                    student_id: cleanValue(user.student_id),
                    real_name: cleanValue(user.real_name),
                    nickname: cleanValue(user.nickname) || cleanValue(user.real_name) || cleanValue(user.student_id),
                    college: cleanValue(user.college),
                    major: cleanValue(user.major),
                    grade: cleanValue(user.grade),
                    class_name: cleanValue(user.class_name),
                    counselor: cleanValue(user.counselor),
                    enrollment_year: cleanValue(user.enrollment_year),
                    phone: cleanValue(user.phone),
                    wechat_name: cleanValue(user.wechat_name),
                    wechat_account: cleanValue(user.wechat_account)
                };
                
                console.log('[导入用户] 清理后数据:', JSON.stringify(userData));
                
                const existing = await db.getAsync('SELECT id FROM user_table WHERE student_id = ?', [userData.student_id]);
                
                if (existing) {
                    console.log('[导入用户] 更新用户:', userData.student_id);
                    await db.runAsync(
                        `UPDATE user_table SET 
                            real_name = COALESCE(?, real_name),
                            nickname = COALESCE(?, nickname),
                            college = COALESCE(?, college),
                            major = COALESCE(?, major),
                            grade = COALESCE(?, grade),
                            class_name = COALESCE(?, class_name),
                            counselor = COALESCE(?, counselor),
                            enrollment_year = COALESCE(?, enrollment_year),
                            phone = COALESCE(?, phone),
                            wechat_name = COALESCE(?, wechat_name),
                            wechat_account = COALESCE(?, wechat_account),
                            update_time = CURRENT_TIMESTAMP
                        WHERE student_id = ?`,
                        [userData.real_name, userData.nickname, userData.college, userData.major, 
                         userData.grade, userData.class_name, userData.counselor, userData.enrollment_year, 
                         userData.phone, userData.wechat_name, userData.wechat_account, userData.student_id]
                    );
                    updateCount++;
                } else {
                    console.log('[导入用户] 新增用户:', userData.student_id);
                    const hashedPassword = user.password ? await bcrypt.hash(String(user.password), 10) : await bcrypt.hash('123456', 10);
                    
                    await db.runAsync(
                        `INSERT INTO user_table (student_id, real_name, nickname, college, major, grade, class_name, counselor, enrollment_year, phone, wechat_name, wechat_account, password, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
                        [userData.student_id, userData.real_name, userData.nickname, userData.college, 
                         userData.major, userData.grade, userData.class_name, userData.counselor, 
                         userData.enrollment_year, userData.phone, userData.wechat_name, userData.wechat_account, hashedPassword]
                    );
                    successCount++;
                }
            } catch (err) {
                const errorMsg = `导入失败: ${user.student_id || '未知学号'} - ${err.message || '未知错误'}`;
                console.error('[导入用户] 异常:', errorMsg, err);
                console.error('[导入用户] 异常数据:', JSON.stringify(user));
                errors.push(errorMsg);
                failCount++;
            }
        }
        
        console.log(`[导入用户] 完成: 成功${successCount}, 更新${updateCount}, 失败${failCount}`);
        
        await operationLog.logBatchOperation(
            req.admin,
            ACTION_TYPES.USER_IMPORT,
            successCount + updateCount,
            `导入用户: 成功${successCount}条, 更新${updateCount}条, 失败${failCount}条`,
            req
        );
        
        res.json(response.success({
            successCount,
            updateCount,
            failCount,
            errors: errors.slice(0, 10)
        }, `导入完成: 成功 ${successCount} 条, 更新 ${updateCount} 条, 失败 ${failCount} 条`));
    } catch (err) {
        log.error('导入用户失败:', err);
        res.status(500).json(response.error(500, '导入失败: ' + err.message));
    }
};

const exportUsers = async (req, res) => {
    try {
        const { ids, college, major, grade, class_name, status } = req.query;
        
        let sql = `SELECT 
            id, student_id, real_name, nickname, gender, college, major, grade, class_name, 
            counselor, enrollment_year, phone, wechat_name, wechat_account, status, create_time,
            (SELECT COUNT(*) FROM request_table r WHERE r.user_id = user_table.id) as request_count
            FROM user_table WHERE 1=1`;
        const params = [];
        
        if (ids) {
            const idList = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            if (idList.length > 0) {
                const placeholders = idList.map(() => '?').join(',');
                sql += ` AND id IN (${placeholders})`;
                params.push(...idList);
            }
        }
        if (college) {
            sql += ' AND college = ?';
            params.push(college);
        }
        if (major) {
            sql += ' AND major = ?';
            params.push(major);
        }
        if (grade) {
            sql += ' AND grade = ?';
            params.push(grade);
        }
        if (class_name) {
            sql += ' AND class_name = ?';
            params.push(class_name);
        }
        if (status !== undefined) {
            sql += ' AND status = ?';
            params.push(parseInt(status));
        }
        
        sql += ' ORDER BY create_time DESC';
        
        const list = await db.allAsync(sql, params);
        
        const exportData = list.map(user => ({
            学号: user.student_id || '',
            姓名: user.real_name || '',
            昵称: user.nickname || '',
            性别: user.gender === 1 ? '男' : user.gender === 2 ? '女' : '未知',
            学院: user.college || '',
            专业: user.major || '',
            年级: user.grade || '',
            班级: user.class_name || '',
            辅导员: user.counselor || '',
            入学年份: user.enrollment_year || '',
            手机号: user.phone || '',
            微信名称: user.wechat_name || '',
            微信账号: user.wechat_account || '',
            点歌次数: user.request_count || 0,
            状态: user.status === 0 ? '正常' : '禁用',
            注册时间: user.create_time
        }));
        
        res.json(response.success(exportData));
    } catch (err) {
        log.error('导出用户失败:', err);
        res.status(500).json(response.error(500, '导出失败'));
    }
};

const getColleges = async (req, res) => {
    try {
        const colleges = await db.allAsync(
            'SELECT DISTINCT college FROM user_table WHERE college IS NOT NULL AND college != "" ORDER BY college'
        );
        res.json(response.success(colleges.map(c => c.college)));
    } catch (err) {
        log.error('获取学院列表失败:', err);
        res.status(500).json(response.error(500, '获取学院列表失败'));
    }
};

const getMajors = async (req, res) => {
    try {
        const { college } = req.query;
        let sql = 'SELECT DISTINCT major FROM user_table WHERE major IS NOT NULL AND major != ""';
        const params = [];
        
        if (college) {
            sql += ' AND college = ?';
            params.push(college);
        }
        
        sql += ' ORDER BY major';
        
        const majors = await db.allAsync(sql, params);
        res.json(response.success(majors.map(m => m.major)));
    } catch (err) {
        log.error('获取专业列表失败:', err);
        res.status(500).json(response.error(500, '获取专业列表失败'));
    }
};

const getGrades = async (req, res) => {
    try {
        const grades = await db.allAsync(
            'SELECT DISTINCT grade FROM user_table WHERE grade IS NOT NULL AND grade != "" ORDER BY grade DESC'
        );
        res.json(response.success(grades.map(g => g.grade)));
    } catch (err) {
        log.error('获取年级列表失败:', err);
        res.status(500).json(response.error(500, '获取年级列表失败'));
    }
};

const getClasses = async (req, res) => {
    try {
        const { college, major, grade } = req.query;
        let sql = 'SELECT DISTINCT class_name FROM user_table WHERE class_name IS NOT NULL AND class_name != ""';
        const params = [];
        
        if (college) {
            sql += ' AND college = ?';
            params.push(college);
        }
        if (major) {
            sql += ' AND major = ?';
            params.push(major);
        }
        if (grade) {
            sql += ' AND grade = ?';
            params.push(grade);
        }
        
        sql += ' ORDER BY class_name';
        
        const classes = await db.allAsync(sql, params);
        res.json(response.success(classes.map(c => c.class_name)));
    } catch (err) {
        log.error('获取班级列表失败:', err);
        res.status(500).json(response.error(500, '获取班级列表失败'));
    }
};

const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json(response.error(2001, '用户不存在'));
        }
        
        const newPassword = password || '123456';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.runAsync(
            'UPDATE user_table SET password = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, id]
        );
        
        await operationLog.logUserOperation(
            req.admin,
            ACTION_TYPES.USER_PASSWORD_RESET,
            id,
            `重置密码: ${user.real_name || user.nickname} (${user.student_id || '无学号'})`,
            req
        );
        
        res.json(response.success(null, '密码重置成功'));
    } catch (err) {
        log.error('重置密码失败:', err);
        res.status(500).json(response.error(500, '重置密码失败'));
    }
};

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, pageSize = 20 } = req.query;
        const offset = (page - 1) * pageSize;
        
        const countResult = await db.getAsync(
            'SELECT COUNT(*) as total FROM notification_table WHERE user_id = ?',
            [userId]
        );
        
        const list = await db.allAsync(
            `SELECT * FROM notification_table WHERE user_id = ? ORDER BY create_time DESC LIMIT ? OFFSET ?`,
            [userId, parseInt(pageSize), parseInt(offset)]
        );
        
        res.json(response.success(response.paginate(list, countResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取通知列表失败:', err);
        res.status(500).json(response.error(500, '获取通知列表失败'));
    }
};

const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const notification = await db.getAsync(
            'SELECT * FROM notification_table WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (!notification) {
            return res.status(404).json(response.error(2001, '通知不存在'));
        }
        
        await db.runAsync(
            'UPDATE notification_table SET is_read = 1 WHERE id = ?',
            [id]
        );
        
        res.json(response.success(null, '已标记为已读'));
    } catch (err) {
        log.error('标记通知已读失败:', err);
        res.status(500).json(response.error(500, '操作失败'));
    }
};

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await db.runAsync(
            'UPDATE notification_table SET is_read = 1 WHERE user_id = ? AND is_read = 0',
            [userId]
        );
        
        res.json(response.success(null, '已全部标记为已读'));
    } catch (err) {
        log.error('标记全部已读失败:', err);
        res.status(500).json(response.error(500, '操作失败'));
    }
};

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json(response.error(1001, '原密码和新密码不能为空'));
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json(response.error(1001, '新密码长度不能少于6位'));
        }
        
        const user = await db.getAsync('SELECT * FROM user_table WHERE id = ?', [userId]);
        
        if (!user) {
            return res.status(404).json(response.error(2001, '用户不存在'));
        }
        
        if (!user.password) {
            return res.status(400).json(response.error(2002, '该账号未设置密码，请联系管理员'));
        }
        
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json(response.error(2002, '原密码错误'));
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.runAsync(
            'UPDATE user_table SET password = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, userId]
        );
        
        res.json(response.success(null, '密码修改成功'));
    } catch (err) {
        log.error('修改密码失败:', err);
        res.status(500).json(response.error(500, '修改密码失败'));
    }
};

module.exports = {
    login,
    loginByStudent,
    bindStudent,
    getUserInfo,
    updateUserInfo,
    checkLogin,
    logout,
    getUserStats,
    getUserHistory,
    getUserList,
    getUserDetail,
    updateUser,
    updateUserStatus,
    resetUserPassword,
    deleteUser,
    batchDeleteUsers,
    batchUpdateStatus,
    batchUpdateUsers,
    batchResetPassword,
    importUsers,
    exportUsers,
    getColleges,
    getMajors,
    getGrades,
    getClasses,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    changePassword
};
