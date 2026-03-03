const db = require('../config/db-sqlite');
const response = require('../utils/response');
const log = require('../utils/logger');

const getHomepageData = async (req, res) => {
    try {
        const config = await db.getAsync('SELECT * FROM homepage_config_table WHERE id = 1') || {
            show_banners: 1,
            show_announcements: 1,
            show_hot_songs: 1,
            show_new_songs: 1,
            show_recommend_songs: 1,
            banner_count: 5,
            banner_auto_play: 1,
            banner_interval: 3000,
            announcement_count: 3,
            hot_song_count: 10,
            new_song_count: 10,
            recommend_song_count: 6
        };
        
        const [banners, announcements, hotSongs, newSongs, recommendSongs] = await Promise.all([
            config.show_banners ? 
                db.allAsync('SELECT * FROM banner_table WHERE status = 0 ORDER BY sort ASC LIMIT ?', [config.banner_count]) : 
                [],
            config.show_announcements ? 
                db.allAsync('SELECT * FROM announcement_table WHERE status = 0 ORDER BY is_pinned DESC, create_time DESC LIMIT ?', [config.announcement_count]) : 
                [],
            config.show_hot_songs ? 
                db.allAsync('SELECT id, name, singer, cover_url, play_count FROM song_table WHERE status = 0 ORDER BY play_count DESC LIMIT ?', [config.hot_song_count]) : 
                [],
            config.show_new_songs ? 
                db.allAsync('SELECT id, name, singer, cover_url, create_time FROM song_table WHERE status = 0 ORDER BY create_time DESC LIMIT ?', [config.new_song_count]) : 
                [],
            config.show_recommend_songs ? 
                db.allAsync(`SELECT s.id, s.name, s.singer, s.cover_url FROM recommend_song_table r LEFT JOIN song_table s ON r.song_id = s.id WHERE s.status = 0 ORDER BY r.sort ASC LIMIT ?`, [config.recommend_song_count]) : 
                []
        ]);
        
        res.json(response.success({
            banners,
            announcements,
            hotSongs,
            newSongs,
            recommendSongs,
            config
        }));
    } catch (err) {
        log.error('获取首页数据失败:', err);
        res.status(500).json(response.error(500, '获取首页数据失败'));
    }
};

const getBanners = async (req, res) => {
    try {
        const banners = await db.allAsync('SELECT * FROM banner_table WHERE status = 0 ORDER BY sort ASC');
        res.json(response.success(banners));
    } catch (err) {
        log.error('获取轮播图失败:', err);
        res.status(500).json(response.error(500, '获取轮播图失败'));
    }
};

const getAnnouncements = async (req, res) => {
    try {
        const announcements = await db.allAsync('SELECT * FROM announcement_table WHERE status = 0 ORDER BY is_pinned DESC, create_time DESC');
        res.json(response.success(announcements));
    } catch (err) {
        log.error('获取公告失败:', err);
        res.status(500).json(response.error(500, '获取公告失败'));
    }
};

const getRecommendSongs = async (req, res) => {
    try {
        const songs = await db.allAsync(
            `SELECT s.id, s.name, s.singer, s.cover_url FROM recommend_song_table r LEFT JOIN song_table s ON r.song_id = s.id WHERE s.status = 0 ORDER BY r.sort ASC`
        );
        res.json(response.success(songs));
    } catch (err) {
        log.error('获取推荐歌曲失败:', err);
        res.status(500).json(response.error(500, '获取推荐歌曲失败'));
    }
};

const addBanner = async (req, res) => {
    try {
        const { title, image_url, link_url, sort } = req.body;
        
        if (!title || !image_url) {
            return res.status(400).json(response.error(1001, '标题和图片不能为空'));
        }
        
        const result = await db.runAsync(
            'INSERT INTO banner_table (title, image_url, link_url, sort) VALUES (?, ?, ?, ?)',
            [title, image_url, link_url || null, sort || 0]
        );
        
        const banner = await db.getAsync('SELECT * FROM banner_table WHERE id = ?', [result.id]);
        
        res.json(response.success(banner, '添加成功'));
    } catch (err) {
        log.error('添加轮播图失败:', err);
        res.status(500).json(response.error(500, '添加失败'));
    }
};

