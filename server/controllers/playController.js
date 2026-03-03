const db = require('../config/db-sqlite');
const response = require('../utils/response');
const log = require('../utils/logger');
const { operationLog, ACTION_TYPES } = require('../utils/operationLog');

const getPlayDisplay = async (req, res) => {
    try {
        const currentPlaying = await db.getAsync(
            `SELECT cp.*, r.song_id, r.message as blessing, r.receiver,
                u.nickname as requester_name, u.class_name as requester_class,
                s.cover_url, s.album_name, s.duration, s.music_url
            FROM current_play_table cp 
            LEFT JOIN request_table r ON cp.request_id = r.id 
            LEFT JOIN user_table u ON r.user_id = u.id 
            LEFT JOIN song_table s ON r.song_id = s.id
            WHERE cp.id = 1 AND cp.request_id IS NOT NULL`
        );
        
        const nextSong = await db.getAsync(
            `SELECT r.id as requestId, r.song_name, r.singer, r.message as blessing, r.receiver, 
                u.nickname as requesterName, u.class_name as requesterClass,
                s.cover_url as coverUrl, s.album_name as albumName, s.duration, s.music_url as musicUrl
            FROM request_table r 
            LEFT JOIN user_table u ON r.user_id = u.id 
            LEFT JOIN song_table s ON r.song_id = s.id
            WHERE r.status = 1 
            ORDER BY r.update_time ASC 
            LIMIT 1`
        );
        
        const historySongs = await db.allAsync(
            `SELECT r.id as requestId, r.song_name, r.singer, r.message as blessing, r.receiver, 
                r.update_time as playTime, u.nickname as requesterName, u.class_name as requesterClass,
                s.cover_url as coverUrl, s.album_name as albumName, s.duration, s.music_url as musicUrl
            FROM request_table r 
            LEFT JOIN user_table u ON r.user_id = u.id 
            LEFT JOIN song_table s ON r.song_id = s.id
            WHERE r.status = 3 
            ORDER BY r.update_time DESC 
            LIMIT 10`
        );
        
        const queueCount = await db.getAsync(
            'SELECT COUNT(*) as count FROM request_table WHERE status = 1'
        );
        
        res.json(response.success({
            currentPlaying: currentPlaying ? {
                requestId: currentPlaying.request_id,
                songName: currentPlaying.song_name,
                singer: currentPlaying.singer,
                receiver: currentPlaying.receiver,
                blessing: currentPlaying.blessing,
                requesterName: currentPlaying.requester_name,
                requesterClass: currentPlaying.requester_class,
                coverUrl: currentPlaying.cover_url,
                albumName: currentPlaying.album_name,
                duration: currentPlaying.duration,
                musicUrl: currentPlaying.music_url,
                playStartTime: currentPlaying.play_start_time
            } : null,
            nextSong,
            historySongs,
            queueCount: queueCount?.count || 0
        }));
    } catch (err) {
        log.error('获取播放显示数据失败:', err);
        res.status(500).json(response.error(500, '获取数据失败'));
    }
};

const getPlayQueue = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, sortBy = 'update_time', sortOrder = 'asc' } = req.query;
        const offset = (page - 1) * pageSize;
        
        const countResult = await db.getAsync(
            'SELECT COUNT(*) as total FROM request_table WHERE status = 1'
        );
        
        const allowedSortFields = {
            'update_time': 'r.update_time',
            'song_name': 'r.song_name',
            'singer': 'r.singer',
            'requester': 'u.nickname'
        };
        
        const sortField = allowedSortFields[sortBy] || 'r.update_time';
        const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        
        const list = await db.allAsync(
            `SELECT r.id as requestId, r.song_name, r.singer, r.message as blessing, r.receiver, 
                r.update_time as updateTime, r.create_time as createTime,
                u.nickname as requesterName, u.class_name as requesterClass,
                s.cover_url as coverUrl, s.album_name as albumName, s.duration, s.music_url as musicUrl
            FROM request_table r 
            LEFT JOIN user_table u ON r.user_id = u.id 
            LEFT JOIN song_table s ON r.song_id = s.id
            WHERE r.status = 1 
            ORDER BY ${sortField} ${order}
            LIMIT ? OFFSET ?`,
            [parseInt(pageSize), parseInt(offset)]
        );
        
        res.json(response.success(response.paginate(list, countResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取播放队列失败:', err);
        res.status(500).json(response.error(500, '获取队列失败'));
    }
};

const getPlayHistory = async (req, res) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const offset = (page - 1) * pageSize;
        
        const countResult = await db.getAsync(
            'SELECT COUNT(*) as total FROM request_table WHERE status = 3'
        );
        
        const list = await db.allAsync(
            `SELECT r.id as requestId, r.song_name, r.singer, r.message as blessing, r.receiver, 
                r.update_time as playTime, r.create_time as createTime,
                u.nickname as requesterName, u.class_name as requesterClass,
                s.cover_url as coverUrl, s.album_name as albumName, s.duration, s.music_url as musicUrl
            FROM request_table r 
            LEFT JOIN user_table u ON r.user_id = u.id 
            LEFT JOIN song_table s ON r.song_id = s.id
            WHERE r.status = 3 
            ORDER BY r.update_time DESC 
            LIMIT ? OFFSET ?`,
            [parseInt(pageSize), parseInt(offset)]
        );
        
        res.json(response.success(response.paginate(list, countResult?.total || 0, page, pageSize)));
    } catch (err) {
        log.error('获取播放历史失败:', err);
        res.status(500).json(response.error(500, '获取历史失败'));
    }
};

