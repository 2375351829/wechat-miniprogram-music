const success = (data = null, msg = 'success') => {
    return {
        code: 0,
        msg,
        data
    };
};

const error = (code = 500, msg = '服务器内部错误', data = null) => {
    return {
        code,
        msg,
        data
    };
};

const paginate = (list, total, page, pageSize) => {
    return {
        list,
        total,
        page: parseInt(page) || 1,
        pageSize: parseInt(pageSize) || 20,
        totalPages: Math.ceil(total / (parseInt(pageSize) || 20))
    };
};

module.exports = {
    success,
    error,
    paginate
};
