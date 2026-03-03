# 校园广播点歌系统 API 接口文档

## 文档说明

本文档描述了校园广播点歌系统的所有 API 接口规范，与实际代码实现保持同步。

### 基础信息

- **基础路径**: `http://localhost:6232/api`
- **请求格式**: `application/json`
- **响应格式**: `application/json`
- **字符编码**: `UTF-8`

### 通用响应格式

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

### 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 401 | 未登录或登录已过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 认证方式

所有需要认证的接口需在请求头中携带 Token：
```
Authorization: Bearer <token>
```

---

## 一、用户模块 API (`/api/users`)

### 1.1 微信登录

**接口地址**: `POST /api/users/login`

**接口说明**: 用户通过微信授权登录系统，自动完成注册和登录

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| code | string | 是 | 微信登录凭证 |
| nickName | string | 否 | 用户昵称 |
| avatarUrl | string | 否 | 用户头像URL |
| gender | number | 否 | 性别：0-未知，1-男，2-女 |
| city | string | 否 | 城市 |
| province | string | 否 | 省份 |
| country | string | 否 | 国家 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "openid": "oXXXX",
      "student_id": null,
      "real_name": null,
      "nickname": "张三",
      "avatarUrl": "https://...",
      "gender": 1,
      "college": null,
      "major": null,
      "grade": null,
      "class_name": "",
      "enrollment_year": null
    }
  }
}
```

---

### 1.2 学号密码登录

**接口地址**: `POST /api/users/login-by-student`

**接口说明**: 用户通过学号和密码登录系统

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| student_id | string | 是 | 学号 |
| password | string | 是 | 密码 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "openid": null,
      "student_id": "2021001",
      "real_name": "张三",
      "nickname": "张三",
      "avatarUrl": "https://...",
      "gender": 1,
      "college": "计算机学院",
      "major": "软件工程",
      "grade": "2021级",
      "class_name": "计算机2101班",
      "enrollment_year": "2021"
    }
  }
}
```

**错误响应示例**:

```json
{
  "code": 2007,
  "msg": "学号不存在",
  "data": null
}
```

---

### 1.3 绑定学号

**接口地址**: `POST /api/users/bind-student`

**接口说明**: 微信登录用户绑定学号信息

**认证**: 需要用户Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| student_id | string | 是 | 学号 |
| real_name | string | 是 | 真实姓名 |
| college | string | 否 | 学院（学院全称） |
| major | string | 否 | 专业名称 |
| grade | string | 否 | 年级（如：2021级） |
| class_name | string | 否 | 班级信息 |
| enrollment_year | string | 否 | 入学年份（YYYY格式） |

**返回示例**:

```json
{
  "code": 0,
  "msg": "绑定成功",
  "data": {
    "id": 1,
    "student_id": "2021001",
    "real_name": "张三",
    "college": "计算机学院",
    "major": "软件工程",
    "grade": "2021级",
    "class_name": "计算机2101班",
    "enrollment_year": "2021"
  }
}
```

---

### 1.5 用户注册

**接口地址**: `POST /api/users/register`

**接口说明**: 注册新用户账号

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| openid | string | 是 | 微信OpenID |
| nickname | string | 是 | 用户昵称 |
| avatar_url | string | 否 | 用户头像URL |
| class_name | string | 是 | 班级名称 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userInfo": {
      "id": 1,
      "openid": "oXXXX",
      "student_id": null,
      "real_name": null,
      "nickname": "张三",
      "avatarUrl": "https://...",
      "gender": 0,
      "college": null,
      "major": null,
      "grade": null,
      "class_name": "计算机2101班",
      "enrollment_year": null
    }
  }
}
```

---

### 1.6 获取用户信息

**接口地址**: `GET /api/users/info`

**接口说明**: 获取当前登录用户的详细信息

**认证**: 需要用户Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "openid": "oXXXX",
    "student_id": "2021001",
    "real_name": "张三",
    "nickname": "张三",
    "avatarUrl": "https://...",
    "gender": 1,
    "college": "计算机学院",
    "major": "软件工程",
    "grade": "2021级",
    "class_name": "计算机2101班",
    "enrollment_year": "2021",
    "phone": "13800138000",
    "create_time": "2024-01-01 10:00:00",
    "update_time": "2024-01-15 14:30:00",
    "stats": {
      "total_requests": 10,
      "approved_requests": 8,
      "total_blessings": 5
    }
  }
}
```

---

### 1.7 更新用户信息

**接口地址**: `PUT /api/users/info`

**接口说明**: 更新当前登录用户的个人信息

**认证**: 需要用户Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| nickname | string | 否 | 用户昵称 |
| avatar_url | string | 否 | 用户头像URL |
| gender | number | 否 | 性别：0-未知，1-男，2-女 |
| college | string | 否 | 学院（学院全称） |
| major | string | 否 | 专业名称 |
| grade | string | 否 | 年级（如：2021级） |
| class_name | string | 否 | 班级信息 |
| enrollment_year | string | 否 | 入学年份（YYYY格式） |
| phone | string | 否 | 联系电话 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "id": 1,
    "student_id": "2021001",
    "real_name": "张三",
    "nickname": "张三",
    "avatarUrl": "https://...",
    "gender": 1,
    "college": "计算机学院",
    "major": "软件工程",
    "grade": "2021级",
    "class_name": "计算机2101班",
    "enrollment_year": "2021",
    "phone": "13800138000"
  }
}
```

---

### 1.8 检查登录状态

**接口地址**: `GET /api/users/check-login`

**接口说明**: 检查当前用户登录状态

**认证**: 需要用户Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "已登录",
  "data": {
    "isLogin": true,
    "userInfo": {
      "id": 1,
      "openid": "oXXXX",
      "student_id": "2021001",
      "real_name": "张三",
      "nickname": "张三",
      "avatarUrl": "https://...",
      "gender": 1,
      "college": "计算机学院",
      "major": "软件工程",
      "grade": "2021级",
      "class_name": "计算机2101班",
      "enrollment_year": "2021"
    }
  }
}
```

---

### 1.9 用户退出登录

**接口地址**: `POST /api/users/logout`

**接口说明**: 用户退出登录

**认证**: 需要用户Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "退出成功",
  "data": null
}
```

---

### 1.10 获取用户统计数据

**接口地址**: `GET /api/users/stats`

**接口说明**: 获取当前用户的点歌和祝福统计数据

**认证**: 需要用户Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "total_requests": 10,
    "approved_requests": 8,
    "pending_requests": 1,
    "rejected_requests": 1,
    "total_blessings": 5,
    "approved_blessings": 4
  }
}
```

---

### 1.11 获取用户历史记录

**接口地址**: `GET /api/users/history`

**接口说明**: 获取当前用户的点歌历史记录

