const response = require('../utils/response');
const log = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    log.error('服务器错误:', err);
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json(response.error(401, '未授权访问'));
    }
    
    if (err.name === 'ValidationError') {
        return res.status(400).json(response.error(1002, err.message));
    }
    
    if (err.name === 'NotFoundError') {
        return res.status(404).json(response.error(1003, err.message));
    }
    
    return res.status(500).json(response.error(500, '服务器内部错误'));
};

const notFound = (req, res) => {
    res.status(404).json(response.error(404, '接口不存在'));
};

class AppError extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'AppError';
    }
}

class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}

module.exports = {
    errorHandler,
    notFound,
    AppError,
    ValidationError,
    NotFoundError
};
