-- 数据库迁移脚本：添加用户表新字段
-- 执行时间：2026年2月

-- 添加辅导员字段
ALTER TABLE user_table ADD COLUMN counselor VARCHAR(32);

-- 添加入学年份字段
ALTER TABLE user_table ADD COLUMN enrollment_year VARCHAR(4);

-- 添加微信名称字段
ALTER TABLE user_table ADD COLUMN wechat_name VARCHAR(64);

-- 添加微信账号字段
ALTER TABLE user_table ADD COLUMN wechat_account VARCHAR(64);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_enrollment_year ON user_table(enrollment_year);