**认证**: 需要用户Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "song_id": 100,
        "song_name": "晴天",
        "singer": "周杰伦",
        "message": "祝好朋友生日快乐！",
        "status": 1,
        "create_time": "2024-01-15 14:30:00"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 1.12 获取用户列表（管理员）

**接口地址**: `GET /api/users/list`

**接口说明**: 管理员获取用户列表

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| keyword | string | 否 | 搜索关键词（昵称/学号/班级/手机号） |
| college | string | 否 | 学院筛选 |
| major | string | 否 | 专业筛选 |
| grade | string | 否 | 年级筛选 |
| enrollment_year | string | 否 | 入学年份筛选 |
| status | number | 否 | 状态筛选：0-正常，1-禁用 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "openid": "oXXXX",
        "student_id": "2021001",
        "real_name": "张三",
        "nickname": "张三",
        "avatar_url": "https://...",
        "gender": 1,
        "college": "计算机学院",
        "major": "软件工程",
        "grade": "2021级",
        "class_name": "计算机2101班",
        "enrollment_year": "2021",
        "phone": "13800138000",
        "status": 0,
        "create_time": "2024-01-01 10:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 1.13 更新用户状态（管理员）

**接口地址**: `PUT /api/users/:id/status`

**接口说明**: 管理员启用或禁用用户

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | number | 是 | 状态：0-启用，1-禁用 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "已启用用户",
  "data": null
}
```

---

### 1.14 删除用户（管理员）

**接口地址**: `DELETE /api/users/:id`

**接口说明**: 管理员删除用户

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

### 1.15 批量删除用户（管理员）

**接口地址**: `POST /api/users/batch-delete`

**接口说明**: 管理员批量删除用户

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 用户ID数组 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "成功删除 5 个用户",
  "data": {
    "deletedCount": 5
  }
}
```

---

### 1.16 获取消息通知列表

**接口地址**: `GET /api/users/notifications`

**接口说明**: 获取当前用户的消息通知列表

**认证**: 需要用户Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| type | string | 否 | 消息类型：audit/system/all，默认all |
| is_read | number | 否 | 已读状态：0-未读，1-已读 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "type": "audit",
        "title": "点歌审核通过",
        "content": "您提交的点歌《晴天》已审核通过，将于今日午间播放。",
        "is_read": 0,
        "create_time": "2024-01-15 10:00:00"
      }
    ],
    "total": 10,
    "unread_count": 3,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 1.17 标记消息已读

**接口地址**: `PUT /api/users/notifications/:id/read`

**接口说明**: 标记单条消息为已读

**认证**: 需要用户Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "已标记为已读",
  "data": null
}
```

---

### 1.18 标记所有消息已读

**接口地址**: `PUT /api/users/notifications/read-all`

**接口说明**: 标记所有消息为已读

**认证**: 需要用户Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "已全部标记为已读",
  "data": {
    "updatedCount": 5
  }
}
```

---

### 1.19 删除消息通知

**接口地址**: `DELETE /api/users/notifications/:id`

**接口说明**: 删除单条消息通知

**认证**: 需要用户Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

### 1.20 获取用户数据看板

**接口地址**: `GET /api/users/dashboard`

**接口说明**: 获取当前用户的数据看板信息

**认证**: 需要用户Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "request_rank": {
      "rank": 5,
      "total": 100,
      "my_count": 15
    },
    "blessing_likes_top3": [
      {
        "id": 1,
        "content": "祝高三学长学姐高考顺利！",
        "likes": 50
      }
    ],
    "recent_requests": [
      {
        "id": 1,
        "song_name": "晴天",
        "singer": "周杰伦",
        "status": 1,
        "create_time": "2024-01-15 10:00:00"
      }
    ]
  }
}
```

---

### 1.21 检查用户权限

**接口地址**: `GET /api/users/check-permission`

**接口说明**: 检查当前用户是否具有特定权限

**认证**: 需要用户Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| permission | string | 是 | 权限标识（如：song:request, blessing:submit） |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "hasPermission": true,
    "permission": "song:request"
  }
}
```

---

## 二、歌曲模块 API (`/api/songs`)

### 2.1 搜索歌曲

**接口地址**: `GET /api/songs/search`

**接口说明**: 根据关键词搜索歌曲

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| keyword | string | 是 | 搜索关键词（歌曲名/歌手名） |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "晴天",
      "singer": "周杰伦",
      "cover_url": "https://...",
      "status": 0,
      "play_count": 1500
    }
  ]
}
```

---

### 2.2 获取歌曲列表

**接口地址**: `GET /api/songs/list`

**接口说明**: 获取系统中的歌曲列表（支持分页和筛选）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| status | number | 否 | 歌曲状态：0-正常，1-禁播 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "晴天",
        "singer": "周杰伦",
        "cover_url": "https://...",
        "status": 0,
        "play_count": 1500,
        "create_time": "2024-01-01 10:00:00"
      }
    ],
    "total": 500,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 2.3 获取热门歌曲

**接口地址**: `GET /api/songs/hot`

**接口说明**: 获取热门歌曲列表

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "晴天",
      "singer": "周杰伦",
      "cover_url": "https://...",
      "play_count": 1500
    }
  ]
}
```

---

### 2.4 获取新歌推荐

**接口地址**: `GET /api/songs/new`

**接口说明**: 获取新歌推荐列表

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "晴天",
      "singer": "周杰伦",
      "cover_url": "https://...",
      "create_time": "2024-01-01 10:00:00"
    }
  ]
}
```

---

### 2.5 获取歌曲详情

**接口地址**: `GET /api/songs/:id`

**接口说明**: 获取指定歌曲的详细信息

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "name": "晴天",
    "singer": "周杰伦",
    "cover_url": "https://...",
    "status": 0,
    "play_count": 1500,
    "create_time": "2024-01-01 10:00:00"
  }
}
```

---

### 2.6 添加歌曲（管理员）

**接口地址**: `POST /api/songs`

**接口说明**: 管理员添加新歌曲

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 歌曲名称 |
| singer | string | 是 | 歌手名称 |
| cover_url | string | 否 | 封面图片URL |
| status | number | 否 | 状态：0-正常，1-禁播，默认0 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "添加成功",
  "data": {
    "id": 100,
    "name": "晴天",
    "singer": "周杰伦",
    "cover_url": "https://...",
    "status": 0,
    "create_time": "2024-01-15 14:30:00"
  }
}
```

---

### 2.7 更新歌曲（管理员）

**接口地址**: `PUT /api/songs/:id`

**接口说明**: 管理员更新歌曲信息

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 歌曲名称 |
| singer | string | 否 | 歌手名称 |
| cover_url | string | 否 | 封面图片URL |

**返回示例**:

```json
{
  "code": 0,
  "msg": "更新成功",
  "data": {
    "id": 100,
    "name": "晴天",
    "singer": "周杰伦"
  }
}
```

---

### 2.8 删除歌曲（管理员）

**接口地址**: `DELETE /api/songs/:id`

**接口说明**: 管理员删除歌曲

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

### 2.9 更新歌曲状态（管理员）

**接口地址**: `PUT /api/songs/:id/status`

**接口说明**: 管理员启用或禁用歌曲

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | number | 是 | 状态：0-正常，1-禁播 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "状态更新成功",
  "data": null
}
```

