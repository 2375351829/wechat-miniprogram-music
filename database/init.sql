-- 校园广播点歌系统初始化数据
-- 版本: v2.2
-- 最后更新: 2026年2月

-- 插入音乐平台数据（使用INSERT OR IGNORE防止重复）
-- INSERT OR IGNORE INTO platform_table (platform_code, platform_name, status) VALUES 
-- ('netease', '网易云音乐', 0),
-- ('qq', 'QQ音乐', 0),
-- ('kugou', '酷狗音乐', 0),
-- ('kuwo', '酷我音乐', 0),
-- ('migu', '咪咕音乐', 0),
-- ('local', '本地文件', 0);

-- -- 插入默认管理员账号（密码: admin123，使用bcrypt加密）
-- INSERT OR IGNORE INTO admin_table (username, password, real_name, role, status) VALUES 
-- ('admin', '$2a$10$R2mrwx.HNfJiBS268Q340ulAmjI1bFsMQUb7VnOlQ5dry83e3DsoW', '系统管理员', 'super_admin', 0);

-- -- 插入示例歌曲数据（使用INSERT OR IGNORE防止重复）
-- INSERT OR IGNORE INTO song_table (name, singer, album_name, cover_url, duration, play_count, status, platform_id) VALUES 
-- ('晴天', '周杰伦', '叶惠美', 'https://p2.music.126.net/vZlfHKQjjdOMW6jvb3wKxQ==/109951166234056141.jpg', 269, 1500, 0, 1),
-- ('七里香', '周杰伦', '七里香', 'https://p1.music.126.net/G8LXPevdJxAy1N5VxHKlTg==/109951166234055641.jpg', 299, 1200, 0, 1),
-- ('稻香', '周杰伦', '魔杰座', 'https://p2.music.126.net/L8G4i0ngMJmUdFvGT9HUaw==/109951166234055431.jpg', 223, 1000, 0, 1),
-- ('告白气球', '周杰伦', '周杰伦的床边故事', 'https://p1.music.126.net/Jy9FdaQ9pBPzZKvLXqnyfA==/109951166234055421.jpg', 215, 980, 0, 1),
-- ('起风了', '买辣椒也用券', '起风了', 'https://p1.music.126.net/diGAyEmpcpzmKBoShHAYNg==/109951163720193039.jpg', 325, 850, 0, 1),
-- ('光年之外', '邓紫棋', '光年之外', 'https://p1.music.126.net/kn6ugBbi8E8tEIEr4j7jxw==/109951168223241545.jpg', 235, 780, 0, 1),
-- ('平凡之路', '朴树', '猎户星座', 'https://p1.music.126.net/qRI8KPF6LcL8jB2G8rZjZw==/1364494838762764.jpg', 298, 720, 0, 1),
-- ('夜曲', '周杰伦', '十一月的萧邦', 'https://p1.music.126.net/sGmL0MOPpqIbSfXv_PpKhg==/109951167892067540.jpg', 226, 680, 0, 1),
-- ('小幸运', '田馥甄', '小幸运', 'https://p1.music.126.net/vZ7JZjWwPcC8MwYjJgC9pA==/109951164057554129.jpg', 294, 650, 0, 1),
-- ('后来', '刘若英', '我等你', 'https://p1.music.126.net/6y4cVrVlMrCTHwP8eXV6RA==/18721479592869869.jpg', 356, 620, 0, 1);

-- -- 插入轮播图数据（使用INSERT OR IGNORE防止重复）
-- INSERT OR IGNORE INTO banner_table (title, image_url, link_url, sort, status) VALUES 
-- ('欢迎使用校园点歌台', 'https://img.zcool.cn/community/01e8d95e3a6f95a801213f26c19c18.jpg@1280w_1l_2o_100sh.jpg', '', 1, 0),
-- ('点歌送祝福，传递温暖', 'https://img.zcool.cn/community/016c7a5e3a6f95a801213f269fb7f1.jpg@1280w_1l_2o_100sh.jpg', '', 2, 0);

-- -- 插入公告数据（使用INSERT OR IGNORE防止重复）
-- INSERT OR IGNORE INTO announcement_table (title, content, is_pinned, status) VALUES 
-- ('欢迎使用校园广播点歌系统', '亲爱的同学们，欢迎使用校园广播点歌系统！在这里，你可以为朋友点歌送祝福，让校园广播成为传递温暖的桥梁。', 1, 0),
-- ('点歌规则说明', '每位同学每天最多可点歌3次，点歌内容需经过管理员审核后才能播放。请文明点歌，传递正能量！', 0, 0);

-- 插入首页配置（使用INSERT OR IGNORE防止重复）
INSERT OR IGNORE INTO homepage_config_table (id, show_banners, show_announcements, show_hot_songs, show_new_songs, show_recommend_songs, banner_count, banner_auto_play, banner_interval, announcement_count, hot_song_count, new_song_count, recommend_song_count) VALUES 
(1, 1, 1, 1, 1, 1, 5, 1, 3000, 3, 10, 10, 6);

-- 插入当前播放表初始数据（必须有id=1的记录）
INSERT OR IGNORE INTO current_play_table (id, request_id, blessing_id, type, song_name, singer, requester_name, play_start_time, play_end_time, operator_id) VALUES 
(1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- 插入推荐歌曲（使用INSERT OR IGNORE防止重复）
INSERT OR IGNORE INTO recommend_song_table (song_id, sort) VALUES 
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- -- 插入敏感词（示例，使用INSERT OR IGNORE防止重复）
-- INSERT OR IGNORE INTO sensitive_word_table (word, category, level) VALUES 
-- ('测试敏感词', '其他', 3);

-- 插入祝福类型说明（作为参考，实际存储在代码中）
-- 0: 生日祝福
-- 1: 节日祝福
-- 2: 毕业祝福
-- 3: 表白祝福
-- 4: 友情祝福
-- 5: 其他
