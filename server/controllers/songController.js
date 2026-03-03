const db = require('../config/db-sqlite');
const response = require('../utils/response');
const log = require('../utils/logger');
const { operationLog, ACTION_TYPES } = require('../utils/operationLog');

const searchSongs = async (req, res) => {
    try {
        const { keyword } = req.query;
        
        if (!keyword) {
            return res.status(400).json(response.error(1001, '请输入搜索关键词'));
        }
        
        const songs = await db.allAsync(
            `SELECT id, name, singer, cover_url, status, play_count 
            FROM song_table 
            WHERE (name LIKE ? OR singer LIKE ?) AND status = 0 
            ORDER BY play_count DESC 
            LIMIT 20`,
            [`%${keyword}%`, `%${keyword}%`]
        );
        
        res.json(response.success(songs));
    } catch (err) {
        log.error('搜索歌曲失败:', err);
        res.status(500).json(response.error(500, '搜索失败'));
    }
};

const getSongList = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, status, keyword } = req.query;
        const offset = (page - 1) * pageSize;
        
        let sql = 'SELECT * FROM song_table WHERE 1=1';
        const params = [];
        
        if (status !== undefined) {
            sql += ' AND status = ?';
            params.push(parseInt(status));
        }
        
        if (keyword) {
            sql += ' AND (name LIKE ? OR singer LIKE ? OR album_name LIKE ?)';
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword, likeKeyword);
        }
        
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
        const totalResult = await db.getAsync(countSql, params);
        
        sql += ' ORDER BY create_time DESC LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), parseInt(offset));
        
        const list = await db.allAsync(sql, params);
        
        res.json(response.success(response.paginate(list, totalResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取歌曲列表失败:', err);
        res.status(500).json(response.error(500, '获取歌曲列表失败'));
    }
};

const getHotSongs = async (req, res) => {
    try {
        const songs = await db.allAsync(
            `SELECT id, name, singer, cover_url, play_count 
            FROM song_table 
            WHERE status = 0 
            ORDER BY play_count DESC 
            LIMIT 10`
        );
        
        res.json(response.success(songs));
    } catch (err) {
        log.error('获取热门歌曲失败:', err);
        res.status(500).json(response.error(500, '获取热门歌曲失败'));
    }
};

const getNewSongs = async (req, res) => {
    try {
        const songs = await db.allAsync(
            `SELECT id, name, singer, cover_url, create_time 
            FROM song_table 
            WHERE status = 0 
            ORDER BY create_time DESC 
            LIMIT 10`
        );
        
        res.json(response.success(songs));
    } catch (err) {
        log.error('获取新歌失败:', err);
        res.status(500).json(response.error(500, '获取新歌失败'));
    }
};

const getSongDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const song = await db.getAsync(
            'SELECT * FROM song_table WHERE id = ?',
            [id]
        );
        
        if (!song) {
            return res.status(404).json(response.error(3001, '歌曲不存在'));
        }
        
        res.json(response.success(song));
    } catch (err) {
        log.error('获取歌曲详情失败:', err);
        res.status(500).json(response.error(500, '获取歌曲详情失败'));
    }
};