---

### 2.10 批量添加歌曲（管理员）

**接口地址**: `POST /api/songs/batch`

**接口说明**: 管理员批量添加歌曲

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| songs | array | 是 | 歌曲数组 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "批量添加成功",
  "data": {
    "addedCount": 10
  }
}
```

---

### 2.11 批量删除歌曲（管理员）

**接口地址**: `POST /api/songs/batch-delete`

**接口说明**: 管理员批量删除歌曲

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 歌曲ID数组 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "批量删除成功",
  "data": {
    "deletedCount": 5
  }
}
```

---

## 三、点歌请求模块 API (`/api/requests`)

### 3.1 提交点歌请求

**接口地址**: `POST /api/requests/submit`

**接口说明**: 用户提交点歌请求

**认证**: 需要用户Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| songId | number | 否 | 歌曲ID |
| songName | string | 是 | 歌曲名称 |
| singer | string | 是 | 歌手名称 |
| receiver | string | 否 | 接收者 |
| blessing | string | 否 | 祝福语 |
| playDate | string | 否 | 期望播放日期 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "点歌请求提交成功，请等待审核",
  "data": {
    "id": 1,
    "user_id": 10,
    "song_id": 100,
    "song_name": "晴天",
    "singer": "周杰伦",
    "message": "祝好朋友生日快乐！",
    "status": 0,
    "create_time": "2024-01-15 14:30:00"
  }
}
```

---

### 3.2 获取我的点歌请求

**接口地址**: `GET /api/requests/my`

**接口说明**: 获取当前用户的点歌请求列表

**认证**: 需要用户Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| status | number | 否 | 状态筛选 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "song_id": 100,
        "song_name": "晴天",
        "singer": "周杰伦",
        "message": "祝好朋友生日快乐！",
        "status": 1,
        "reject_reason": null,
        "create_time": "2024-01-15 14:30:00"
      }
    ],
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 3.3 获取点歌历史

**接口地址**: `GET /api/requests/history`

**接口说明**: 获取所有点歌历史记录

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| status | number | 否 | 状态筛选 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 10,
        "song_name": "晴天",
        "singer": "周杰伦",
        "message": "祝好朋友生日快乐！",
        "status": 1,
        "nickname": "张三",
        "avatar_url": "https://...",
        "create_time": "2024-01-15 14:30:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 3.4 获取今日点歌

**接口地址**: `GET /api/requests/today`

**接口说明**: 获取今日已通过的点歌请求

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "song_name": "晴天",
      "singer": "周杰伦",
      "message": "祝好朋友生日快乐！",
      "nickname": "张三",
      "avatar_url": "https://..."
    }
  ]
}
```

---

### 3.5 获取待审核点歌（管理员）

**接口地址**: `GET /api/requests/pending`

**接口说明**: 管理员获取待审核的点歌请求列表

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 10,
        "song_name": "晴天",
        "singer": "周杰伦",
        "message": "祝好朋友生日快乐！",
        "status": 0,
        "nickname": "张三",
        "class_name": "计算机2101班",
        "create_time": "2024-01-15 14:30:00"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 3.6 审核点歌请求（管理员）

**接口地址**: `PUT /api/requests/:id/audit`

**接口说明**: 管理员审核点歌请求

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | number | 是 | 审核状态：1-通过，2-驳回 |
| reason | string | 否 | 驳回原因（驳回时必填） |

**返回示例**:

```json
{
  "code": 0,
  "msg": "审核通过",
  "data": {
    "id": 1,
    "status": 1
  }
}
```

---

### 3.7 批量审核点歌请求（管理员）

**接口地址**: `POST /api/requests/batch-audit`

**接口说明**: 管理员批量审核点歌请求

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 点歌请求ID数组 |
| status | number | 是 | 审核状态：1-通过，2-驳回 |
| reason | string | 否 | 驳回原因 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "成功审核 5 条记录",
  "data": {
    "auditedCount": 5
  }
}
```

---

### 3.8 取消点歌请求

**接口地址**: `PUT /api/requests/:id/cancel`

**接口说明**: 用户取消自己的点歌请求（仅限待审核状态）

**认证**: 需要用户Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "已取消",
  "data": null
}
```

---

### 3.9 标记为已播放（管理员）

**接口地址**: `PUT /api/requests/:id/play`

**接口说明**: 管理员将点歌请求标记为已播放

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "已标记为已播放",
  "data": null
}
```

---

### 3.10 删除点歌请求（管理员）

**接口地址**: `DELETE /api/requests/:id`

**接口说明**: 管理员删除点歌请求

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

## 四、祝福模块 API (`/api/blessings`)

### 4.1 提交祝福

**接口地址**: `POST /api/blessings/submit`

**接口说明**: 用户提交祝福信息

**认证**: 需要用户Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | number | 否 | 祝福类型索引 |
| typeName | string | 否 | 祝福类型名称 |
| receiver | string | 是 | 接收者 |
| content | string | 是 | 祝福内容 |
| playDate | string | 否 | 期望播放日期 |
| isAnonymous | boolean | 否 | 是否匿名，默认false |

**返回示例**:

```json
{
  "code": 0,
  "msg": "祝福提交成功，请等待审核",
  "data": {
    "id": 1,
    "user_id": 10,
    "content": "祝高三学长学姐高考顺利！",
    "target_class": "高三全体同学",
    "status": 0,
    "create_time": "2024-01-15 14:30:00"
  }
}
```

---

### 4.2 获取我的祝福

**接口地址**: `GET /api/blessings/my`

**接口说明**: 获取当前用户的祝福列表

**认证**: 需要用户Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "content": "祝高三学长学姐高考顺利！",
        "target_class": "高三全体同学",
        "status": 1,
        "create_time": "2024-01-15 14:30:00"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 4.3 获取祝福列表

**接口地址**: `GET /api/blessings/list`

**接口说明**: 获取祝福列表（公开）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "content": "祝高三学长学姐高考顺利！",
      "target_class": "高三全体同学",
      "is_anonymous": 0,
      "create_time": "2024-01-15 14:30:00"
    }
  ]
}
```

---

### 4.4 获取待审核祝福（管理员）

**接口地址**: `GET /api/blessings/pending`