const playNext = async (req, res) => {
    try {
        const adminId = req.admin.id;
        
        const currentPlay = await db.getAsync(
            'SELECT * FROM current_play_table WHERE id = 1 AND request_id IS NOT NULL'
        );
        
        if (currentPlay) {
            return res.status(400).json(response.error(1002, '当前有歌曲正在播放，请先结束当前播放'));
        }
        
        const nextRequest = await db.getAsync(
            `SELECT r.*, u.nickname as requester_name, u.class_name as requester_class,
                s.cover_url, s.album_name, s.duration, s.music_url
            FROM request_table r 
            LEFT JOIN user_table u ON r.user_id = u.id 
            LEFT JOIN song_table s ON r.song_id = s.id
            WHERE r.status = 1 
            ORDER BY r.update_time ASC 
            LIMIT 1`
        );
        
        if (!nextRequest) {
            return res.status(400).json(response.error(1003, '播放队列为空'));
        }
        
        await db.runAsync(
            `UPDATE current_play_table SET 
                request_id = ?, 
                song_name = ?, 
                singer = ?, 
                requester_name = ?, 
                play_start_time = CURRENT_TIMESTAMP, 
                operator_id = ? 
            WHERE id = 1`,
            [nextRequest.id, nextRequest.song_name, nextRequest.singer, nextRequest.requester_name, adminId]
        );
        
        await db.runAsync(
            'UPDATE request_table SET status = 2, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [nextRequest.id]
        );
        
        await operationLog.logUserOperation(
            req.admin,
            '开始播放歌曲',
            nextRequest.id,
            `开始播放: ${nextRequest.song_name} - ${nextRequest.singer}`,
            req
        );
        
        log.info(`开始播放: ${nextRequest.song_name} - ${nextRequest.singer}`);
        
        res.json(response.success({
            message: '开始播放',
            currentPlaying: {
                requestId: nextRequest.id,
                songName: nextRequest.song_name,
                singer: nextRequest.singer,
                receiver: nextRequest.receiver,
                blessing: nextRequest.message,
                requesterName: nextRequest.requester_name,
                requesterClass: nextRequest.requester_class,
                coverUrl: nextRequest.cover_url,
                albumName: nextRequest.album_name,
                duration: nextRequest.duration,
                musicUrl: nextRequest.music_url
            }
        }, '开始播放'));
    } catch (err) {
        log.error('播放下一首失败:', err);
        res.status(500).json(response.error(500, '播放失败'));
    }
};

const stopPlay = async (req, res) => {
    try {
        const currentPlay = await db.getAsync(
            'SELECT * FROM current_play_table WHERE id = 1 AND request_id IS NOT NULL'
        );
        
        if (!currentPlay) {
            return res.status(400).json(response.error(1002, '当前没有正在播放的歌曲'));
        }
        
        const requestId = currentPlay.request_id;
        
        await db.runAsync(
            `UPDATE current_play_table SET 
                request_id = NULL, 
                song_name = NULL, 
                singer = NULL, 
                requester_name = NULL, 
                play_end_time = CURRENT_TIMESTAMP 
            WHERE id = 1`
        );
        
        await db.runAsync(
            'UPDATE request_table SET status = 3, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [requestId]
        );
        
        await operationLog.logUserOperation(
            req.admin,
            '结束播放',
            requestId,
            `结束播放: ${currentPlay.song_name} - ${currentPlay.singer}`,
            req
        );
        
        log.info(`结束播放: ${currentPlay.song_name} - ${currentPlay.singer}`);
        
        res.json(response.success({ message: '播放已结束' }, '播放已结束'));
    } catch (err) {
        log.error('停止播放失败:', err);
        res.status(500).json(response.error(500, '停止失败'));
    }
};

