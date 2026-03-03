-- 数据库迁移脚本：添加用户表新字段

-- 执行时间: 服务器启动时自动添加

ALTER TABLE user_table ADD COLUMN enrollment_year VARCHAR(4);
