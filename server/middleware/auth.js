const jwt = require('jsonwebtoken');
const config = require('../config/config');
const response = require('../utils/response');

const auth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json(response.error(401, '未登录或登录已过期'));
    }
    
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json(response.error(401, 'Token无效或已过期'));
    }
};

const adminAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json(response.error(401, '未登录或登录已过期'));
    }
    
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        if (!decoded.isAdmin) {
            return res.status(403).json(response.error(403, '权限不足'));
        }
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json(response.error(401, 'Token无效或已过期'));
    }
};

const superAdminAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json(response.error(401, '未登录或登录已过期'));
    }
    
    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        if (!decoded.isAdmin || decoded.role !== 'super_admin') {
            return res.status(403).json(response.error(403, '权限不足，需要超级管理员权限'));
        }
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(401).json(response.error(401, 'Token无效或已过期'));
    }
};

const optionalAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
        try {
            const decoded = jwt.verify(token, config.jwt.secret);
            req.user = decoded;
        } catch (err) {
            // Token无效，但继续执行
        }
    }
    next();
};

module.exports = {
    auth,
    adminAuth,
    superAdminAuth,
    optionalAuth
};
