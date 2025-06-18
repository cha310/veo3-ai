const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const redisPubSub = require('./redis-pubsub');

// 从环境变量读取Supabase配置
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('[WebSocket] 未检测到 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 环境变量，WebSocket服务将无法正常工作。');
}

if (!JWT_SECRET) {
  console.warn('[WebSocket] 未检测到 JWT_SECRET 或 SUPABASE_JWT_SECRET 环境变量，WebSocket认证将无法正常工作。');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 存储所有已连接的客户端
// 格式: { userId: [websocket, websocket, ...] }
const clients = new Map();

// 初始化WebSocket服务器
function initWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });
  
  console.log('[WebSocket] WebSocket服务器已初始化');

  wss.on('connection', async (ws, req) => {
    // 解析URL中的token参数
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');
    
    // 验证token
    try {
      if (!token) {
        ws.send(JSON.stringify({ type: 'error', message: '未提供认证Token' }));
        return ws.close();
      }
      
      // 验证JWT Token
      let userId;
      try {
        // 尝试使用JWT直接验证
        if (JWT_SECRET) {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.sub;
        } else {
          // 回退到Supabase验证
          const { data, error } = await supabase.auth.getUser(token);
          if (error || !data?.user) {
            throw new Error('无效的Token');
          }
          userId = data.user.id;
        }
      } catch (err) {
        console.error('[WebSocket] Token验证失败:', err.message);
        ws.send(JSON.stringify({ type: 'error', message: '无效的Token' }));
        return ws.close();
      }
      
      // 将连接与用户关联
      if (!clients.has(userId)) {
        clients.set(userId, []);
      }
      clients.get(userId).push(ws);
      
      console.log(`[WebSocket] 用户 ${userId} 已连接，当前连接数: ${getConnectedClientsCount()}`);
      
      // 发送连接成功消息
      ws.send(JSON.stringify({ 
        type: 'connected', 
        message: '连接成功',
        userId
      }));
      
      // 立即发送当前积分余额
      sendUserBalance(userId);
      
      // 处理连接关闭
      ws.on('close', () => {
        removeClient(userId, ws);
        console.log(`[WebSocket] 用户 ${userId} 已断开连接，当前连接数: ${getConnectedClientsCount()}`);
      });
      
      // 处理错误
      ws.on('error', (error) => {
        console.error(`[WebSocket] 用户 ${userId} 连接错误:`, error.message);
        removeClient(userId, ws);
      });
      
      // 处理消息
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          
          // 处理ping消息，保持连接活跃
          if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          }
          
          // 其他消息类型可以在这里处理...
          
        } catch (err) {
          console.error('[WebSocket] 处理消息错误:', err.message);
        }
      });
      
    } catch (err) {
      console.error('[WebSocket] 处理连接错误:', err.message);
      ws.send(JSON.stringify({ type: 'error', message: '服务器内部错误' }));
      ws.close();
    }
  });
  
  // 初始化Redis Pub/Sub
  initRedisPubSub();
  
  return wss;
}

// 初始化Redis Pub/Sub
async function initRedisPubSub() {
  try {
    // 初始化Redis客户端
    await redisPubSub.initRedisClients();
    
    // 注册积分变动事件处理器
    redisPubSub.onCreditChange((data) => {
      console.log(`[WebSocket] 收到Redis积分变动事件: ${data.userId} ${data.amount} ${data.type}`);
      
      // 向用户发送积分余额更新
      sendUserBalance(data.userId);
    });
    
    console.log('[WebSocket] Redis Pub/Sub已初始化');
  } catch (err) {
    console.error('[WebSocket] 初始化Redis Pub/Sub失败:', err.message);
    console.log('[WebSocket] 将使用本地推送机制');
  }
}

// 移除客户端连接
function removeClient(userId, ws) {
  if (clients.has(userId)) {
    const userConnections = clients.get(userId);
    const index = userConnections.indexOf(ws);
    
    if (index !== -1) {
      userConnections.splice(index, 1);
    }
    
    // 如果用户没有活跃连接，则从Map中移除
    if (userConnections.length === 0) {
      clients.delete(userId);
    }
  }
}

// 获取当前连接的客户端总数
function getConnectedClientsCount() {
  let count = 0;
  for (const connections of clients.values()) {
    count += connections.length;
  }
  return count;
}

// 向指定用户发送积分余额更新
async function sendUserBalance(userId) {
  try {
    if (!clients.has(userId)) {
      return;
    }
    
    // 获取用户的积分余额
    const { data: totalRows, error: totalErr } = await supabase.rpc('get_user_credits', { p_user_id: userId });
    if (totalErr) {
      console.error('[WebSocket] 获取用户积分失败:', totalErr);
      return;
    }
    
    const totalCredits = Array.isArray(totalRows) && totalRows.length ? totalRows[0].credits : 0;
    
    // 获取用户的积分明细
    const { data: balances, error: balErr } = await supabase.rpc('get_user_credit_balances', { p_user_id: userId });
    if (balErr) {
      console.error('[WebSocket] 获取用户积分明细失败:', balErr);
      return;
    }
    
    // 构建消息
    const message = {
      type: 'balance_update',
      timestamp: Date.now(),
      data: {
        total_credits: totalCredits,
        balances: balances || []
      }
    };
    
    // 向用户的所有连接发送消息
    const userConnections = clients.get(userId);
    userConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
    
    console.log(`[WebSocket] 已向用户 ${userId} 发送积分余额更新`);
    
  } catch (err) {
    console.error('[WebSocket] 发送积分余额更新失败:', err.message);
  }
}

// 发布积分变动事件
async function publishCreditChange(userId, amount, type, metadata = {}) {
  try {
    // 尝试通过Redis发布事件
    if (redisPubSub.isRedisAvailable()) {
      await redisPubSub.publishCreditChange(userId, amount, type, metadata);
    } else {
      // Redis不可用，直接发送余额更新
      console.log(`[WebSocket] Redis不可用，直接发送余额更新: ${userId} ${amount} ${type}`);
      await sendUserBalance(userId);
    }
  } catch (err) {
    console.error('[WebSocket] 发布积分变动事件失败:', err.message);
    
    // 出错时，尝试直接发送余额更新
    try {
      await sendUserBalance(userId);
    } catch (sendErr) {
      console.error('[WebSocket] 直接发送余额更新也失败:', sendErr.message);
    }
  }
}

// 向所有连接的客户端广播消息
function broadcastMessage(message) {
  for (const [userId, connections] of clients.entries()) {
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }
}

// 关闭WebSocket服务
async function closeWebSocketServer() {
  try {
    // 关闭Redis连接
    await redisPubSub.closeRedisConnections();
    
    // 关闭所有WebSocket连接
    for (const connections of clients.values()) {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      });
    }
    
    // 清空客户端Map
    clients.clear();
    
    console.log('[WebSocket] WebSocket服务已关闭');
  } catch (err) {
    console.error('[WebSocket] 关闭WebSocket服务失败:', err.message);
  }
}

module.exports = {
  initWebSocketServer,
  sendUserBalance,
  publishCreditChange,
  broadcastMessage,
  getConnectedClientsCount,
  closeWebSocketServer
}; 