const updatePlayOrder = async (req, res) => {
    try {
        const { orders } = req.body;
        
        if (!orders || !Array.isArray(orders)) {
            return res.status(400).json(response.error(1001, '请提供播放顺序'));
        }
        
        const now = new Date();
        for (let i = 0; i < orders.length; i++) {
            const orderTime = new Date(now.getTime() + i * 1000);
            await db.runAsync(
                'UPDATE request_table SET update_time = ? WHERE id = ?',
                [orderTime.toISOString(), orders[i].id]
            );
        }
        
        await operationLog.logBatchOperation(
            req.admin,
            '调整播放顺序',
            orders.length,
            `调整了 ${orders.length} 首歌曲的播放顺序`,
            req
        );
        
        res.json(response.success({ message: '播放顺序已更新' }, '播放顺序已更新'));
    } catch (err) {
        log.error('更新播放顺序失败:', err);
        res.status(500).json(response.error(500, '更新顺序失败'));
    }
};

const addSongToQueue = async (req, res) => {
    try {
        const { songId } = req.body;
        
        if (!songId) {
            return res.status(400).json(response.error(1001, '请选择歌曲'));
        }
        
        const song = await db.getAsync(
            'SELECT * FROM song_table WHERE id = ? AND status = 0',
            [songId]
        );
        
        if (!song) {
            return res.status(404).json(response.error(3001, '歌曲不存在或已下架'));
        }
        
        const result = await db.runAsync(
            `INSERT INTO request_table (user_id, song_id, song_name, singer, status, create_time, update_time)
             VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [0, song.id, song.name, song.singer]
        );
        
        await operationLog.logUserOperation(
            req.admin,
            '添加歌曲到队列',
            result.id,
            `添加: ${song.name} - ${song.singer}`,
            req
        );
        
        log.info(`添加歌曲到播放队列: ${song.name} - ${song.singer}`);
        
        res.json(response.success({
            requestId: result.id,
            songName: song.name,
            singer: song.singer
        }, '已添加到播放队列'));
    } catch (err) {
        log.error('添加歌曲到队列失败:', err);
        res.status(500).json(response.error(500, '添加失败'));
    }
};

const removeFromQueue = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = await db.getAsync(
            'SELECT * FROM request_table WHERE id = ? AND status = 1',
            [id]
        );
        
        if (!request) {
            return res.status(404).json(response.error(4001, '歌曲不在播放队列中'));
        }
        
        await db.runAsync(
            'UPDATE request_table SET status = 4, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        
        await operationLog.logUserOperation(
            req.admin,
            '从队列移除歌曲',
            id,
            `移除: ${request.song_name} - ${request.singer}`,
            req
        );
        
        res.json(response.success(null, '已从队列移除'));
    } catch (err) {
        log.error('从队列移除失败:', err);
        res.status(500).json(response.error(500, '移除失败'));
    }
};

const deleteHistory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const request = await db.getAsync(
            'SELECT * FROM request_table WHERE id = ? AND status = 3',
            [id]
        );
        
        if (!request) {
            return res.status(404).json(response.error(4001, '播放记录不存在'));
        }
        
        await db.runAsync('DELETE FROM request_table WHERE id = ?', [id]);
        
        await operationLog.logUserOperation(
            req.admin,
            '删除播放历史',
            id,
            `删除: ${request.song_name} - ${request.singer}`,
            req
        );
        
        res.json(response.success(null, '删除成功'));
    } catch (err) {
        log.error('删除播放历史失败:', err);
        res.status(500).json(response.error(500, '删除失败'));
    }
};

const batchDeleteHistory = async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json(response.error(1001, '请选择要删除的记录'));
        }
        
        const placeholders = ids.map(() => '?').join(',');
        await db.runAsync(
            `DELETE FROM request_table WHERE id IN (${placeholders}) AND status = 3`,
            ids
        );
        
        await operationLog.logBatchOperation(
            req.admin,
            '批量删除播放历史',
            ids.length,
            `批量删除 ${ids.length} 条播放记录`,
            req
        );
        
        res.json(response.success({ deletedCount: ids.length }, `成功删除 ${ids.length} 条记录`));
    } catch (err) {
        log.error('批量删除播放历史失败:', err);
        res.status(500).json(response.error(500, '批量删除失败'));
    }
};

const updateHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { song_name, singer, message, receiver } = req.body;
        
        const request = await db.getAsync(
            'SELECT * FROM request_table WHERE id = ? AND status = 3',
            [id]
        );
        
        if (!request) {
            return res.status(404).json(response.error(4001, '播放记录不存在'));
        }
        
        const updateFields = [];
        const updateValues = [];
        
        if (song_name !== undefined) {
            updateFields.push('song_name = ?');
            updateValues.push(song_name);
        }
        if (singer !== undefined) {
            updateFields.push('singer = ?');
            updateValues.push(singer);
        }
        if (message !== undefined) {
            updateFields.push('message = ?');
            updateValues.push(message);
        }
        if (receiver !== undefined) {
            updateFields.push('receiver = ?');
            updateValues.push(receiver);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json(response.error(1001, '没有要更新的字段'));
        }
        
        updateFields.push('update_time = CURRENT_TIMESTAMP');
        updateValues.push(id);
        
        await db.runAsync(
            `UPDATE request_table SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        
        await operationLog.logUserOperation(
            req.admin,
            '编辑播放历史',
            id,
            `编辑: ${song_name || request.song_name}`,
            req
        );
        
        res.json(response.success(null, '更新成功'));
    } catch (err) {
        log.error('更新播放历史失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const getPlayStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const todayPlayed = await db.getAsync(
            `SELECT COUNT(*) as count FROM request_table 
            WHERE status = 3 AND date(update_time) = ?`,
            [today]
        );
        
        const todayPending = await db.getAsync(
            `SELECT COUNT(*) as count FROM request_table 
            WHERE status = 0 AND date(create_time) = ?`,
            [today]
        );
        
        const queueCount = await db.getAsync(
            'SELECT COUNT(*) as count FROM request_table WHERE status = 1'
        );
        
        const currentPlaying = await db.getAsync(
            'SELECT * FROM current_play_table WHERE id = 1 AND request_id IS NOT NULL'
        );
        
        const totalPlayed = await db.getAsync(
            `SELECT COUNT(*) as count FROM request_table WHERE status = 3`
        );
        
        res.json(response.success({
            todayPlayed: todayPlayed?.count || 0,
            todayPending: todayPending?.count || 0,
            queueCount: queueCount?.count || 0,
            totalPlayed: totalPlayed?.count || 0,
            currentPlaying: currentPlaying ? {
                songName: currentPlaying.song_name,
                singer: currentPlaying.singer,
                requesterName: currentPlaying.requester_name
            } : null
        }));
    } catch (err) {
        log.error('获取播放统计失败:', err);
        res.status(500).json(response.error(500, '获取统计失败'));
    }
};

const togglePlay = async (req, res) => {
    try {
        const { action } = req.body;
        const adminId = req.admin.id;
        
        const currentPlay = await db.getAsync(
            'SELECT * FROM current_play_table WHERE id = 1'
        );
        
        if (!currentPlay || !currentPlay.request_id) {
            return res.status(400).json(response.error(1002, '当前没有正在播放的歌曲'));
        }
        
        const isPaused = currentPlay.is_paused === 1;
        const newStatus = action === 'pause' ? 1 : 0;
        
        if (action === 'pause' && !isPaused) {
            await db.runAsync(
                `UPDATE current_play_table SET 
                    is_paused = 1,
                    pause_time = CURRENT_TIMESTAMP,
                    operator_id = ?
                WHERE id = 1`,
                [adminId]
            );
            
            log.info(`播放已暂停：${currentPlay.song_name}`);
            res.json(response.success({ isPaused: true }, '已暂停播放'));
        } else if (action === 'resume' && isPaused) {
            await db.runAsync(
                `UPDATE current_play_table SET 
                    is_paused = 0,
                    resume_time = CURRENT_TIMESTAMP,
                    operator_id = ?
                WHERE id = 1`,
                [adminId]
            );
            
            log.info(`播放已恢复：${currentPlay.song_name}`);
            res.json(response.success({ isPaused: false }, '已恢复播放'));
        } else {
            res.json(response.success({ isPaused }, '状态未改变'));
        }
    } catch (err) {
        log.error('切换播放状态失败:', err);
        res.status(500).json(response.error(500, '操作失败'));
    }
};

const updatePlayProgress = async (req, res) => {
    try {
        const { currentTime, duration } = req.body;
        const adminId = req.admin.id;
        
        if (currentTime === undefined || duration === undefined) {
            return res.status(400).json(response.error(1001, '请提供当前时间和总时长'));
        }
        
        await db.runAsync(
            `UPDATE current_play_table SET 
                current_time = ?,
                duration = ?,
                update_time = CURRENT_TIMESTAMP,
                operator_id = ?
            WHERE id = 1`,
            [parseFloat(currentTime), parseFloat(duration), adminId]
        );
        
        res.json(response.success(null, '进度已更新'));
    } catch (err) {
        log.error('更新播放进度失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const updateVolume = async (req, res) => {
    try {
        const { volume } = req.body;
        const adminId = req.admin.id;
        
        if (volume === undefined || volume < 0 || volume > 100) {
            return res.status(400).json(response.error(1001, '音量值必须在 0-100 之间'));
        }
        
        await db.runAsync(
            `UPDATE current_play_table SET 
                volume = ?,
                update_time = CURRENT_TIMESTAMP,
                operator_id = ?
            WHERE id = 1`,
            [parseInt(volume), adminId]
        );
        
        log.info(`音量已更新：${volume}%`);
        res.json(response.success({ volume }, '音量已更新'));
    } catch (err) {
        log.error('更新音量失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const setPlayMode = async (req, res) => {
    try {
        const { mode } = req.body;
        const adminId = req.admin.id;
        
        const validModes = ['single', 'list', 'random', 'shuffle'];
        if (!mode || !validModes.includes(mode)) {
            return res.status(400).json(response.error(1001, '无效的播放模式'));
        }
        
        await db.runAsync(
            `UPDATE current_play_table SET 
                play_mode = ?,
                update_time = CURRENT_TIMESTAMP,
                operator_id = ?
            WHERE id = 1`,
            [mode, adminId]
        );
        
        log.info(`播放模式已更新：${mode}`);
        res.json(response.success({ mode }, '播放模式已更新'));
    } catch (err) {
        log.error('更新播放模式失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const getPlayStatus = async (req, res) => {
    try {
        const currentPlay = await db.getAsync(
            `SELECT cp.*, r.song_id, r.message as blessing, r.receiver,
                u.nickname as requester_name, u.class_name as requester_class,
                s.cover_url, s.album_name, s.duration, s.music_url
            FROM current_play_table cp 
            LEFT JOIN request_table r ON cp.request_id = r.id 
            LEFT JOIN user_table u ON r.user_id = u.id 
            LEFT JOIN song_table s ON r.song_id = s.id
            WHERE cp.id = 1`
        );
        
        if (!currentPlay || !currentPlay.request_id) {
            return res.json(response.success({
                isPlaying: false,
                isPaused: false,
                currentSong: null,
                progress: { currentTime: 0, duration: 0 },
                volume: 50,
                mode: 'list'
            }));
        }
        
        res.json(response.success({
            isPlaying: true,
            isPaused: currentPlay.is_paused === 1,
            currentSong: {
                id: currentPlay.request_id,
                songId: currentPlay.song_id,
                songName: currentPlay.song_name,
                singer: currentPlay.singer,
                receiver: currentPlay.receiver,
                blessing: currentPlay.blessing,
                requesterName: currentPlay.requester_name,
                requesterClass: currentPlay.requester_class,
                coverUrl: currentPlay.cover_url,
                albumName: currentPlay.album_name,
                musicUrl: currentPlay.music_url
            },
            progress: {
                currentTime: currentPlay.current_time || 0,
                duration: currentPlay.duration || 0
            },
            volume: currentPlay.volume || 50,
            mode: currentPlay.play_mode || 'list',
            startTime: currentPlay.play_start_time,
            pauseTime: currentPlay.pause_time
        }));
    } catch (err) {
        log.error('获取播放状态失败:', err);
        res.status(500).json(response.error(500, '获取状态失败'));
    }
};

module.exports = {
    getPlayDisplay,
    getPlayQueue,
    getPlayHistory,
    playNext,
    stopPlay,
    updatePlayOrder,
    addSongToQueue,
    removeFromQueue,
    deleteHistory,
    batchDeleteHistory,
    updateHistory,
    getPlayStats,
    togglePlay,
    updatePlayProgress,
    updateVolume,
    setPlayMode,
    getPlayStatus
};