**接口说明**: 管理员获取待审核的祝福列表

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 10,
        "content": "祝高三学长学姐高考顺利！",
        "target_class": "高三全体同学",
        "status": 0,
        "nickname": "张三",
        "class_name": "计算机2101班",
        "create_time": "2024-01-15 14:30:00"
      }
    ],
    "total": 30,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 4.5 审核祝福（管理员）

**接口地址**: `PUT /api/blessings/:id/audit`

**接口说明**: 管理员审核祝福信息

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | number | 是 | 审核状态：1-通过，2-驳回 |
| reason | string | 否 | 驳回原因（驳回时必填） |

**返回示例**:

```json
{
  "code": 0,
  "msg": "审核完成",
  "data": {
    "id": 1,
    "status": 1
  }
}
```

---

### 4.6 批量审核祝福（管理员）

**接口地址**: `POST /api/blessings/batch-audit`

**接口说明**: 管理员批量审核祝福

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| ids | array | 是 | 祝福ID数组 |
| status | number | 是 | 审核状态：1-通过，2-驳回 |
| reason | string | 否 | 驳回原因 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "成功审核 5 条记录",
  "data": {
    "auditedCount": 5
  }
}
```

---

### 4.7 取消祝福

**接口地址**: `PUT /api/blessings/:id/cancel`

**接口说明**: 用户取消自己的祝福（仅限待审核状态）

**认证**: 需要用户Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "已取消",
  "data": null
}
```

---

### 4.8 删除祝福（管理员）

**接口地址**: `DELETE /api/blessings/:id`

**接口说明**: 管理员删除祝福

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

## 五、管理员模块 API (`/api/admin`)

### 5.1 管理员登录

**接口地址**: `POST /api/admin/login`

**接口说明**: 管理员账号登录

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 管理员用户名 |
| password | string | 是 | 管理员密码 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "adminInfo": {
      "id": 1,
      "username": "admin",
      "real_name": "系统管理员",
      "role": "admin",
      "last_login_time": "2024-01-14 10:00:00"
    }
  }
}
```

---

### 5.2 管理员登出

**接口地址**: `POST /api/admin/logout`

**接口说明**: 管理员退出登录

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "登出成功",
  "data": null
}
```

---

### 5.3 获取管理员信息

**接口地址**: `GET /api/admin/info`

**接口说明**: 获取当前管理员信息

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "real_name": "系统管理员",
    "role": "admin",
    "status": 0,
    "last_login_time": "2024-01-14 10:00:00"
  }
}
```

---

### 5.4 修改密码

**接口地址**: `PUT /api/admin/password`

**接口说明**: 管理员修改登录密码

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| oldPassword | string | 是 | 原密码 |
| newPassword | string | 是 | 新密码（6-20位） |

**返回示例**:

```json
{
  "code": 0,
  "msg": "密码修改成功，请重新登录",
  "data": null
}
```

---

### 5.5 获取仪表盘数据

**接口地址**: `GET /api/admin/dashboard`

**接口说明**: 获取管理后台仪表盘统计数据

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "totalSongs": 100,
    "pendingRequests": 15,
    "pendingBlessings": 8,
    "todayPlayed": 10,
    "pendingList": [],
    "todaySchedule": []
  }
}
```

---

### 5.6 创建管理员（管理员）

**接口地址**: `POST /api/admin/create`

**接口说明**: 创建新管理员账号

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| real_name | string | 否 | 真实姓名 |
| role | string | 否 | 角色，默认admin |

**返回示例**:

```json
{
  "code": 0,
  "msg": "创建成功",
  "data": {
    "id": 2,
    "username": "admin2",
    "real_name": "管理员2",
    "role": "admin"
  }
}
```

---

## 六、播放排期模块 API (`/api/admin/schedule`)

### 6.1 获取排期列表

**接口地址**: `GET /api/admin/schedule/list`

**接口说明**: 获取播放排期列表

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| date | string | 否 | 指定日期 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "type": "song",
      "request_id": 10,
      "play_date": "2024-01-16",
      "play_time": "12:00:00",
      "priority": 0,
      "status": 0
    }
  ]
}
```

---

### 6.2 添加排期（管理员）

**接口地址**: `POST /api/admin/schedule/add`

**接口说明**: 管理员添加播放排期

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 类型：song/blessing |
| request_id | number | 否 | 点歌请求ID |
| blessing_id | number | 否 | 祝福ID |
| play_date | string | 是 | 播放日期 |
| play_time | string | 是 | 播放时间 |
| priority | number | 否 | 优先级，默认0 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "排期添加成功",
  "data": {
    "id": 1,
    "type": "song",
    "play_date": "2024-01-16",
    "play_time": "12:00:00"
  }
}
```

---

### 6.3 更新排期（管理员）

**接口地址**: `PUT /api/admin/schedule/:id`

**接口说明**: 管理员更新播放排期

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| play_date | string | 否 | 播放日期 |
| play_time | string | 否 | 播放时间 |
| priority | number | 否 | 优先级 |
| status | number | 否 | 状态 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "排期更新成功",
  "data": null
}
```

---

### 6.4 删除排期（管理员）

**接口地址**: `DELETE /api/admin/schedule/:id`

**接口说明**: 管理员删除播放排期

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

### 6.5 紧急插播（管理员）

**接口地址**: `POST /api/admin/schedule/insert`

**接口说明**: 管理员紧急插播

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 类型：song/blessing |
| request_id | number | 否 | 点歌请求ID |
| blessing_id | number | 否 | 祝福ID |
| play_date | string | 是 | 播放日期 |
| play_time | string | 是 | 播放时间 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "紧急插播成功",
  "data": {
    "id": 1,
    "priority": 1
  }
}
```

---

### 6.6 标记已播放（管理员）

**接口地址**: `PUT /api/admin/schedule/played`

**接口说明**: 管理员标记排期为已播放

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | number | 是 | 排期ID |

**返回示例**:

```json
{
  "code": 0,
  "msg": "已标记为已播放",
  "data": null
}
```

---

## 七、数据统计模块 API (`/api/admin/stats`)

### 7.1 每日统计

**接口地址**: `GET /api/admin/stats/daily`

**接口说明**: 获取每日统计数据

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| date | string | 否 | 指定日期 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "date": "2024-01-15",
    "totalRequests": 50,
    "approvedRequests": 45,
    "rejectedRequests": 5,
    "totalBlessings": 20,
    "approvedBlessings": 18
  }
}
```

---

### 7.2 每周统计

**接口地址**: `GET /api/admin/stats/weekly`

**接口说明**: 获取每周统计数据

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "weekStart": "2024-01-08",
    "weekEnd": "2024-01-14",
    "totalRequests": 350,
    "avgDaily": 50
  }
}
```

---

### 7.3 每月统计

**接口地址**: `GET /api/admin/stats/monthly`

