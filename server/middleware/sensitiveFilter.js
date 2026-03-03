const { checkSensitive } = require('../utils/sensitiveWords');
const response = require('../utils/response');

const sensitiveFilter = (fields = ['message', 'content', 'blessing']) => {
    return (req, res, next) => {
        const checkFields = (obj) => {
            if (!obj || typeof obj !== 'object') return;
            
            for (const field of fields) {
                if (obj[field]) {
                    const result = checkSensitive(obj[field]);
                    if (result.hasSensitive) {
                        return res.status(400).json(response.error(4006, `内容包含敏感词: ${result.words.join(', ')}`));
                    }
                }
            }
        };
        
        checkFields(req.body);
        checkFields(req.query);
        checkFields(req.params);
        
        next();
    };
};

module.exports = sensitiveFilter;
