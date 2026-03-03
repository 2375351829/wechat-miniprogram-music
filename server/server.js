require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const config = require('./config/config');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const log = require('./utils/logger');

const sqliteDb = require('./config/db-sqlite');

const initDatabase = async () => {
    try {
        await sqliteDb.initDatabase();
        
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const initPath = path.join(__dirname, '..', 'database', 'init.sql');
        
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const statements = schema.split(';').filter(s => s.trim());
            
            for (const statement of statements) {
                if (statement.trim()) {
                    try {
                        await sqliteDb.execAsync(statement);
                    } catch (err) {
                        // 忽略表已存在错误
                    }
                }
            }
            log.info('数据库表结构初始化完成');
        }
        
        if (fs.existsSync(initPath)) {
            const initData = fs.readFileSync(initPath, 'utf8');
            const statements = initData.split(';').filter(s => s.trim());
            
            for (const statement of statements) {
                if (statement.trim()) {
                    try {
                        await sqliteDb.runAsync(statement);
                    } catch (err) {
                        // 忽略重复插入错误
                    }
                }
            }
            log.info('数据库初始数据加载完成');
        }
    } catch (err) {
        log.error('数据库初始化失败:', err);
        throw err;
    }
};

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'admin-web')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use('/api/users', require('./routes/user'));
app.use('/api/songs', require('./routes/song'));
app.use('/api/requests', require('./routes/request'));
app.use('/api/blessings', require('./routes/blessing'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/homepage', require('./routes/homepage'));
app.use('/api/play', require('./routes/play'));

app.get('/api/health', (req, res) => {
    res.json({
        code: 0,
        msg: '服务运行正常',
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            server: {
                ready: true,
                port: config.server.port,
                host: config.server.host
            },
            database: {
                connected: true
            }
        }
    });
});

app.get('/api/ready', (req, res) => {
    res.json({
        code: 0,
        msg: '服务器已就绪',
        data: {
            ready: true,
            timestamp: new Date().toISOString()
        }
    });
});

app.use(notFound);
app.use(errorHandler);

const openBrowser = (url) => {
    const platform = process.platform;
    let command;
    
    if (platform === 'win32') {
        command = `start "" "${url}"`;
    } else if (platform === 'darwin') {
        command = `open "${url}"`;
    } else {
        command = `xdg-open "${url}"`;
    }
    
    exec(command, (err) => {
        if (err) {
            log.warn('无法自动打开浏览器，请手动访问: ' + url);
        }
    });
};

const startServer = async () => {
    try {
        await initDatabase();
        
        app.listen(config.server.port, config.server.host, () => {
            const serverUrl = `http://${config.server.host}:${config.server.port}`;
            const adminLoginUrl = `${serverUrl}/pages/login.html`;
            
            log.info(`服务器启动成功: ${serverUrl}`);
            log.info(`管理后台: ${adminLoginUrl}`);
            log.info(`环境: ${config.server.env}`);
            
            if (config.server.env === 'development') {
                openBrowser(adminLoginUrl);
            }
        });
    } catch (err) {
        log.error('服务器启动失败:', err);
        process.exit(1);
    }
};

startServer();

module.exports = app;
