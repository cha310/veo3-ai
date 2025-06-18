# 积分系统API设计

## 1. API概览

积分系统API主要分为以下几个模块：

1. 积分查询API - 获取用户积分信息
2. 积分消费API - 消费用户积分
3. 积分发放API - 向用户发放积分
4. 积分记录API - 查询积分变动记录
5. 订阅管理API - 管理用户订阅与积分关系

## 2. 基础路径

所有积分系统API都使用以下基础路径：

```
/api/credits
```

## 3. 认证与授权

所有API都需要认证，使用Bearer Token方式：

```
Authorization: Bearer <token>
```

不同API根据用户角色有不同的权限限制：
- 普通用户：只能访问自己的积分信息
- 管理员：可以访问和修改所有用户的积分信息

## 4. API详细设计

### 4.1 积分查询API

#### 4.1.1 获取当前用户积分余额

```
GET /api/credits/balance
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "total_credits": 1200,
    "balances": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "amount": 500,
        "source": "subscription",
        "source_id": "sub_123456",
        "expires_at": "2023-12-31T23:59:59Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "amount": 700,
        "source": "purchase",
        "source_id": "purchase_789012",
        "expires_at": null
      }
    ]
  }
}
```

#### 4.1.2 获取特定用户积分余额（管理员专用）

```
GET /api/credits/balance/:userId
```

**参数**：
- `userId`: 用户ID

**响应格式**：同4.1.1

### 4.2 积分消费API

#### 4.2.1 消费积分

```
POST /api/credits/consume
```

**请求体**：

```json
{
  "amount": 330,
  "type": "video_generation",
  "source": "veo-3",
  "description": "生成8秒视频"
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "transaction_id": "550e8400-e29b-41d4-a716-446655440002",
    "amount": 330,
    "balance_after": 870,
    "created_at": "2023-06-15T10:30:00Z"
  }
}
```

#### 4.2.2 检查积分是否足够

```
GET /api/credits/check?amount=330&model=veo-3
```

**参数**：
- `amount`: 需要消费的积分数量
- `model`: 可选，模型ID，用于自动计算所需积分

**响应示例**：

```json
{
  "success": true,
  "data": {
    "has_enough_credits": true,
    "required_credits": 330,
    "current_credits": 1200,
    "credits_after": 870
  }
}
```

### 4.3 积分发放API

#### 4.3.1 发放订阅积分（系统内部调用）

```
POST /api/credits/add/subscription
```

**请求体**：

```json
{
  "user_id": "auth0|123456789",
  "amount": 1200,
  "subscription_id": "sub_123456",
  "plan_id": "pro",
  "expires_in": 90
}
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "transaction_id": "550e8400-e29b-41d4-a716-446655440003",
    "amount": 1200,
    "balance_after": 2070,
    "expires_at": "2023-09-13T10:30:00Z"
  }
}
```

#### 4.3.2 发放购买积分（系统内部调用）

```
POST /api/credits/add/purchase
```

**请求体**：

```json
{
  "user_id": "auth0|123456789",
  "amount": 5000,
  "package_id": "creator",
  "payment_id": "pi_3NvdFGHi8JK6vyQp1KOjQWzD"
}
```

**响应示例**：同4.3.1

#### 4.3.3 管理员手动发放积分

```
POST /api/credits/add/manual
```

**请求体**：

```json
{
  "user_id": "auth0|123456789",
  "amount": 500,
  "reason": "补偿因系统错误导致的积分损失",
  "expires_in": 30
}
```

**响应示例**：同4.3.1

### 4.4 积分记录API

#### 4.4.1 获取当前用户积分交易记录

```
GET /api/credits/transactions?limit=20&offset=0&type=all
```

**参数**：
- `limit`: 每页记录数，默认20
- `offset`: 偏移量，默认0
- `type`: 交易类型，可选值：all, consumption, subscription, purchase, adjustment, expiration
- `start_date`: 开始日期，格式：YYYY-MM-DD
- `end_date`: 结束日期，格式：YYYY-MM-DD

**响应示例**：

```json
{
  "success": true,
  "data": {
    "total": 45,
    "transactions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "amount": -330,
        "balance_after": 870,
        "type": "consumption",
        "source": "veo-3",
        "description": "生成8秒视频",
        "created_at": "2023-06-15T10:30:00Z"
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "amount": 1200,
        "balance_after": 1200,
        "type": "subscription",
        "source": "sub_123456",
        "description": "Pro订阅月度积分",
        "created_at": "2023-06-01T00:00:00Z",
        "expires_at": "2023-08-30T00:00:00Z"
      }
    ]
  }
}
```

#### 4.4.2 获取特定用户积分交易记录（管理员专用）

```
GET /api/credits/transactions/:userId?limit=20&offset=0&type=all
```

**参数**：同4.4.1

**响应格式**：同4.4.1

### 4.5 订阅管理API

#### 4.5.1 获取当前用户订阅信息

```
GET /api/credits/subscription
```

**响应示例**：

```json
{
  "success": true,
  "data": {
    "has_active_subscription": true,
    "subscription": {
      "id": "sub_123456",
      "plan_id": "pro",
      "status": "active",
      "current_period_start": "2023-06-01T00:00:00Z",
      "current_period_end": "2023-07-01T00:00:00Z",
      "monthly_credits": 1200,
      "next_credits_date": "2023-07-01T00:00:00Z"
    }
  }
}
```

#### 4.5.2 订阅Webhook处理（系统内部调用）

```
POST /api/credits/subscription/webhook
```

**请求体**：根据支付提供商（如Stripe）的webhook格式

**响应**：HTTP 200

## 5. 错误处理

所有API使用统一的错误响应格式：

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "用户积分不足",
    "details": {
      "required": 330,
      "available": 200
    }
  }
}
```

常见错误代码：

| 错误代码 | 描述 | HTTP状态码 |
|---------|------|-----------|
| UNAUTHORIZED | 未授权访问 | 401 |
| FORBIDDEN | 权限不足 | 403 |
| NOT_FOUND | 资源不存在 | 404 |
| INSUFFICIENT_CREDITS | 积分不足 | 400 |
| INVALID_PARAMETERS | 参数无效 | 400 |
| INTERNAL_ERROR | 服务器内部错误 | 500 |

## 6. 实现技术

API实现采用以下技术：

- API框架：Express.js
- 数据库：PostgreSQL (Supabase)
- 认证：Supabase Auth
- 缓存：Redis (可选)

## 7. 安全考虑

1. 所有API都必须通过HTTPS访问
2. 敏感API（如积分发放）需要额外的权限验证
3. 实施速率限制，防止API滥用
4. 记录所有API调用日志，便于审计
5. 实施数据验证，防止注入攻击

## 8. 性能优化

1. 缓存用户积分余额，减少数据库查询
2. 使用数据库事务确保积分操作的原子性
3. 批量处理订阅积分发放
4. 异步处理非实时性操作
5. 定期清理过期数据 