const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, image_url, link_url, sort } = req.body;
        
        const existing = await db.getAsync('SELECT * FROM banner_table WHERE id = ?', [id]);
        if (!existing) {
            return res.status(404).json(response.error(404, '轮播图不存在'));
        }
        
        const updateTitle = title !== undefined ? title : existing.title;
        const updateImageUrl = image_url !== undefined ? image_url : existing.image_url;
        const updateLinkUrl = link_url !== undefined ? link_url : existing.link_url;
        const updateSort = sort !== undefined ? sort : existing.sort;
        
        await db.runAsync(
            'UPDATE banner_table SET title = ?, image_url = ?, link_url = ?, sort = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [updateTitle, updateImageUrl, updateLinkUrl, updateSort, id]
        );
        
        res.json(response.success(null, '更新成功'));
    } catch (err) {
        log.error('更新轮播图失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.runAsync('DELETE FROM banner_table WHERE id = ?', [id]);
        
        res.json(response.success(null, '删除成功'));
    } catch (err) {
        log.error('删除轮播图失败:', err);
        res.status(500).json(response.error(500, '删除失败'));
    }
};

const addAnnouncement = async (req, res) => {
    try {
        const { title, content, is_pinned } = req.body;
        
        if (!title || !content) {
            return res.status(400).json(response.error(1001, '标题和内容不能为空'));
        }
        
        const result = await db.runAsync(
            'INSERT INTO announcement_table (title, content, is_pinned) VALUES (?, ?, ?)',
            [title, content, is_pinned ? 1 : 0]
        );
        
        const announcement = await db.getAsync('SELECT * FROM announcement_table WHERE id = ?', [result.id]);
        
        res.json(response.success(announcement, '添加成功'));
    } catch (err) {
        log.error('添加公告失败:', err);
        res.status(500).json(response.error(500, '添加失败'));
    }
};

const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, is_pinned } = req.body;
        
        await db.runAsync(
            'UPDATE announcement_table SET title = ?, content = ?, is_pinned = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content, is_pinned ? 1 : 0, id]
        );
        
        res.json(response.success(null, '更新成功'));
    } catch (err) {
        log.error('更新公告失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.runAsync('DELETE FROM announcement_table WHERE id = ?', [id]);
        
        res.json(response.success(null, '删除成功'));
    } catch (err) {
        log.error('删除公告失败:', err);
        res.status(500).json(response.error(500, '删除失败'));
    }
};

const addRecommendSong = async (req, res) => {
    try {
        const { song_id, sort } = req.body;
        
        if (!song_id) {
            return res.status(400).json(response.error(1001, '歌曲ID不能为空'));
        }
        
        const existing = await db.getAsync(
            'SELECT * FROM recommend_song_table WHERE song_id = ?',
            [song_id]
        );
        
        if (existing) {
            return res.status(400).json(response.error(1002, '该歌曲已在推荐列表中'));
        }
        
        const result = await db.runAsync(
            'INSERT INTO recommend_song_table (song_id, sort) VALUES (?, ?)',
            [song_id, sort || 0]
        );
        
        res.json(response.success({ id: result.id, song_id, sort }, '添加成功'));
    } catch (err) {
        log.error('添加推荐歌曲失败:', err);
        res.status(500).json(response.error(500, '添加失败'));
    }
};

