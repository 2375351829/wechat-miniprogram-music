const db = require('../config/db-sqlite');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const response = require('../utils/response');
const log = require('../utils/logger');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json(response.error(1001, '用户名和密码不能为空'));
        }
        
        const admin = await db.getAsync(
            'SELECT * FROM admin_table WHERE username = ?',
            [username]
        );
        
        if (!admin) {
            return res.status(400).json(response.error(6001, '管理员不存在'));
        }
        
        if (admin.status === 1) {
            return res.status(403).json(response.error(6003, '账号已被禁用'));
        }
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json(response.error(6002, '密码错误'));
        }
        
        await db.runAsync(
            'UPDATE admin_table SET last_login_time = CURRENT_TIMESTAMP WHERE id = ?',
            [admin.id]
        );
        
        const token = jwt.sign(
            {
                id: admin.id,
                username: admin.username,
                real_name: admin.real_name,
                role: admin.role,
                isAdmin: true
            },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );
        
        log.info(`管理员登录成功: ${username}`);
        
        res.json(response.success({
            token,
            adminInfo: {
                id: admin.id,
                username: admin.username,
                real_name: admin.real_name,
                role: admin.role,
                last_login_time: admin.last_login_time
            }
        }, '登录成功'));
    } catch (err) {
        log.error('管理员登录失败:', err);
        res.status(500).json(response.error(500, '登录失败'));
    }
};

const logout = async (req, res) => {
    res.json(response.success(null, '登出成功'));
};

const getAdminInfo = async (req, res) => {
    try {
        const adminId = req.admin.id;
        
        const admin = await db.getAsync(
            'SELECT id, username, real_name, role, status, last_login_time, create_time FROM admin_table WHERE id = ?',
            [adminId]
        );
        
        if (!admin) {
            return res.status(404).json(response.error(6001, '管理员不存在'));
        }
        
        res.json(response.success(admin));
    } catch (err) {
        log.error('获取管理员信息失败:', err);
        res.status(500).json(response.error(500, '获取信息失败'));
    }
};

const changePassword = async (req, res) => {
    try {
        const adminId = req.admin.id;
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json(response.error(1001, '原密码和新密码不能为空'));
        }
        
        if (newPassword.length < 6 || newPassword.length > 20) {
            return res.status(400).json(response.error(1002, '新密码长度需在6-20位之间'));
        }
        
        const admin = await db.getAsync('SELECT * FROM admin_table WHERE id = ?', [adminId]);
        
        const isMatch = await bcrypt.compare(oldPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json(response.error(6006, '原密码错误'));
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.runAsync(
            'UPDATE admin_table SET password = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, adminId]
        );
        
        res.json(response.success(null, '密码修改成功，请重新登录'));
    } catch (err) {
        log.error('修改密码失败:', err);
        res.status(500).json(response.error(500, '修改密码失败'));
    }
};

const getDashboard = async (req, res) => {
    try {
        const totalSongs = await db.getAsync('SELECT COUNT(*) as count FROM song_table WHERE status = 0');
        const pendingRequests = await db.getAsync('SELECT COUNT(*) as count FROM request_table WHERE status = 0');
        const pendingBlessings = await db.getAsync('SELECT COUNT(*) as count FROM blessing_table WHERE status = 0');
        const todayPlayed = await db.getAsync(
            `SELECT COUNT(*) as count FROM request_table WHERE status = 3 AND date(update_time) = date('now')`
        );
        const totalUsers = await db.getAsync('SELECT COUNT(*) as count FROM user_table WHERE status = 0');
        const todayRequests = await db.getAsync(
            `SELECT COUNT(*) as count FROM request_table WHERE date(create_time) = date('now')`
        );
        
        const pendingList = await db.allAsync(
            `SELECT r.id, r.song_name, r.singer, r.message, u.nickname, r.create_time 
            FROM request_table r 
            LEFT JOIN user_table u ON r.user_id = u.id 
            WHERE r.status = 0 
            ORDER BY r.create_time ASC 
            LIMIT 5`
        );
        
        res.json(response.success({
            totalSongs: totalSongs?.count || 0,
            pendingRequests: pendingRequests?.count || 0,
            pendingBlessings: pendingBlessings?.count || 0,
            todayPlayed: todayPlayed?.count || 0,
            totalUsers: totalUsers?.count || 0,
            todayRequests: todayRequests?.count || 0,
            pendingList
        }));
    } catch (err) {
        log.error('获取仪表盘数据失败:', err);
        res.status(500).json(response.error(500, '获取数据失败'));
    }
};