**接口说明**: 获取每月统计数据

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "month": "2024-01",
    "totalRequests": 1500,
    "avgDaily": 48
  }
}
```

---

### 7.4 概览统计

**接口地址**: `GET /api/admin/stats/overview`

**接口说明**: 获取系统概览统计数据

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "totalUsers": 500,
    "totalSongs": 200,
    "totalRequests": 5000,
    "totalBlessings": 2000
  }
}
```

---

### 7.5 热门歌曲排行

**接口地址**: `GET /api/admin/stats/hot-songs`

**接口说明**: 获取热门歌曲排行榜

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | number | 否 | 返回数量，默认10 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "晴天",
      "singer": "周杰伦",
      "play_count": 150,
      "request_count": 80
    }
  ]
}
```

---

### 7.6 热门班级排行

**接口地址**: `GET /api/admin/stats/hot-classes`

**接口说明**: 获取热门班级排行榜

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| limit | number | 否 | 返回数量，默认10 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "class_name": "计算机2101班",
      "request_count": 50,
      "user_count": 25
    }
  ]
}
```

---

## 八、首页模块 API (`/api/homepage`)

### 8.1 获取首页数据

**接口地址**: `GET /api/homepage/data`

**接口说明**: 获取首页展示所需的所有数据

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "banners": [],
    "announcements": [],
    "hotSongs": [],
    "newSongs": [],
    "recommendSongs": [],
    "config": {}
  }
}
```

---

### 8.2 获取轮播图

**接口地址**: `GET /api/homepage/banners`

**接口说明**: 获取首页轮播图列表

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "title": "欢迎使用校园点歌台",
      "image_url": "https://...",
      "link_url": "",
      "sort": 1
    }
  ]
}
```

---

### 8.3 获取公告

**接口地址**: `GET /api/homepage/announcements`

**接口说明**: 获取首页公告列表

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "title": "系统公告",
      "content": "欢迎使用校园点歌台",
      "create_time": "2024-01-01 10:00:00"
    }
  ]
}
```

---

### 8.4 获取推荐歌曲

**接口地址**: `GET /api/homepage/recommend-songs`

**接口说明**: 获取推荐歌曲列表

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "晴天",
      "singer": "周杰伦",
      "cover_url": "https://..."
    }
  ]
}
```

---

### 8.5 添加轮播图（管理员）

**接口地址**: `POST /api/homepage/banners`

**接口说明**: 管理员添加首页轮播图

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 轮播图标题 |
| image_url | string | 是 | 图片URL |
| link_url | string | 否 | 跳转链接 |
| sort | number | 否 | 排序，默认0 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "添加成功",
  "data": {
    "id": 1,
    "title": "欢迎使用校园点歌台",
    "image_url": "https://...",
    "link_url": "",
    "sort": 1
  }
}
```

---

### 8.6 更新轮播图（管理员）

**接口地址**: `PUT /api/homepage/banners/:id`

**接口说明**: 管理员更新轮播图信息

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 否 | 轮播图标题 |
| image_url | string | 否 | 图片URL |
| link_url | string | 否 | 跳转链接 |
| sort | number | 否 | 排序 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "更新成功",
  "data": null
}
```

---

### 8.7 删除轮播图（管理员）

**接口地址**: `DELETE /api/homepage/banners/:id`

**接口说明**: 管理员删除轮播图

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

### 8.8 添加公告（管理员）

**接口地址**: `POST /api/homepage/announcements`

**接口说明**: 管理员添加首页公告

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 公告标题 |
| content | string | 是 | 公告内容 |
| is_pinned | boolean | 否 | 是否置顶，默认false |

**返回示例**:

```json
{
  "code": 0,
  "msg": "添加成功",
  "data": {
    "id": 1,
    "title": "系统公告",
    "content": "欢迎使用校园点歌台",
    "is_pinned": false,
    "create_time": "2024-01-15 14:30:00"
  }
}
```

---

### 8.9 更新公告（管理员）

**接口地址**: `PUT /api/homepage/announcements/:id`

**接口说明**: 管理员更新公告信息

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 否 | 公告标题 |
| content | string | 否 | 公告内容 |
| is_pinned | boolean | 否 | 是否置顶 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "更新成功",
  "data": null
}
```

---

### 8.10 删除公告（管理员）

**接口地址**: `DELETE /api/homepage/announcements/:id`

**接口说明**: 管理员删除公告

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

### 8.11 添加推荐歌曲（管理员）

**接口地址**: `POST /api/homepage/recommend-songs`

**接口说明**: 管理员添加推荐歌曲

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| song_id | number | 是 | 歌曲ID |
| sort | number | 否 | 排序，默认0 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "添加成功",
  "data": {
    "id": 1,
    "song_id": 100,
    "sort": 1
  }
}
```

---

### 8.12 删除推荐歌曲（管理员）

**接口地址**: `DELETE /api/homepage/recommend-songs/:id`

**接口说明**: 管理员删除推荐歌曲

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

### 8.13 更新首页配置（管理员）

**接口地址**: `PUT /api/homepage/config`

**接口说明**: 管理员更新首页模块显示配置

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| show_banners | boolean | 否 | 是否显示轮播图 |
| show_announcements | boolean | 否 | 是否显示公告 |
| show_hot_songs | boolean | 否 | 是否显示热门歌曲 |
| show_new_songs | boolean | 否 | 是否显示新歌推荐 |
| show_recommend_songs | boolean | 否 | 是否显示推荐歌单 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "配置更新成功",
  "data": null
}
```

---

## 九、播放控制模块 API (`/api/play`)

### 9.1 获取播放显示数据

**接口地址**: `GET /api/play/display`

**接口说明**: 获取播放页面显示所需的所有数据，包括当前播放、下一首、历史播放和队列数量

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "currentPlaying": {
      "requestId": 10,
      "songName": "晴天",
      "singer": "周杰伦",
      "receiver": "张三",
      "blessing": "祝生日快乐！",
      "requesterName": "李四",
      "requesterClass": "计算机2101班"
    },
    "nextSong": {
      "requestId": 11,
      "songName": "七里香",
      "singer": "周杰伦",
      "receiver": "王五",
      "blessing": "毕业快乐！",
      "requesterName": "赵六",
      "requesterClass": "计算机2102班"
    },
    "historySongs": [
      {
        "requestId": 9,
        "songName": "稻香",
        "singer": "周杰伦",
        "receiver": "小明",
        "blessing": "加油！",
        "playTime": "2024-01-15 12:30:00"
      }
    ],
    "queueCount": 5
  }
}
```

---

### 9.2 获取播放队列（管理员）

**接口地址**: `GET /api/play/queue`

**接口说明**: 管理员获取待播放的歌曲队列

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "requestId": 11,
        "songName": "七里香",
        "singer": "周杰伦",
        "requesterName": "赵六",
        "requesterClass": "计算机2102班",
        "receiver": "王五",
        "blessing": "毕业快乐！",
        "updateTime": "2024-01-15 14:00:00"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 9.3 获取播放历史

