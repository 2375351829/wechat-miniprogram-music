-- 添加首页配置表的数量字段
-- 执行日期: 2026年2月

-- 添加新字段（如果不存在）
ALTER TABLE homepage_config_table ADD COLUMN banner_count INTEGER DEFAULT 5;
ALTER TABLE homepage_config_table ADD COLUMN banner_auto_play INTEGER DEFAULT 1;
ALTER TABLE homepage_config_table ADD COLUMN banner_interval INTEGER DEFAULT 3000;
ALTER TABLE homepage_config_table ADD COLUMN announcement_count INTEGER DEFAULT 3;
ALTER TABLE homepage_config_table ADD COLUMN hot_song_count INTEGER DEFAULT 10;
ALTER TABLE homepage_config_table ADD COLUMN new_song_count INTEGER DEFAULT 10;
ALTER TABLE homepage_config_table ADD COLUMN recommend_song_count INTEGER DEFAULT 6;

-- 更新现有记录的默认值
UPDATE homepage_config_table SET 
    banner_count = 5,
    banner_auto_play = 1,
    banner_interval = 3000,
    announcement_count = 3,
    hot_song_count = 10,
    new_song_count = 10,
    recommend_song_count = 6
WHERE id = 1;
