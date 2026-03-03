require('dotenv').config();

const config = {
    server: {
        port: parseInt(process.env.PORT) || 6232,
        host: process.env.HOST || 'localhost',
        env: process.env.NODE_ENV || 'development'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'campus_radio_default_secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    database: {
        type: process.env.DB_TYPE || 'sqlite',
        path: process.env.DB_PATH || './data/campus_radio.db',
        mysql: {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'campus_radio',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        }
    },
    upload: {
        path: process.env.UPLOAD_PATH || './uploads',
        maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024
    }
};

module.exports = config;
