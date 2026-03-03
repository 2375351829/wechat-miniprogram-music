const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool(config.database.mysql);

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('MySQL数据库连接成功');
        connection.release();
    } catch (err) {
        console.error('MySQL数据库连接失败:', err.message);
    }
}

testConnection();

module.exports = pool;
