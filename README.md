# 校园广播点歌系统

<div align="center">
  <img src="miniprogram/images/logo.png" alt="校园点歌台" width="120" height="120">
  
  <h3>一个基于微信小程序的校园广播点歌平台</h3>
  
  <p>
    <a href="#快速开始">快速开始</a> •
    <a href="#项目特性">项目特性</a> •
    <a href="#技术架构">技术架构</a> •
    <a href="#目录结构">目录结构</a> •
    <a href="#使用说明">使用说明</a>
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/Node.js-%3E=14.0.0-green.svg" alt="Node.js">
    <img src="https://img.shields.io/badge/Express-4.18.2-blue.svg" alt="Express">
    <img src="https://img.shields.io/badge/MySQL-%3E=5.7-orange.svg" alt="MySQL">
    <img src="https://img.shields.io/badge/SQLite-3.0-blue.svg" alt="SQLite">
  </p>
</div>

---

## 📖 项目简介

校园广播点歌系统是一个为高校校园广播站设计的数字化点歌平台。学生可以通过微信小程序便捷地提交点歌请求和送祝福信息，管理员通过Web后台进行审核管理，实现校园广播的智能化、数字化管理。

### 核心价值

- 🎵 **便捷点歌**：学生可通过微信小程序随时随地点歌，无需电话联系广播站
- 💝 **送祝福**：支持匿名/实名送祝福，为同学、朋友传递温暖
- 📊 **数据管理**：完整的数据统计与分析，帮助管理员了解播放情况
- 🔒 **审核机制**：敏感词过滤+人工审核，确保播放内容健康积极
- 📈 **智能推荐**：基于用户偏好（年级/学院）推荐歌曲

---

## ✨ 项目特性

### 小程序端功能

- ✅ **微信一键登录**：支持微信授权登录，自动获取用户信息
- ✅ **学号绑定**：完善学生信息（学院、专业、年级、班级等）
- ✅ **智能点歌**：
  - 歌曲搜索与自动补全
  - 热门歌曲榜单
  - 个性化推荐（基于年级/学院偏好）
  - 点歌次数限制（每日3次）
- ✅ **送祝福功能**：
  - 文本/语音祝福
  - 匿名/实名选择
  - 指定接收人（学号/昵称）
  - 祝福类型分类（生日、节日、毕业、表白、友情等）
- ✅ **历史记录**：
  - 点歌记录查询
  - 祝福发送记录
  - 播放记录查看
- ✅ **消息通知**：审核结果推送、系统公告
- ✅ **个人中心**：信息编辑、数据看板、隐私设置

### 管理后台功能

- ✅ **仪表盘**：
  - 核心数据可视化（日活/点歌量/祝福量）
  - 待审核内容快速入口
  - 今日播放排期
  - 系统健康状态监测
- ✅ **歌曲管理**：
  - 歌曲增删改查
  - 批量导入/导出（Excel/CSV）
  - 敏感词自动检测
  - 播放试听
  - 数据统计（播放量/点播量排行）
- ✅ **审核管理**：
  - 点歌/祝福内容审核（通过/驳回）
  - 批量审核操作
  - 敏感内容高亮提示
  - 审核日志记录
- ✅ **播放控制**：
  - 实时播放控制（播放/暂停/切歌/音量）
  - 当前播放队列管理
  - 历史播放记录查询
  - 手动添加歌曲到队列
- ✅ **用户管理**：
  - 用户列表查询
  - 批量操作（删除/禁用/重置密码）
  - 数据导出（Excel）
  - 统计分析（按学院/专业/年级）
- ✅ **首页配置**：
  - 轮播图管理
  - 公告管理
  - 推荐歌曲管理
  - 配置项管理
- ✅ **数据统计**：
  - 播放统计
  - 用户统计
  - 歌曲热度排行
  - Excel报表导出

### 安全特性

- 🔐 JWT身份认证
- 🔐 密码bcrypt加密
- 🔐 敏感词过滤
- 🔐 操作日志记录
- 🔐 登录日志记录
- 🔐 跨域防护
- 🔐 请求频率限制

---

## 🛠 技术架构

### 前端技术