const updateRecommendSong = async (req, res) => {
    try {
        const { id } = req.params;
        const { sort } = req.body;
        
        await db.runAsync(
            'UPDATE recommend_song_table SET sort = ? WHERE id = ?',
            [sort || 0, id]
        );
        
        res.json(response.success(null, '更新成功'));
    } catch (err) {
        log.error('更新推荐歌曲失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const deleteRecommendSong = async (req, res) => {
    try {
        const { id } = req.params;
        
        await db.runAsync('DELETE FROM recommend_song_table WHERE id = ?', [id]);
        
        res.json(response.success(null, '删除成功'));
    } catch (err) {
        log.error('删除推荐歌曲失败:', err);
        res.status(500).json(response.error(500, '删除失败'));
    }
};

const updateHomepageConfig = async (req, res) => {
    try {
        const { 
            show_banners, show_announcements, show_hot_songs, show_new_songs, show_recommend_songs,
            banner_count, banner_auto_play, banner_interval,
            announcement_count, hot_song_count, new_song_count, recommend_song_count
        } = req.body;
        
        const existing = await db.getAsync('SELECT * FROM homepage_config_table WHERE id = 1');
        
        if (existing) {
            const updateFields = [];
            const updateValues = [];
            
            if (show_banners !== undefined) {
                updateFields.push('show_banners = ?');
                updateValues.push(show_banners ? 1 : 0);
            }
            if (show_announcements !== undefined) {
                updateFields.push('show_announcements = ?');
                updateValues.push(show_announcements ? 1 : 0);
            }
            if (show_hot_songs !== undefined) {
                updateFields.push('show_hot_songs = ?');
                updateValues.push(show_hot_songs ? 1 : 0);
            }
            if (show_new_songs !== undefined) {
                updateFields.push('show_new_songs = ?');
                updateValues.push(show_new_songs ? 1 : 0);
            }
            if (show_recommend_songs !== undefined) {
                updateFields.push('show_recommend_songs = ?');
                updateValues.push(show_recommend_songs ? 1 : 0);
            }
            if (banner_count !== undefined) {
                updateFields.push('banner_count = ?');
                updateValues.push(parseInt(banner_count) || 5);
            }
            if (banner_auto_play !== undefined) {
                updateFields.push('banner_auto_play = ?');
                updateValues.push(banner_auto_play ? 1 : 0);
            }
            if (banner_interval !== undefined) {
                updateFields.push('banner_interval = ?');
                updateValues.push(parseInt(banner_interval) || 3000);
            }
            if (announcement_count !== undefined) {
                updateFields.push('announcement_count = ?');
                updateValues.push(parseInt(announcement_count) || 3);
            }
            if (hot_song_count !== undefined) {
                updateFields.push('hot_song_count = ?');
                updateValues.push(parseInt(hot_song_count) || 10);
            }
            if (new_song_count !== undefined) {
                updateFields.push('new_song_count = ?');
                updateValues.push(parseInt(new_song_count) || 10);
            }
            if (recommend_song_count !== undefined) {
                updateFields.push('recommend_song_count = ?');
                updateValues.push(parseInt(recommend_song_count) || 6);
            }
            
            if (updateFields.length > 0) {
                updateFields.push('update_time = CURRENT_TIMESTAMP');
                updateValues.push(1);
                
                await db.runAsync(
                    `UPDATE homepage_config_table SET ${updateFields.join(', ')} WHERE id = ?`,
                    updateValues
                );
            }
        } else {
            await db.runAsync(
                `INSERT INTO homepage_config_table (id, show_banners, show_announcements, show_hot_songs, show_new_songs, show_recommend_songs,
                    banner_count, banner_auto_play, banner_interval, announcement_count, hot_song_count, new_song_count, recommend_song_count) 
                VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    show_banners ? 1 : 0, show_announcements ? 1 : 0, show_hot_songs ? 1 : 0, show_new_songs ? 1 : 0, show_recommend_songs ? 1 : 0,
                    parseInt(banner_count) || 5, banner_auto_play ? 1 : 0, parseInt(banner_interval) || 3000,
                    parseInt(announcement_count) || 3, parseInt(hot_song_count) || 10, parseInt(new_song_count) || 10, parseInt(recommend_song_count) || 6
                ]
            );
        }
        
        res.json(response.success(null, '配置更新成功'));
    } catch (err) {
        log.error('更新首页配置失败:', err);
        res.status(500).json(response.error(500, '更新配置失败'));
    }
};

module.exports = {
    getHomepageData,
    getBanners,
    getAnnouncements,
    getRecommendSongs,
    addBanner,
    updateBanner,
    deleteBanner,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addRecommendSong,
    updateRecommendSong,
    deleteRecommendSong,
    updateHomepageConfig
};
