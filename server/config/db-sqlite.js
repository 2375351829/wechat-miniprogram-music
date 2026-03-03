const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const dbPath = path.resolve(__dirname, '..', config.database.path);
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;
let SQL = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_INTERVAL = 3000;

async function initDatabase() {
    try {
        SQL = await initSqlJs();
        
        if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
        } else {
            db = new SQL.Database();
        }
        
        console.log('SQLite数据库连接成功:', dbPath);
        reconnectAttempts = 0;
        
        await runMigrations();
        
        return db;
    } catch (err) {
        console.error('数据库初始化失败:', err);
        throw err;
    }
}

function reconnectDatabase() {
    return new Promise((resolve, reject) => {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            console.error('数据库重连次数已达上限');
            reject(new Error('数据库重连失败'));
            return;
        }
        
        reconnectAttempts++;
        console.log(`尝试重连数据库 (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        
        setTimeout(async () => {
            try {
                if (fs.existsSync(dbPath)) {
                    const fileBuffer = fs.readFileSync(dbPath);
                    db = new SQL.Database(fileBuffer);
                } else {
                    db = new SQL.Database();
                }
                
                console.log('数据库重连成功');
                resolve(db);
            } catch (err) {
                console.error(`数据库重连失败: ${err.message}`);
                reject(err);
            }
        }, RECONNECT_INTERVAL);
    });
}

async function runMigrations() {
    try {
        const userTableInfo = await allAsync("PRAGMA table_info(user_table)");
        const userColumns = userTableInfo.map(col => col.name);
        
        const userMigrations = [
            { name: 'enrollment_year', sql: 'ALTER TABLE user_table ADD COLUMN enrollment_year VARCHAR(4)' },
        ];
        
        for (const migration of userMigrations) {
            if (!userColumns.includes(migration.name)) {
                try {
                    await execAsync(migration.sql);
                    console.log(`[迁移] 添加用户字段: ${migration.name}`);
                } catch (err) {
                    if (!err.message.includes('duplicate column')) {
                        console.log(`[迁移] 用户字段 ${migration.name} 已存在或添加失败: ${err.message}`);
                    }
                }
            }
        }
        
        const songTableInfo = await allAsync("PRAGMA table_info(song_table)");
        const songColumns = songTableInfo.map(col => col.name);
        
        const songMigrations = [
            { name: 'music_url', sql: 'ALTER TABLE song_table ADD COLUMN music_url VARCHAR(512)' },
            { name: 'lyrics', sql: 'ALTER TABLE song_table ADD COLUMN lyrics TEXT' }
        ];
        
        for (const migration of songMigrations) {
            if (!songColumns.includes(migration.name)) {
                try {
                    await execAsync(migration.sql);
                    console.log(`[迁移] 添加歌曲字段: ${migration.name}`);
                } catch (err) {
                    if (!err.message.includes('duplicate column')) {
                        console.log(`[迁移] 歌曲字段 ${migration.name} 已存在或添加失败: ${err.message}`);
                    }
                }
            }
        }
        
        const configTableInfo = await allAsync("PRAGMA table_info(homepage_config_table)");
        const configColumns = configTableInfo.map(col => col.name);
        
        const configMigrations = [
            { name: 'banner_count', sql: 'ALTER TABLE homepage_config_table ADD COLUMN banner_count INTEGER DEFAULT 5' },
            { name: 'banner_auto_play', sql: 'ALTER TABLE homepage_config_table ADD COLUMN banner_auto_play TINYINT DEFAULT 1' },
            { name: 'banner_interval', sql: 'ALTER TABLE homepage_config_table ADD COLUMN banner_interval INTEGER DEFAULT 3000' },
            { name: 'announcement_count', sql: 'ALTER TABLE homepage_config_table ADD COLUMN announcement_count INTEGER DEFAULT 3' },
            { name: 'hot_song_count', sql: 'ALTER TABLE homepage_config_table ADD COLUMN hot_song_count INTEGER DEFAULT 10' },
            { name: 'new_song_count', sql: 'ALTER TABLE homepage_config_table ADD COLUMN new_song_count INTEGER DEFAULT 10' },
            { name: 'recommend_song_count', sql: 'ALTER TABLE homepage_config_table ADD COLUMN recommend_song_count INTEGER DEFAULT 6' }
        ];
        
        for (const migration of configMigrations) {
            if (!configColumns.includes(migration.name)) {
                try {
                    await execAsync(migration.sql);
                    console.log(`[迁移] 添加配置字段: ${migration.name}`);
                } catch (err) {
                    if (!err.message.includes('duplicate column')) {
                        console.log(`[迁移] 配置字段 ${migration.name} 已存在或添加失败: ${err.message}`);
                    }
                }
            }
        }
        
        const currentPlayExists = await getAsync('SELECT id FROM current_play_table WHERE id = 1');
        if (!currentPlayExists) {
            await runAsync('INSERT INTO current_play_table (id) VALUES (1)');
            console.log('[初始化] 创建 current_play_table 初始记录');
        }
        
        const configExists = await getAsync('SELECT id FROM homepage_config_table WHERE id = 1');
        if (!configExists) {
            await runAsync('INSERT INTO homepage_config_table (id) VALUES (1)');
            console.log('[初始化] 创建 homepage_config_table 初始记录');
        }
        
        const categoryTableExists = await getAsync("SELECT name FROM sqlite_master WHERE type='table' AND name='song_category_table'");
        if (!categoryTableExists) {
            await execAsync(`
                CREATE TABLE IF NOT EXISTS song_category_table (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(32) NOT NULL UNIQUE,
                    sort INT NOT NULL DEFAULT 0,
                    status TINYINT NOT NULL DEFAULT 0,
                    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            `);
            const defaultCategories = [
                { name: '流行', sort: 1 },
                { name: '摇滚', sort: 2 },
                { name: '民谣', sort: 3 },
                { name: '古典', sort: 4 },
                { name: '电子', sort: 5 },
                { name: '说唱', sort: 6 },
                { name: 'R&B', sort: 7 },
                { name: '其他', sort: 99 }
            ];
            for (const cat of defaultCategories) {
                await runAsync('INSERT INTO song_category_table (name, sort) VALUES (?, ?)', [cat.name, cat.sort]);
            }
            console.log('[初始化] 创建 song_category_table 并添加默认分类');
        }
        
        if (!songColumns.includes('category_id')) {
            try {
                await execAsync('ALTER TABLE song_table ADD COLUMN category_id INTEGER REFERENCES song_category_table(id)');
                console.log('[迁移] 添加歌曲分类字段：category_id');
            } catch (err) {
                if (!err.message.includes('duplicate column')) {
                    console.log(`[迁移] 歌曲分类字段已存在或添加失败：${err.message}`);
                }
            }
        }
        
        const currentPlayColumns = ['is_paused', 'current_time', 'duration', 'volume', 'play_mode', 'pause_time', 'resume_time'];
        const currentPlayTableInfo = await allAsync("PRAGMA table_info(current_play_table)");
        const currentPlayCols = currentPlayTableInfo.map(col => col.name);
        
        const currentPlayMigrations = [
            { name: 'is_paused', sql: 'ALTER TABLE current_play_table ADD COLUMN is_paused TINYINT DEFAULT 0' },
            { name: 'current_time', sql: 'ALTER TABLE current_play_table ADD COLUMN current_time REAL DEFAULT 0' },
            { name: 'duration', sql: 'ALTER TABLE current_play_table ADD COLUMN duration REAL DEFAULT 0' },
            { name: 'volume', sql: 'ALTER TABLE current_play_table ADD COLUMN volume INTEGER DEFAULT 50' },
            { name: 'play_mode', sql: 'ALTER TABLE current_play_table ADD COLUMN play_mode VARCHAR(20) DEFAULT \'list\'' },
            { name: 'pause_time', sql: 'ALTER TABLE current_play_table ADD COLUMN pause_time DATETIME' },
            { name: 'resume_time', sql: 'ALTER TABLE current_play_table ADD COLUMN resume_time DATETIME' }
        ];
        
        for (const migration of currentPlayMigrations) {
            if (!currentPlayCols.includes(migration.name)) {
                try {
                    await execAsync(migration.sql);
                    console.log(`[迁移] 添加播放控制字段：${migration.name}`);
                } catch (err) {
                    if (!err.message.includes('duplicate column')) {
                        console.log(`[迁移] 播放控制字段 ${migration.name} 已存在或添加失败：${err.message}`);
                    }
                }
            }
        }
        
        saveDatabase();
    } catch (err) {
        console.log('[迁移] 数据库迁移检查失败:', err.message);
    }
}

function saveDatabase() {
    if (db) {
        try {
            const data = db.export();
            const buffer = Buffer.from(data);
            fs.writeFileSync(dbPath, buffer);
        } catch (err) {
            console.error('保存数据库失败:', err);
            throw err;
        }
    }
}

function runAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        try {
            const cleanParams = params.map(p => {
                if (p === undefined) return null;
                return p;
            });
            
            db.run(sql, cleanParams);
            const result = db.exec("SELECT last_insert_rowid() as id");
            let lastId = 0;
            if (result && result.length > 0 && result[0].values && result[0].values.length > 0) {
                lastId = result[0].values[0][0];
            }
            const changesResult = db.exec("SELECT changes() as count");
            let changes = 0;
            if (changesResult && changesResult.length > 0 && changesResult[0].values && changesResult[0].values.length > 0) {
                changes = changesResult[0].values[0][0];
            }
            saveDatabase();
            resolve({ id: lastId, lastInsertRowid: lastId, changes: changes });
        } catch (err) {
            reject(err);
        }
    });
}

function getAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        try {
            const cleanParams = params.map(p => {
                if (p === undefined) return null;
                return p;
            });
            
            const stmt = db.prepare(sql);
            if (cleanParams.length > 0) {
                stmt.bind(cleanParams);
            }
            
            if (stmt.step()) {
                const row = stmt.getAsObject();
                stmt.free();
                resolve(row);
            } else {
                stmt.free();
                resolve(null);
            }
        } catch (err) {
            reject(err);
        }
    });
}

function allAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        try {
            const cleanParams = params.map(p => {
                if (p === undefined) return null;
                return p;
            });
            
            const stmt = db.prepare(sql);
            if (cleanParams.length > 0) {
                stmt.bind(cleanParams);
            }
            
            const rows = [];
            while (stmt.step()) {
                rows.push(stmt.getAsObject());
            }
            stmt.free();
            resolve(rows);
        } catch (err) {
            reject(err);
        }
    });
}

function execAsync(sql) {
    return new Promise((resolve, reject) => {
        try {
            db.exec(sql);
            saveDatabase();
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

module.exports = {
    initDatabase,
    saveDatabase,
    runAsync,
    getAsync,
    allAsync,
    execAsync,
    reconnectDatabase,
    getDb: () => db
};