| 组件 | 技术 | 说明 |
|------|------|------|
| 小程序端 | 微信原生框架 | WXML + WXSS + JavaScript |
| 管理后台 | HTML5 + CSS3 + JavaScript | 原生前端实现 |
| 数据可视化 | ECharts | 数据图表展示 |

### 后端技术

| 组件 | 技术 | 说明 |
|------|------|------|
| 服务端 | Node.js | >= 14.0.0 |
| Web框架 | Express | ^4.18.2 |
| 数据库 | MySQL / SQLite | MySQL（生产）/ SQLite（开发） |
| 认证 | JWT | ^9.0.2 |
| 密码加密 | bcryptjs | ^2.4.3 |
| 文件上传 | multer | ^1.4.5 |
| Excel处理 | exceljs | ^4.4.0 |
| 日志 | 自定义 | 文件日志 + 控制台日志 |

### 数据库表结构

系统包含以下核心表：

- `admin_table` - 管理员表
- `user_table` - 用户表
- `song_table` - 歌曲表
- `request_table` - 点歌请求表
- `blessing_table` - 祝福表
- `schedule_table` - 播放排期表
- `current_play_table` - 当前播放表
- `banner_table` - 轮播图表
- `announcement_table` - 公告表
- `recommend_song_table` - 推荐歌曲表
- `homepage_config_table` - 首页配置表
- `notification_table` - 消息通知表
- `sensitive_word_table` - 敏感词表
- `admin_login_log_table` - 管理员登录日志表
- `admin_operation_log_table` - 管理员操作日志表

---

## 📂 目录结构

```
校园广播点歌系统/
│
├── miniprogram/              # 微信小程序目录
│   ├── pages/                # 页面目录
│   │   ├── index/           # 首页（点歌页）
│   │   ├── blessing/        # 送祝福页面
│   │   ├── history/         # 历史记录页面
│   │   ├── user/            # 个人中心页面
│   │   └── login/           # 登录页面
│   ├── services/            # API服务层
│   ├── utils/               # 工具函数
│   ├── images/              # 图片资源
│   ├── app.js               # 小程序入口
│   ├── app.json             # 小程序配置
│   └── app.wxss             # 全局样式
│
├── admin-web/               # 管理后台目录
│   ├── pages/               # 页面目录
│   │   ├── login.html       # 登录页面
│   │   ├── dashboard.html   # 仪表盘
│   │   ├── songs.html       # 歌曲管理
│   │   ├── audit.html       # 审核管理
│   │   ├── play.html        # 播放控制
│   │   ├── users.html       # 用户管理
│   │   └── homepage.html    # 首页配置
│   ├── js/                  # JavaScript目录
│   ├── css/                 # 样式目录
│   └── index.html           # 入口页面
│
├── server/                  # 后端服务目录
│   ├── config/              # 配置目录
│   ├── controllers/         # 控制器目录
│   ├── routes/              # 路由目录
│   ├── middleware/          # 中间件目录
│   ├── utils/               # 工具函数目录
│   ├── scripts/             # 脚本目录
│   ├── data/                # 数据目录（SQLite）
│   ├── images/              # 静态图片
│   ├── server.js            # 服务入口
│   ├── package.json         # 依赖配置
│   └── .env                 # 环境变量
│
├── database/                # 数据库脚本目录
│   ├── schema.sql           # 数据库表结构
│   ├── init.sql             # 初始化数据
│   └── migrations/          # 数据库迁移脚本
│
├── api.md                   # API接口文档
├── project-structure.md     # 项目结构文档
└── README.md                # 项目说明文档
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- MySQL >= 5.7（可选，生产环境推荐）
- 微信开发者工具（用于小程序开发）

### 安装步骤

#### 1. 克隆项目

```bash
cd "g:\微信小程序开发\校园点歌平台\06版本（可发布版本）"
```

#### 2. 安装后端依赖

```bash
cd server
npm install
```

#### 3. 配置环境变量

复制 `.env.example` 到 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=6232
HOST=localhost
NODE_ENV=production

# JWT配置
JWT_SECRET=your_production_jwt_secret_key
JWT_EXPIRES_IN=7d

# 数据库配置（使用SQLite）
DB_TYPE=sqlite
DB_PATH=./data/campus_radio.db

# 数据库配置（使用MySQL，可选）
# DB_TYPE=mysql
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=campus_radio

# 文件上传配置
UPLOAD_PATH=./uploads
UPLOAD_MAX_SIZE=5242880
```