const addSong = async (req, res) => {
    try {
        const { name, singer, cover_url, status = 0, album_name, duration, music_url, lyrics } = req.body;
        
        if (!name || !singer) {
            return res.status(400).json(response.error(1001, '歌曲名称和歌手不能为空'));
        }
        
        const result = await db.runAsync(
            `INSERT INTO song_table (name, singer, cover_url, status, album_name, duration, music_url, lyrics) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, singer, cover_url || null, status, album_name || null, duration || null, music_url || null, lyrics || null]
        );
        
        const song = await db.getAsync('SELECT * FROM song_table WHERE id = ?', [result.id]);
        
        await operationLog.logUserOperation(
            req.admin,
            ACTION_TYPES.SONG_ADD,
            result.id,
            `添加歌曲: ${name} - ${singer}`,
            req
        );
        
        res.json(response.success(song, '添加成功'));
    } catch (err) {
        log.error('添加歌曲失败:', err);
        res.status(500).json(response.error(500, '添加失败'));
    }
};

const updateSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, singer, cover_url, album_name, duration, music_url, lyrics } = req.body;
        
        const song = await db.getAsync('SELECT * FROM song_table WHERE id = ?', [id]);
        if (!song) {
            return res.status(404).json(response.error(3001, '歌曲不存在'));
        }
        
        const updateFields = [];
        const updateValues = [];
        
        if (name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }
        if (singer !== undefined) {
            updateFields.push('singer = ?');
            updateValues.push(singer);
        }
        if (cover_url !== undefined) {
            updateFields.push('cover_url = ?');
            updateValues.push(cover_url);
        }
        if (album_name !== undefined) {
            updateFields.push('album_name = ?');
            updateValues.push(album_name);
        }
        if (duration !== undefined) {
            updateFields.push('duration = ?');
            updateValues.push(duration);
        }
        if (music_url !== undefined) {
            updateFields.push('music_url = ?');
            updateValues.push(music_url);
        }
        if (lyrics !== undefined) {
            updateFields.push('lyrics = ?');
            updateValues.push(lyrics);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json(response.error(1001, '没有要更新的字段'));
        }
        
        updateFields.push('update_time = CURRENT_TIMESTAMP');
        updateValues.push(id);
        
        await db.runAsync(
            `UPDATE song_table SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        
        const updatedSong = await db.getAsync('SELECT * FROM song_table WHERE id = ?', [id]);
        
        await operationLog.logUserOperation(
            req.admin,
            ACTION_TYPES.SONG_UPDATE,
            id,
            `修改歌曲: ${updatedSong.name} - ${updatedSong.singer}`,
            req
        );
        
        res.json(response.success(updatedSong, '更新成功'));
    } catch (err) {
        log.error('更新歌曲失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const deleteSong = async (req, res) => {
    try {
        const { id } = req.params;
        
        const song = await db.getAsync('SELECT * FROM song_table WHERE id = ?', [id]);
        
        await db.runAsync('DELETE FROM song_table WHERE id = ?', [id]);
        
        if (song) {
            await operationLog.logUserOperation(
                req.admin,
                ACTION_TYPES.SONG_DELETE,
                id,
                `删除歌曲: ${song.name} - ${song.singer}`,
                req
            );
        }
        
        res.json(response.success(null, '删除成功'));
    } catch (err) {
        log.error('删除歌曲失败:', err);
        res.status(500).json(response.error(500, '删除失败'));
    }
};

const updateSongStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (status === undefined || ![0, 1].includes(parseInt(status))) {
            return res.status(400).json(response.error(1001, '状态值无效'));
        }
        
        const song = await db.getAsync('SELECT * FROM song_table WHERE id = ?', [id]);
        
        await db.runAsync(
            'UPDATE song_table SET status = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [parseInt(status), id]
        );
        
        if (song) {
            const action = status === 0 ? '上架' : '下架';
            await operationLog.logUserOperation(
                req.admin,
                status === 0 ? '歌曲上架' : '歌曲下架',
                id,
                `${action}: ${song.name} - ${song.singer}`,
                req
            );
        }
        
        res.json(response.success(null, '状态更新成功'));
    } catch (err) {
        log.error('更新歌曲状态失败:', err);
        res.status(500).json(response.error(500, '更新状态失败'));
    }
};

const batchAddSongs = async (req, res) => {
    try {
        const { songs, conflictStrategy = 'skip' } = req.body;
        
        if (!songs || !Array.isArray(songs) || songs.length === 0) {
            return res.status(400).json(response.error(1001, '请提供歌曲数据'));
        }
        
        let addedCount = 0;
        let skippedCount = 0;
        let updatedCount = 0;
        const errors = [];
        
        for (const song of songs) {
            try {
                if (!song.name || !song.singer) {
                    errors.push(`缺少必填字段: ${song.name || song.singer || '未知'}`);
                    skippedCount++;
                    continue;
                }
                
                const existing = await db.getAsync(
                    'SELECT id FROM song_table WHERE name = ? AND singer = ?',
                    [song.name, song.singer]
                );
                
                if (existing) {
                    if (conflictStrategy === 'skip') {
                        skippedCount++;
                        continue;
                    } else if (conflictStrategy === 'update') {
                        await db.runAsync(
                            `UPDATE song_table SET 
                                album_name = COALESCE(?, album_name),
                                cover_url = COALESCE(?, cover_url),
                                duration = COALESCE(?, duration),
                                update_time = CURRENT_TIMESTAMP
                            WHERE id = ?`,
                            [song.album_name || null, song.cover_url || null, song.duration || null, existing.id]
                        );
                        updatedCount++;
                        continue;
                    }
                }
                
                await db.runAsync(
                    `INSERT INTO song_table (name, singer, cover_url, album_name, duration, status) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [song.name, song.singer, song.cover_url || null, song.album_name || null, song.duration || null, song.status !== undefined ? song.status : 0]
                );
                addedCount++;
            } catch (err) {
                errors.push(`处理失败: ${song.name} - ${err.message}`);
                skippedCount++;
            }
        }
        
        await operationLog.logBatchOperation(
            req.admin,
            ACTION_TYPES.SONG_ADD,
            addedCount + updatedCount,
            `批量添加歌曲: 新增${addedCount}首, 更新${updatedCount}首, 跳过${skippedCount}首`,
            req
        );
        
        res.json(response.success({
            addedCount,
            updatedCount,
            skippedCount,
            errors: errors.slice(0, 10)
        }, `批量操作完成: 新增${addedCount}首, 更新${updatedCount}首, 跳过${skippedCount}首`));
    } catch (err) {
        log.error('批量添加歌曲失败:', err);
        res.status(500).json(response.error(500, '批量添加失败'));
    }
};

const batchDeleteSongs = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json(response.error(1001, '请选择要删除的歌曲'));
        }
        
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(`DELETE FROM song_table WHERE id IN (${placeholders})`, ids);
        
        await operationLog.logBatchOperation(
            req.admin,
            ACTION_TYPES.SONG_DELETE,
            ids.length,
            `批量删除歌曲ID: ${ids.join(', ')}`,
            req
        );
        
        res.json(response.success({ deletedCount: ids.length }, `成功删除 ${ids.length} 首歌曲`));
    } catch (err) {
        log.error('批量删除歌曲失败:', err);
        res.status(500).json(response.error(500, '批量删除失败'));
    }
};

const batchUpdateStatus = async (req, res) => {
    try {
        const { ids, status } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json(response.error(1001, '请选择要操作的歌曲'));
        }
        
        if (status === undefined || ![0, 1].includes(parseInt(status))) {
            return res.status(400).json(response.error(1001, '状态值无效'));
        }
        
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(
            `UPDATE song_table SET status = ?, update_time = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            [parseInt(status), ...ids]
        );
        
        const action = status === 0 ? '上架' : '下架';
        await operationLog.logBatchOperation(
            req.admin,
            status === 0 ? '批量上架歌曲' : '批量下架歌曲',
            ids.length,
            `批量${action}歌曲ID: ${ids.join(', ')}`,
            req
        );
        
        res.json(response.success({ updatedCount: ids.length }, `成功${action} ${ids.length} 首歌曲`));
    } catch (err) {
        log.error('批量更新状态失败:', err);
        res.status(500).json(response.error(500, '批量操作失败'));
    }
};

const batchUpdateSongs = async (req, res) => {
    try {
        const { ids, data } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json(response.error(1001, '请选择要操作的歌曲'));
        }
        
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json(response.error(1001, '没有要更新的字段'));
        }
        
        const updateFields = [];
        const updateValues = [];
        
        const allowedFields = ['album_name', 'cover_url', 'duration'];
        
        Object.keys(data).forEach(key => {
            if (allowedFields.includes(key) && data[key] !== undefined) {
                updateFields.push(`${key} = ?`);
                updateValues.push(data[key]);
            }
        });
        
        if (updateFields.length === 0) {
            return res.status(400).json(response.error(1001, '没有有效的更新字段'));
        }
        
        updateFields.push('update_time = CURRENT_TIMESTAMP');
        
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(
            `UPDATE song_table SET ${updateFields.join(', ')} WHERE id IN (${placeholders})`,
            [...updateValues, ...ids]
        );
        
        await operationLog.logBatchOperation(
            req.admin,
            ACTION_TYPES.SONG_UPDATE,
            ids.length,
            `批量修改歌曲信息: ${JSON.stringify(data)}`,
            req
        );
        
        res.json(response.success({ updatedCount: ids.length }, `成功更新 ${ids.length} 首歌曲`));
    } catch (err) {
        log.error('批量更新歌曲失败:', err);
        res.status(500).json(response.error(500, '批量更新失败'));
    }
};

const importSongs = async (req, res) => {
    try {
        const { songs, conflictStrategy = 'skip' } = req.body;
        
        if (!songs || !Array.isArray(songs) || songs.length === 0) {
            return res.status(400).json(response.error(1001, '没有歌曲数据'));
        }
        
        let successCount = 0;
        let failCount = 0;
        let updateCount = 0;
        const errors = [];
        
        for (const song of songs) {
            try {
                if (!song.name || !song.singer) {
                    errors.push(`缺少必填字段: ${song.name || song.singer || '未知'}`);
                    failCount++;
                    continue;
                }
                
                const existing = await db.getAsync(
                    'SELECT id FROM song_table WHERE name = ? AND singer = ?',
                    [song.name, song.singer]
                );
                
                if (existing) {
                    if (conflictStrategy === 'skip') {
                        failCount++;
                        continue;
                    } else if (conflictStrategy === 'update') {
                        await db.runAsync(
                            `UPDATE song_table SET 
                                album_name = COALESCE(?, album_name),
                                cover_url = COALESCE(?, cover_url),
                                duration = COALESCE(?, duration),
                                update_time = CURRENT_TIMESTAMP
                            WHERE id = ?`,
                            [song.album_name || null, song.cover_url || null, song.duration || null, existing.id]
                        );
                        updateCount++;
                        continue;
                    } else if (conflictStrategy === 'error') {
                        errors.push(`歌曲已存在: ${song.name} - ${song.singer}`);
                        failCount++;
                        continue;
                    }
                }
                
                await db.runAsync(
                    `INSERT INTO song_table (name, singer, cover_url, album_name, duration, status)
                    VALUES (?, ?, ?, ?, ?, 0)`,
                    [song.name, song.singer, song.cover_url || null, song.album_name || null, song.duration || null]
                );
                successCount++;
            } catch (err) {
                errors.push(`导入失败: ${song.name || '未知'} - ${err.message}`);
                failCount++;
            }
        }
        
        await operationLog.logBatchOperation(
            req.admin,
            '导入歌曲',
            successCount + updateCount,
            `导入歌曲: 新增${successCount}首, 更新${updateCount}首, 失败${failCount}首`,
            req
        );
        
        res.json(response.success({
            successCount,
            updateCount,
            failCount,
            errors: errors.slice(0, 10)
        }, `导入完成: 新增${successCount}首, 更新${updateCount}首, 失败${failCount}首`));
    } catch (err) {
        log.error('导入歌曲失败:', err);
        res.status(500).json(response.error(500, '导入失败'));
    }
};

const exportSongs = async (req, res) => {
    try {
        const { ids, status, keyword } = req.query;
        
        let sql = 'SELECT * FROM song_table WHERE 1=1';
        const params = [];
        
        if (ids) {
            const idList = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            if (idList.length > 0) {
                const placeholders = idList.map(() => '?').join(',');
                sql += ` AND id IN (${placeholders})`;
                params.push(...idList);
            }
        }
        
        if (status !== undefined) {
            sql += ' AND status = ?';
            params.push(parseInt(status));
        }
        
        if (keyword) {
            sql += ' AND (name LIKE ? OR singer LIKE ? OR album_name LIKE ?)';
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword, likeKeyword);
        }
        
        sql += ' ORDER BY create_time DESC';
        
        const list = await db.allAsync(sql, params);
        
        const exportData = list.map(song => ({
            歌曲名称: song.name || '',
            歌手: song.singer || '',
            专辑: song.album_name || '',
            封面URL: song.cover_url || '',
            时长: song.duration || '',
            播放次数: song.play_count || 0,
            状态: song.status === 0 ? '已上架' : '已下架',
            创建时间: song.create_time
        }));
        
        await operationLog.logBatchOperation(
            req.admin,
            '导出歌曲',
            list.length,
            `导出歌曲 ${list.length} 首`,
            req
        );
        
        res.json(response.success(exportData));
    } catch (err) {
        log.error('导出歌曲失败:', err);
        res.status(500).json(response.error(500, '导出失败'));
    }
};

module.exports = {
    searchSongs,
    getSongList,
    getHotSongs,
    getNewSongs,
    getSongDetail,
    addSong,
    updateSong,
    deleteSong,
    updateSongStatus,
    batchAddSongs,
    batchDeleteSongs,
    batchUpdateStatus,
    batchUpdateSongs,
    importSongs,
    exportSongs
};