**接口地址**: `GET /api/play/history`

**接口说明**: 获取已播放的歌曲历史记录

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "requestId": 9,
        "songName": "稻香",
        "singer": "周杰伦",
        "requesterName": "张三",
        "requesterClass": "计算机2101班",
        "receiver": "小明",
        "blessing": "加油！",
        "playTime": "2024-01-15 12:30:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 9.4 播放下一首（管理员）

**接口地址**: `POST /api/play/next`

**接口说明**: 管理员开始播放队列中的下一首歌曲

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "开始播放",
  "data": {
    "message": "开始播放",
    "currentPlaying": {
      "requestId": 11,
      "songName": "七里香",
      "singer": "周杰伦",
      "receiver": "王五",
      "blessing": "毕业快乐！",
      "requesterName": "赵六",
      "requesterClass": "计算机2102班"
    }
  }
}
```

---

### 9.5 停止播放（管理员）

**接口地址**: `POST /api/play/stop`

**接口说明**: 管理员停止当前播放

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "已停止播放",
  "data": {
    "message": "已停止播放"
  }
}
```

---

### 9.6 更新播放顺序（管理员）

**接口地址**: `PUT /api/play/order`

**接口说明**: 管理员调整播放队列中歌曲的播放顺序

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| orders | array | 是 | 播放顺序数组，每个元素包含 id 和 order |

**请求示例**:

```json
{
  "orders": [
    { "id": 11, "order": 1 },
    { "id": 12, "order": 2 },
    { "id": 13, "order": 3 }
  ]
}
```

**返回示例**:

```json
{
  "code": 0,
  "msg": "播放顺序已更新",
  "data": {
    "message": "播放顺序已更新"
  }
}
```

---

### 9.7 音乐平台标识说明

播放控制模块支持以下音乐平台：

| 平台标识 | 平台名称 |
|----------|----------|
| netease | 网易云音乐 |
| qq | QQ音乐 |
| kugou | 酷狗音乐 |
| kuwo | 酷我音乐 |
| xiami | 虾米音乐 |
| migu | 咪咕音乐 |
| local | 本地文件 |

---

## 十、系统健康检查 API

### 10.1 健康检查

**接口地址**: `GET /api/health`

**接口说明**: 检查服务器健康状态

**返回示例**:

```json
{
  "code": 0,
  "msg": "服务运行正常",
  "data": {
    "status": "ok",
    "timestamp": "2024-01-15T14:30:00.000Z",
    "uptime": 86400,
    "server": {
      "ready": true,
      "port": 6232,
      "host": "localhost"
    },
    "database": {
      "connected": true
    }
  }
}
```

---

### 10.2 就绪检查

**接口地址**: `GET /api/ready`

**接口说明**: 检查服务器是否就绪

**返回示例**:

```json
{
  "code": 0,
  "msg": "服务器已就绪",
  "data": {
    "ready": true,
    "timestamp": "2024-01-15T14:30:00.000Z"
  }
}
```

---

## 十一、文件上传模块 API (`/api/upload`)

### 11.1 上传图片

**接口地址**: `POST /api/upload/image`

**接口说明**: 上传图片文件（支持jpg、png、gif格式）

**认证**: 需要用户Token

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | 图片文件（最大5MB） |
| type | string | 否 | 图片类型：avatar/cover/banner，默认cover |

**返回示例**:

```json
{
  "code": 0,
  "msg": "上传成功",
  "data": {
    "url": "https://example.com/uploads/images/2024/01/15/abc123.jpg",
    "filename": "abc123.jpg",
    "size": 102400,
    "mimetype": "image/jpeg"
  }
}
```

---

### 11.2 上传音频（管理员）

**接口地址**: `POST /api/upload/audio`

**接口说明**: 管理员上传音频文件（支持mp3、wav格式）

**认证**: 需要管理员Token

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | 音频文件（最大50MB） |

**返回示例**:

```json
{
  "code": 0,
  "msg": "上传成功",
  "data": {
    "url": "https://example.com/uploads/audio/2024/01/15/xyz789.mp3",
    "filename": "xyz789.mp3",
    "size": 5242880,
    "duration": 240,
    "mimetype": "audio/mpeg"
  }
}
```

---

### 11.3 上传文件（管理员）

**接口地址**: `POST /api/upload/file`

**接口说明**: 管理员上传通用文件

**认证**: 需要管理员Token

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | 文件（最大20MB） |

**返回示例**:

```json
{
  "code": 0,
  "msg": "上传成功",
  "data": {
    "url": "https://example.com/uploads/files/2024/01/15/doc123.xlsx",
    "filename": "doc123.xlsx",
    "size": 102400,
    "mimetype": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
}
```

---

## 十二、批量操作模块 API (`/api/batch`)

### 12.1 批量导入歌曲（管理员）

**接口地址**: `POST /api/batch/songs/import`

**接口说明**: 管理员通过Excel/CSV文件批量导入歌曲

**认证**: 需要管理员Token

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | Excel或CSV文件 |

**文件格式要求**:

| 列名 | 说明 | 必填 |
|------|------|------|
| name | 歌曲名称 | 是 |
| singer | 歌手名称 | 是 |
| album | 专辑名称 | 否 |
| cover_url | 封面URL | 否 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "导入完成",
  "data": {
    "total": 100,
    "success": 95,
    "failed": 5,
    "errors": [
      {
        "row": 10,
        "reason": "歌曲名称不能为空"
      }
    ]
  }
}
```

---

### 12.2 批量导出歌曲（管理员）

**接口地址**: `GET /api/batch/songs/export`

**接口说明**: 管理员导出歌曲数据为Excel/CSV文件

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| format | string | 否 | 导出格式：xlsx/csv，默认xlsx |
| status | number | 否 | 状态筛选 |

**返回**: 文件下载

---

### 12.3 批量导出点歌记录（管理员）

**接口地址**: `GET /api/batch/requests/export`

**接口说明**: 管理员导出点歌记录为Excel/CSV文件

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| format | string | 否 | 导出格式：xlsx/csv，默认xlsx |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |
| status | number | 否 | 状态筛选 |

**返回**: 文件下载

---

### 12.4 批量导出用户数据（管理员）

**接口地址**: `GET /api/batch/users/export`

**接口说明**: 管理员导出用户数据为Excel/CSV文件

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| format | string | 否 | 导出格式：xlsx/csv，默认xlsx |

**返回**: 文件下载

---

### 12.5 批量导出统计数据（管理员）

**接口地址**: `GET /api/batch/stats/export`

**接口说明**: 管理员导出统计报表

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| format | string | 否 | 导出格式：xlsx/pdf，默认xlsx |
| type | string | 是 | 统计类型：daily/weekly/monthly |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |

**返回**: 文件下载

---

## 十三、管理员管理模块 API (`/api/admin`)

### 13.1 获取管理员列表

**接口地址**: `GET /api/admin/list`

**接口说明**: 获取管理员账号列表

**认证**: 需要管理员Token（仅超级管理员）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| keyword | string | 否 | 搜索关键词（用户名/姓名） |
| role | string | 否 | 角色筛选 |
| status | number | 否 | 状态筛选 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "real_name": "系统管理员",
        "role": "super_admin",
        "status": 0,
        "last_login_time": "2024-01-15 10:00:00",
        "last_login_ip": "192.168.1.100",
        "create_time": "2024-01-01 10:00:00"
      }
    ],
    "total": 5,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 13.2 更新管理员信息

**接口地址**: `PUT /api/admin/:id`

**接口说明**: 更新管理员账号信息

**认证**: 需要管理员Token（仅超级管理员）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| real_name | string | 否 | 真实姓名 |
| role | string | 否 | 角色 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "更新成功",
  "data": null
}
```