#### 4. 初始化数据库

```bash
node scripts/migrate-db.js
```

#### 5. 创建管理员账号（可选）

```bash
node scripts/createAdmin.js
```

#### 6. 启动服务器

```bash
npm start
```

服务器启动后，访问：
- 管理后台：http://localhost:6232/pages/login.html
- 默认账号：admin / admin123

#### 7. 配置小程序

1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram` 目录
3. 在 `miniprogram/app.js` 中修改 `baseUrl` 为你的服务器地址：
   ```javascript
   baseUrl: 'http://localhost:6232/api'
   ```
4. 编译运行小程序

---

## 📖 使用说明

### 小程序端使用流程

#### 学生端

1. **登录**：打开小程序，微信一键登录
2. **绑定学号**：首次登录需绑定学号并完善个人信息
3. **点歌**：
   - 进入"点歌"页面
   - 搜索歌曲或选择热门歌曲
   - 填写祝福语和接收人
   - 提交点歌请求
4. **送祝福**：
   - 进入"送祝福"页面
   - 输入祝福内容
   - 选择祝福类型
   - 可选择匿名发送
5. **查看记录**：
   - 进入"记录"页面查看历史点歌/祝福记录
   - 进入"我的"页面查看个人数据

#### 管理员端

1. **登录**：访问 http://localhost:6232/pages/login.html
2. **审核点歌**：
   - 进入"审核管理"页面
   - 查看待审核的点歌请求
   - 审核通过或驳回
3. **审核祝福**：
   - 进入"审核管理"页面
   - 查看待审核的祝福
   - 审核通过或驳回
4. **播放控制**：
   - 进入"播放控制"页面
   - 实时控制播放状态
   - 调整播放队列
5. **歌曲管理**：
   - 进入"歌曲管理"页面
   - 添加/编辑/删除歌曲
   - 批量导入歌曲
6. **用户管理**：
   - 进入"用户管理"页面
   - 查看用户列表
   - 批量操作用户
7. **首页配置**：
   - 进入"首页配置"页面
   - 配置轮播图、公告、推荐歌曲

---

## 🔌 API接口文档

详细的API接口文档请参考：[api.md](api.md)

### 主要接口分类

- 用户接口：登录、绑定学号、个人信息管理
- 歌曲接口：搜索、列表、详情
- 点歌接口：提交点歌、查询记录
- 祝福接口：提交祝福、查询记录
- 管理员接口：审核、用户管理、歌曲管理
- 播放接口：播放控制、队列管理
- 首页接口：轮播图、公告、推荐歌曲

---

## 📊 数据库初始化

### SQLite（开发环境）

系统自动初始化SQLite数据库，包含：

- 所有数据表结构
- 初始数据（首页配置、推荐歌曲等）
- 默认管理员账号（admin/admin123）

### MySQL（生产环境）

如需使用MySQL，请执行：

```bash
# 创建数据库
CREATE DATABASE campus_radio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 导入表结构
mysql -u root -p campus_radio < database/schema.sql

# 导入初始化数据
mysql -u root -p campus_radio < database/init.sql
```

---

## 🛡️ 敏感词过滤

系统内置敏感词过滤机制：

- 所有用户输入内容自动检测敏感词
- 敏感词级别：
  - 1级：轻微敏感（提示修改）
  - 2级：中度敏感（标记审核）
  - 3级：严重敏感（直接拦截）
- 敏感词库位于：`server/utils/sensitiveWords.js`

---

## 📝 开发规范

### 代码规范

- JavaScript：ES6+ 语法
- 命名规范：
  - 变量/函数：驼峰命名（camelCase）
  - 常量：大写下划线（UPPER_SNAKE_CASE）
  - 类：帕斯卡命名（PascalCase）
- 注释：关键函数添加注释

### Git提交规范

- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建过程或辅助工具变动

---

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 贡献流程

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交Issue
- 发送邮件至项目维护者

---

## 🙏 致谢

感谢所有为本项目做出贡献的开发者和用户！

---

<div align="center">
  <p><strong>让校园广播传递更多温暖与快乐</strong></p>
  <p>© 2026 校园广播点歌系统</p>
</div>
