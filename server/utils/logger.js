const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const getTimestamp = () => {
    return new Date().toISOString();
};

const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const log = {
    debug: (message, ...args) => {
        console.log(`${colors.cyan}[DEBUG]${colors.reset} ${getTimestamp()} -`, message, ...args);
    },
    info: (message, ...args) => {
        console.log(`${colors.green}[INFO]${colors.reset} ${getTimestamp()} -`, message, ...args);
    },
    warn: (message, ...args) => {
        console.log(`${colors.yellow}[WARN]${colors.reset} ${getTimestamp()} -`, message, ...args);
    },
    error: (message, ...args) => {
        console.log(`${colors.red}[ERROR]${colors.reset} ${getTimestamp()} -`, message, ...args);
    }
};

module.exports = log;
