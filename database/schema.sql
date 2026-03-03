-- 校园广播点歌系统数据库表结构
-- 版本: v2.2
-- 最后更新: 2026年2月

-- 管理员表（先创建，因为其他表有外键引用）
CREATE TABLE IF NOT EXISTS admin_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(32) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(32),
    role VARCHAR(16) NOT NULL DEFAULT 'admin',
    status TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_time DATETIME,
    last_login_ip VARCHAR(45)
);

-- 用户表
CREATE TABLE IF NOT EXISTS user_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid VARCHAR(64) UNIQUE,
    student_id VARCHAR(20) UNIQUE,
    real_name VARCHAR(32),
    nickname VARCHAR(32) NOT NULL DEFAULT '微信用户',
    avatar_url VARCHAR(255),
    gender TINYINT NOT NULL DEFAULT 0,
    college VARCHAR(64),
    major VARCHAR(64),
    grade VARCHAR(16),
    class_name VARCHAR(32),
    counselor VARCHAR(32),
    enrollment_year VARCHAR(4),
    phone VARCHAR(16) UNIQUE,
    wechat_name VARCHAR(64),
    wechat_account VARCHAR(64),
    password VARCHAR(255),
    status TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_time DATETIME
);

CREATE INDEX IF NOT EXISTS idx_user_openid ON user_table(openid);
CREATE INDEX IF NOT EXISTS idx_user_student_id ON user_table(student_id);
CREATE INDEX IF NOT EXISTS idx_user_college ON user_table(college);
CREATE INDEX IF NOT EXISTS idx_user_major ON user_table(major);
CREATE INDEX IF NOT EXISTS idx_user_grade ON user_table(grade);
CREATE INDEX IF NOT EXISTS idx_user_enrollment_year ON user_table(enrollment_year);
CREATE INDEX IF NOT EXISTS idx_user_class_name ON user_table(class_name);

-- 音乐平台字典表
CREATE TABLE IF NOT EXISTS platform_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform_code VARCHAR(16) UNIQUE NOT NULL,
    platform_name VARCHAR(32) NOT NULL,
    status TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 歌曲表
CREATE TABLE IF NOT EXISTS song_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(64) NOT NULL,
    singer VARCHAR(64) NOT NULL,
    album_name VARCHAR(64),
    cover_url VARCHAR(255),
    duration INT,
    play_count BIGINT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 0,
    platform_id BIGINT,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (platform_id) REFERENCES platform_table(id),
    UNIQUE(name, singer)
);

CREATE INDEX IF NOT EXISTS idx_song_name ON song_table(name);
CREATE INDEX IF NOT EXISTS idx_song_singer ON song_table(singer);
CREATE INDEX IF NOT EXISTS idx_song_status ON song_table(status);

-- 点歌请求表
CREATE TABLE IF NOT EXISTS request_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id BIGINT NOT NULL,
    song_id BIGINT,
    song_name VARCHAR(64) NOT NULL,
    singer VARCHAR(64) NOT NULL,
    message VARCHAR(255),
    receiver VARCHAR(32),
    status TINYINT NOT NULL DEFAULT 0,
    play_time DATETIME,
    music_platform VARCHAR(16),
    reviewer_id BIGINT,
    review_time DATETIME,
    review_remark VARCHAR(255),
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_table(id),
    FOREIGN KEY (song_id) REFERENCES song_table(id),
    FOREIGN KEY (reviewer_id) REFERENCES admin_table(id)
);

CREATE INDEX IF NOT EXISTS idx_request_user_id ON request_table(user_id);
CREATE INDEX IF NOT EXISTS idx_request_status ON request_table(status);
CREATE INDEX IF NOT EXISTS idx_request_create_time ON request_table(create_time);
CREATE INDEX IF NOT EXISTS idx_request_reviewer_id ON request_table(reviewer_id);

-- 祝福表
CREATE TABLE IF NOT EXISTS blessing_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id BIGINT NOT NULL,
    content VARCHAR(500) NOT NULL,
    target_class VARCHAR(64),
    type INT,
    type_name VARCHAR(32),
    receiver VARCHAR(32),
    status TINYINT NOT NULL DEFAULT 0,
    is_anonymous TINYINT NOT NULL DEFAULT 0,
    reviewer_id BIGINT,
    review_time DATETIME,
    review_remark VARCHAR(255),
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_table(id),
    FOREIGN KEY (reviewer_id) REFERENCES admin_table(id)
);