const createAdmin = async (req, res) => {
    try {
        const { username, password, real_name, role = 'admin' } = req.body;
        
        if (!username || !password) {
            return res.status(400).json(response.error(1001, '用户名和密码不能为空'));
        }
        
        const existingAdmin = await db.getAsync(
            'SELECT * FROM admin_table WHERE username = ?',
            [username]
        );
        
        if (existingAdmin) {
            return res.status(400).json(response.error(6005, '用户名已存在'));
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.runAsync(
            'INSERT INTO admin_table (username, password, real_name, role, status) VALUES (?, ?, ?, ?, 0)',
            [username, hashedPassword, real_name || null, role]
        );
        
        log.info(`创建管理员成功: ${username}`);
        
        res.json(response.success({
            id: result.id,
            username,
            real_name,
            role
        }, '创建成功'));
    } catch (err) {
        log.error('创建管理员失败:', err);
        res.status(500).json(response.error(500, '创建失败'));
    }
};

const getAdminList = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, keyword, role, status } = req.query;
        const offset = (page - 1) * pageSize;
        
        let sql = 'SELECT id, username, real_name, role, status, last_login_time, last_login_ip, create_time FROM admin_table WHERE 1=1';
        const params = [];
        
        if (keyword) {
            sql += ' AND (username LIKE ? OR real_name LIKE ?)';
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword);
        }
        if (role) {
            sql += ' AND role = ?';
            params.push(role);
        }
        if (status !== undefined) {
            sql += ' AND status = ?';
            params.push(parseInt(status));
        }
        
        const countSql = sql.replace('SELECT id, username, real_name, role, status, last_login_time, last_login_ip, create_time', 'SELECT COUNT(*) as total');
        const totalResult = await db.getAsync(countSql, params);
        
        sql += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), parseInt(offset));
        
        const list = await db.allAsync(sql, params);
        
        res.json(response.success(response.paginate(list, totalResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取管理员列表失败:', err);
        res.status(500).json(response.error(500, '获取列表失败'));
    }
};

const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { real_name, role } = req.body;
        
        await db.runAsync(
            'UPDATE admin_table SET real_name = ?, role = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [real_name, role, id]
        );
        
        res.json(response.success(null, '更新成功'));
    } catch (err) {
        log.error('更新管理员失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const updateAdminStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await db.runAsync(
            'UPDATE admin_table SET status = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [parseInt(status), id]
        );
        
        res.json(response.success(null, '状态更新成功'));
    } catch (err) {
        log.error('更新管理员状态失败:', err);
        res.status(500).json(response.error(500, '更新状态失败'));
    }
};

const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (parseInt(id) === req.admin.id) {
            return res.status(400).json(response.error(1005, '不能删除自己的账号'));
        }
        
        await db.runAsync('DELETE FROM admin_table WHERE id = ?', [id]);
        
        res.json(response.success(null, '删除成功'));
    } catch (err) {
        log.error('删除管理员失败:', err);
        res.status(500).json(response.error(500, '删除失败'));
    }
};

module.exports = {
    login,
    logout,
    getAdminInfo,
    changePassword,
    getDashboard,
    createAdmin,
    getAdminList,
    updateAdmin,
    updateAdminStatus,
    deleteAdmin
};
