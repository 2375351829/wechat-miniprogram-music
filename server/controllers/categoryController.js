const db = require('../config/db-sqlite');
const response = require('../utils/response');
const log = require('../utils/logger');

const getCategories = async (req, res) => {
    try {
        const categories = await db.allAsync(
            'SELECT id, name, sort, status FROM song_category_table WHERE status = 0 ORDER BY sort ASC'
        );
        res.json(response.success(categories));
    } catch (err) {
        log.error('获取分类列表失败:', err);
        res.status(500).json(response.error(500, '获取分类列表失败'));
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await db.allAsync(
            'SELECT * FROM song_category_table ORDER BY sort ASC'
        );
        res.json(response.success(categories));
    } catch (err) {
        log.error('获取全部分类失败:', err);
        res.status(500).json(response.error(500, '获取分类失败'));
    }
};

const addCategory = async (req, res) => {
    try {
        const { name, sort = 0 } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json(response.error(1001, '分类名称不能为空'));
        }
        
        const existing = await db.getAsync(
            'SELECT id FROM song_category_table WHERE name = ?',
            [name.trim()]
        );
        
        if (existing) {
            return res.status(400).json(response.error(1002, '分类名称已存在'));
        }
        
        const result = await db.runAsync(
            'INSERT INTO song_category_table (name, sort) VALUES (?, ?)',
            [name.trim(), sort]
        );
        
        const category = await db.getAsync('SELECT * FROM song_category_table WHERE id = ?', [result.id]);
        res.json(response.success(category, '添加成功'));
    } catch (err) {
        log.error('添加分类失败:', err);
        res.status(500).json(response.error(500, '添加失败'));
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, sort, status } = req.body;
        
        const category = await db.getAsync('SELECT * FROM song_category_table WHERE id = ?', [id]);
        if (!category) {
            return res.status(404).json(response.error(3001, '分类不存在'));
        }
        
        const updateFields = [];
        const updateValues = [];
        
        if (name !== undefined) {
            const existing = await db.getAsync(
                'SELECT id FROM song_category_table WHERE name = ? AND id != ?',
                [name.trim(), id]
            );
            if (existing) {
                return res.status(400).json(response.error(1002, '分类名称已存在'));
            }
            updateFields.push('name = ?');
            updateValues.push(name.trim());
        }
        if (sort !== undefined) {
            updateFields.push('sort = ?');
            updateValues.push(sort);
        }
        if (status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(status);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json(response.error(1001, '没有要更新的字段'));
        }
        
        updateFields.push('update_time = CURRENT_TIMESTAMP');
        updateValues.push(id);
        
        await db.runAsync(
            `UPDATE song_category_table SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        
        const updatedCategory = await db.getAsync('SELECT * FROM song_category_table WHERE id = ?', [id]);
        res.json(response.success(updatedCategory, '更新成功'));
    } catch (err) {
        log.error('更新分类失败:', err);
        res.status(500).json(response.error(500, '更新失败'));
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const songsCount = await db.getAsync(
            'SELECT COUNT(*) as count FROM song_table WHERE category_id = ?',
            [id]
        );
        
        if (songsCount && songsCount.count > 0) {
            return res.status(400).json(response.error(1003, `该分类下有 ${songsCount.count} 首歌曲，无法删除`));
        }
        
        await db.runAsync('DELETE FROM song_category_table WHERE id = ?', [id]);
        res.json(response.success(null, '删除成功'));
    } catch (err) {
        log.error('删除分类失败:', err);
        res.status(500).json(response.error(500, '删除失败'));
    }
};

module.exports = {
    getCategories,
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory
};