CREATE INDEX IF NOT EXISTS idx_blessing_user_id ON blessing_table(user_id);
CREATE INDEX IF NOT EXISTS idx_blessing_status ON blessing_table(status);
CREATE INDEX IF NOT EXISTS idx_blessing_create_time ON blessing_table(create_time);

-- 播放排期表
CREATE TABLE IF NOT EXISTS schedule_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(16) NOT NULL,
    request_id BIGINT,
    blessing_id BIGINT,
    play_date DATE NOT NULL,
    play_time TIME NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 0,
    operator_id BIGINT,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES request_table(id),
    FOREIGN KEY (blessing_id) REFERENCES blessing_table(id),
    FOREIGN KEY (operator_id) REFERENCES admin_table(id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_play_date ON schedule_table(play_date);
CREATE INDEX IF NOT EXISTS idx_schedule_status ON schedule_table(status);
CREATE INDEX IF NOT EXISTS idx_schedule_priority ON schedule_table(priority);

-- 当前播放表
CREATE TABLE IF NOT EXISTS current_play_table (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    request_id BIGINT,
    blessing_id BIGINT,
    type VARCHAR(16),
    song_name VARCHAR(64),
    singer VARCHAR(64),
    requester_name VARCHAR(32),
    play_start_time DATETIME,
    play_end_time DATETIME,
    operator_id BIGINT,
    FOREIGN KEY (request_id) REFERENCES request_table(id),
    FOREIGN KEY (blessing_id) REFERENCES blessing_table(id),
    FOREIGN KEY (operator_id) REFERENCES admin_table(id)
);

-- 轮播图表
CREATE TABLE IF NOT EXISTS banner_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(64) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    link_url VARCHAR(255),
    sort INT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 公告表
CREATE TABLE IF NOT EXISTS announcement_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(64) NOT NULL,
    content TEXT NOT NULL,
    is_pinned TINYINT NOT NULL DEFAULT 0,
    status TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 推荐歌曲表
CREATE TABLE IF NOT EXISTS recommend_song_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    song_id BIGINT NOT NULL,
    sort INT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (song_id) REFERENCES song_table(id)
);

-- 首页配置表
CREATE TABLE IF NOT EXISTS homepage_config_table (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    show_banners TINYINT NOT NULL DEFAULT 1,
    show_announcements TINYINT NOT NULL DEFAULT 1,
    show_hot_songs TINYINT NOT NULL DEFAULT 1,
    show_new_songs TINYINT NOT NULL DEFAULT 1,
    show_recommend_songs TINYINT NOT NULL DEFAULT 1,
    banner_count INT NOT NULL DEFAULT 5,
    banner_auto_play TINYINT NOT NULL DEFAULT 1,
    banner_interval INT NOT NULL DEFAULT 3000,
    announcement_count INT NOT NULL DEFAULT 3,
    hot_song_count INT NOT NULL DEFAULT 10,
    new_song_count INT NOT NULL DEFAULT 10,
    recommend_song_count INT NOT NULL DEFAULT 6,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 消息通知表
CREATE TABLE IF NOT EXISTS notification_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(16) NOT NULL,
    title VARCHAR(64) NOT NULL,
    content VARCHAR(255) NOT NULL,
    is_read TINYINT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_table(id)
);

CREATE INDEX IF NOT EXISTS idx_notification_user_id ON notification_table(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON notification_table(is_read);

-- 敏感词表
CREATE TABLE IF NOT EXISTS sensitive_word_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word VARCHAR(32) NOT NULL UNIQUE,
    category VARCHAR(32),
    level TINYINT NOT NULL DEFAULT 2,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sensitive_word ON sensitive_word_table(word);

-- 管理员登录日志表
CREATE TABLE IF NOT EXISTS admin_login_log_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id BIGINT NOT NULL,
    username VARCHAR(32) NOT NULL,
    login_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    login_ip VARCHAR(45),
    login_device VARCHAR(128),
    status TINYINT NOT NULL DEFAULT 1,
    FOREIGN KEY (admin_id) REFERENCES admin_table(id)
);

CREATE INDEX IF NOT EXISTS idx_admin_login_log_admin_id ON admin_login_log_table(admin_id);

-- 管理员操作日志表
CREATE TABLE IF NOT EXISTS admin_operation_log_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id BIGINT NOT NULL,
    username VARCHAR(32) NOT NULL,
    action VARCHAR(32) NOT NULL,
    target VARCHAR(64),
    detail VARCHAR(255),
    ip VARCHAR(45),
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin_table(id)
);

CREATE INDEX IF NOT EXISTS idx_admin_operation_log_admin_id ON admin_operation_log_table(admin_id);