---

### 13.3 更新管理员状态

**接口地址**: `PUT /api/admin/:id/status`

**接口说明**: 启用或禁用管理员账号

**认证**: 需要管理员Token（仅超级管理员）

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | number | 是 | 状态：0-启用，1-禁用 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "状态更新成功",
  "data": null
}
```

---

### 13.4 删除管理员

**接口地址**: `DELETE /api/admin/:id`

**接口说明**: 删除管理员账号

**认证**: 需要管理员Token（仅超级管理员）

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

### 13.5 获取登录日志

**接口地址**: `GET /api/admin/login-logs`

**接口说明**: 获取管理员登录日志

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| admin_id | number | 否 | 管理员ID筛选 |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "admin_id": 1,
        "username": "admin",
        "login_time": "2024-01-15 10:00:00",
        "login_ip": "192.168.1.100",
        "login_device": "Chrome/Windows",
        "status": 1
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 13.6 获取操作日志

**接口地址**: `GET /api/admin/operation-logs`

**接口说明**: 获取管理员操作日志

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| admin_id | number | 否 | 管理员ID筛选 |
| action | string | 否 | 操作类型筛选 |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "admin_id": 1,
        "username": "admin",
        "action": "审核点歌",
        "target": "点歌请求ID: 100",
        "detail": "审核通过",
        "ip": "192.168.1.100",
        "create_time": "2024-01-15 10:00:00"
      }
    ],
    "total": 500,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 十四、敏感词管理模块 API (`/api/sensitive`)

### 14.1 检测敏感词

**接口地址**: `POST /api/sensitive/check`

**接口说明**: 检测文本中的敏感词

**认证**: 需要用户Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| text | string | 是 | 待检测文本 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "hasSensitive": true,
    "words": ["敏感词1", "敏感词2"],
    "filteredText": "文本中的***已被替换"
  }
}
```

---

### 14.2 获取敏感词列表（管理员）

**接口地址**: `GET /api/sensitive/list`

**接口说明**: 管理员获取敏感词列表

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | number | 否 | 页码，默认1 |
| pageSize | number | 否 | 每页数量，默认20 |
| keyword | string | 否 | 搜索关键词 |
| category | string | 否 | 分类筛选 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "word": "敏感词",
        "category": "政治",
        "level": 1,
        "create_time": "2024-01-01 10:00:00"
      }
    ],
    "total": 200,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 14.3 添加敏感词（管理员）

**接口地址**: `POST /api/sensitive/add`

**接口说明**: 管理员添加敏感词

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| word | string | 是 | 敏感词 |
| category | string | 否 | 分类 |
| level | number | 否 | 级别：1-高，2-中，3-低，默认2 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "添加成功",
  "data": {
    "id": 1,
    "word": "敏感词",
    "category": "其他",
    "level": 2
  }
}
```

---

### 14.4 批量添加敏感词（管理员）

**接口地址**: `POST /api/sensitive/batch-add`

**接口说明**: 管理员批量添加敏感词

**认证**: 需要管理员Token

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| words | array | 是 | 敏感词数组 |
| category | string | 否 | 分类 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "批量添加成功",
  "data": {
    "addedCount": 10
  }
}
```

---

### 14.5 删除敏感词（管理员）

**接口地址**: `DELETE /api/sensitive/:id`

**接口说明**: 管理员删除敏感词

**认证**: 需要管理员Token

**返回示例**:

```json
{
  "code": 0,
  "msg": "删除成功",
  "data": null
}
```

---

### 14.6 导入敏感词库（管理员）

**接口地址**: `POST /api/sensitive/import`

**接口说明**: 管理员导入敏感词库文件

**认证**: 需要管理员Token

**请求格式**: `multipart/form-data`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | 文本文件（每行一个敏感词） |
| category | string | 否 | 分类 |

**返回示例**:

```json
{
  "code": 0,
  "msg": "导入成功",
  "data": {
    "addedCount": 500,
    "skippedCount": 50
  }
}
```

---

## 附录

### A. HTTP状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或Token无效 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如重复提交） |
| 422 | 参数验证失败 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |
| 503 | 服务暂时不可用 |

---

### B. 业务错误码说明

#### 通用错误码 (1xxx)

| 错误码 | 说明 |
|--------|------|
| 1001 | 参数错误 |
| 1002 | 参数验证失败 |
| 1003 | 资源不存在 |
| 1004 | 资源已存在 |
| 1005 | 操作失败 |

#### 用户相关错误码 (2xxx)

| 错误码 | 说明 |
|--------|------|
| 2001 | 用户不存在 |
| 2002 | 密码错误 |
| 2003 | 账号已被禁用 |
| 2004 | 登录已过期 |
| 2005 | Token无效 |
| 2006 | 微信授权失败 |
| 2007 | 学号不存在 |
| 2008 | 学号已被绑定 |
| 2009 | 用户已存在 |

#### 歌曲相关错误码 (3xxx)

| 错误码 | 说明 |
|--------|------|
| 3001 | 歌曲不存在 |
| 3002 | 歌曲已禁播 |
| 3003 | 歌曲已存在 |
| 3004 | 歌曲导入失败 |

#### 点歌请求相关错误码 (4xxx)

| 错误码 | 说明 |
|--------|------|
| 4001 | 点歌请求不存在 |
| 4002 | 歌曲不可用 |
| 4003 | 今日点歌次数已达上限 |
| 4004 | 请求已审核，无法修改 |
| 4005 | 非本人请求，无权操作 |
| 4006 | 祝福语包含敏感词 |

#### 祝福相关错误码 (5xxx)

| 错误码 | 说明 |
|--------|------|
| 5001 | 祝福不存在 |
| 5002 | 祝福内容包含敏感词 |
| 5003 | 祝福已审核，无法修改 |
| 5004 | 非本人祝福，无权操作 |

