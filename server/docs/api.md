# API 文档

## 基础信息

- 基础URL: `http://localhost:3000/api`
- 所有请求和响应均使用 JSON 格式
- 认证请求需要在 Header 中包含 `Authorization: Bearer <token>`

## 响应格式

成功响应：
```json
{
    "success": true,
    "message": "操作成功",
    "data": {}
}
```

错误响应：
```json
{
    "success": false,
    "message": "错误信息",
    "error": "详细错误信息"
}
```

## 用户接口

### 注册用户

- 路径: `/users/register`
- 方法: `POST`
- 权限: 公开

请求体：
```json
{
    "username": "用户名",
    "email": "邮箱",
    "password": "密码"
}
```

### 用户登录

- 路径: `/users/login`
- 方法: `POST`
- 权限: 公开

请求体：
```json
{
    "username": "用户名",
    "password": "密码"
}
```

### 获取用户信息

- 路径: `/users/profile`
- 方法: `GET`
- 权限: 需要认证

### 更新用户设置

- 路径: `/users/settings`
- 方法: `PUT`
- 权限: 需要认证

请求体：
```json
{
    "settings": {
        "theme": "light",
        "shortcuts": {
            "createCard": "Ctrl+N",
            "exportImage": "Ctrl+E"
        }
    }
}
```

## 模板接口

### 获取模板市场列表

- 路径: `/templates/market`
- 方法: `GET`
- 权限: 公开

查询参数：
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)
- `sort`: 排序方式 (默认: -rating.score)

### 搜索模板

- 路径: `/templates/search`
- 方法: `GET`
- 权限: 公开

查询参数：
- `keyword`: 搜索关键词
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10)

### 创建模板

- 路径: `/templates`
- 方法: `POST`
- 权限: 需要认证

请求体：
```json
{
    "name": "模板名称",
    "description": "模板描述",
    "thumbnail": "缩略图URL",
    "style": {
        "width": "800px",
        "height": "400px",
        "background": "#ffffff",
        "fontFamily": "inherit",
        "fontSize": "24px",
        "color": "#333333",
        "padding": "40px",
        "borderRadius": "8px",
        "boxShadow": "0 2px 8px rgba(0,0,0,0.1)"
    },
    "content": {
        "layout": "center",
        "quote": "",
        "author": "",
        "source": ""
    }
}
```

### 评分模板

- 路径: `/templates/:templateId/rate`
- 方法: `POST`
- 权限: 需要认证

请求体：
```json
{
    "score": 5
}
```

### 分享/取消分享模板

- 路径: `/templates/:templateId/share`
- 方法: `PUT`
- 权限: 需要认证