#### 管理员相关错误码 (6xxx)

| 错误码 | 说明 |
|--------|------|
| 6001 | 管理员不存在 |
| 6002 | 密码错误 |
| 6003 | 账号已被禁用 |
| 6004 | 权限不足 |
| 6005 | 用户名已存在 |
| 6006 | 原密码错误 |

#### 文件上传相关错误码 (7xxx)

| 错误码 | 说明 |
|--------|------|
| 7001 | 文件类型不支持 |
| 7002 | 文件大小超限 |
| 7003 | 文件上传失败 |
| 7004 | 文件内容不合法 |

---

### C. 状态值说明

#### 点歌请求/祝福状态
| 状态值 | 说明 |
|--------|------|
| 0 | 待审核 |
| 1 | 已通过 |
| 2 | 已驳回 |
| 3 | 已取消/已播放 |

#### 歌曲状态
| 状态值 | 说明 |
|--------|------|
| 0 | 正常 |
| 1 | 禁播 |

#### 用户状态
| 状态值 | 说明 |
|--------|------|
| 0 | 正常 |
| 1 | 禁用 |

#### 播放排期状态
| 状态值 | 说明 |
|--------|------|
| 0 | 待播放 |
| 1 | 已播放 |

#### 管理员角色
| 角色标识 | 说明 |
|----------|------|
| super_admin | 超级管理员（拥有所有权限） |
| admin | 普通管理员（拥有审核、歌曲管理等权限） |
| editor | 编辑（仅拥有内容编辑权限） |

#### 敏感词级别
| 级别值 | 说明 |
|--------|------|
| 1 | 高（直接拦截） |
| 2 | 中（需人工审核） |
| 3 | 低（自动替换） |

---

### D. 祝福类型说明
| 索引 | 类型名称 |
|------|----------|
| 0 | 生日祝福 |
| 1 | 节日祝福 |
| 2 | 毕业祝福 |
| 3 | 表白祝福 |
| 4 | 友情祝福 |
| 5 | 其他 |

---

### E. 学生字段数据规范

用户表中包含以下学生相关字段，需严格遵循学校信息管理规范：

| 字段名 | 类型 | 长度 | 格式要求 | 说明 |
|--------|------|------|----------|------|
| `student_id` | string | 最大20位 | 学校统一编码规则 | 学号，作为学生唯一标识符 |
| `real_name` | string | 最大32位 | 中文字符 | 学生真实姓名 |
| `gender` | number | - | 0/1/2 | 性别：0-未知，1-男，2-女 |
| `college` | string | 最大64位 | 学院全称 | 所属学院（如：计算机学院） |
| `major` | string | 最大64位 | 专业全称 | 专业名称，精确到具体专业方向（如：软件工程） |
| `grade` | string | 最大16位 | YYYY级 | 年级信息（如：2021级） |
| `class_name` | string | 最大32位 | 班级编号及名称 | 班级信息（如：计算机2101班） |
| `enrollment_year` | string | 4位 | YYYY格式 | 入学年份（如：2021） |

#### 数据验证规则

| 字段 | 验证规则 |
|------|----------|
| `student_id` | 必须唯一；仅允许数字和字母；长度8-20位 |
| `real_name` | 仅允许中文字符；长度2-32位 |
| `gender` | 枚举值：0、1、2 |
| `college` | 长度2-64位；需匹配学校学院列表 |
| `major` | 长度2-64位；需匹配学院下属专业列表 |
| `grade` | 格式：YYYY级；年份范围：2000-当前年份 |
| `class_name` | 长度2-32位 |
| `enrollment_year` | 格式：YYYY；年份范围：2000-当前年份 |

#### 字段关联关系

- `college` 和 `major` 存在关联：专业必须属于所选学院
- `grade` 和 `enrollment_year` 存在关联：年级通常由入学年份推导
- `class_name` 与 `college`、`major`、`grade` 存在关联：班级归属对应学院、专业和年级

---

### F. 字段命名规范

本API文档遵循以下命名规范：

| 场景 | 命名风格 | 示例 |
|------|----------|------|
| 请求参数 | snake_case | `song_name`, `play_date` |
| 响应字段 | snake_case | `create_time`, `cover_url` |
| 路由参数 | camelCase | `:songId`, `:requestId` |

---

### G. 分页参数说明

所有支持分页的接口统一使用以下参数：

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| page | number | 1 | 当前页码 |
| pageSize | number | 20 | 每页数量（最大100） |

分页响应格式：

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

---

### H. 日期时间格式说明

| 场景 | 格式 | 示例 |
|------|------|------|
| 日期 | YYYY-MM-DD | 2024-01-15 |
| 时间 | HH:mm:ss | 14:30:00 |
| 日期时间 | YYYY-MM-DD HH:mm:ss | 2024-01-15 14:30:00 |
| ISO时间 | ISO 8601 | 2024-01-15T14:30:00.000Z |

---

**文档版本**: v4.1  
**最后更新**: 2026年2月  
**接口模块**: 用户、歌曲、点歌请求、祝福、管理员、播放排期、数据统计、首页、播放控制、系统健康检查、文件上传、批量操作、管理员管理、敏感词管理（共14个模块）

---

## 更新日志

### v4.1 (2026-02)
- **完善用户学生字段设计**：
  - 新增 `student_id`（学号）、`real_name`（真实姓名）、`gender`（性别）、`college`（学院）、`major`（专业）、`grade`（年级）、`enrollment_year`（入学年份）字段
  - 新增 `password` 字段支持学号密码登录
  - 更新所有用户相关API接口的请求参数和返回示例
  - 新增学生字段数据规范说明（附录E）
  - 新增数据验证规则和字段关联关系说明
  - 用户列表API新增学院、专业、年级、入学年份筛选参数

### v4.0 (2026-02)
- 新增文件上传模块API（图片、音频、文件上传）
- 新增批量操作模块API（导入导出功能）
- 新增管理员管理模块API（管理员列表、登录日志、操作日志）
- 新增敏感词管理模块API（敏感词检测、管理、导入）
- 新增首页配置管理API（轮播图、公告、推荐歌曲的增删改查）
- 完善错误码说明，新增业务错误码分类
- 新增字段命名规范说明
- 新增分页参数和日期时间格式说明
- 新增管理员角色和敏感词级别说明

### v3.0 (2026-02)
- 新增播放控制模块API
- 新增系统健康检查API
- 完善数据统计模块API
- 新增音乐平台标识说明

### v2.0 (2024-01)
- 新增首页模块API
- 新增播放排期模块API
- 完善用户模块API
- 完善管理员模块API

### v1.0 (2024-01)
- 初始版本
- 用户模块API
- 歌曲模块API
- 点歌请求模块API
- 祝福模块API
- 管理员模块API
