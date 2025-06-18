/**
 * WebSocket客户端测试脚本
 * 用于测试WebSocket连接和积分余额实时推送
 * 
 * 使用方法：
 * node test-websocket.js <token>
 */

const WebSocket = require('ws');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 获取命令行参数
const token = process.argv[2];
if (!token) {
  console.error('请提供JWT令牌');
  console.error('用法: node test-websocket.js <token>');
  process.exit(1);
}

// WebSocket服务器URL
const WS_URL = process.env.WS_URL || 'ws://localhost:3000';

// 连接WebSocket服务器
console.log(`正在连接到WebSocket服务器: ${WS_URL}`);
const ws = new WebSocket(`${WS_URL}?token=${token}`);

// 连接打开事件
ws.on('open', () => {
  console.log('已连接到WebSocket服务器');
  
  // 定期发送ping消息，保持连接活跃
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
  }, 30000);
});

// 接收消息事件
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    
    // 根据消息类型处理
    switch (message.type) {
      case 'connected':
        console.log(`连接成功: 用户ID = ${message.userId}`);
        break;
        
      case 'balance_update':
        console.log('收到积分余额更新:');
        console.log(`- 总积分: ${message.data.total_credits}`);
        console.log('- 积分明细:');
        message.data.balances.forEach(balance => {
          console.log(`  * ${balance.credit_type}: ${balance.amount} (过期时间: ${new Date(balance.expiry_date).toLocaleString()})`);
        });
        break;
        
      case 'pong':
        console.log(`收到pong响应: ${new Date(message.timestamp).toLocaleString()}`);
        break;
        
      case 'error':
        console.error(`错误: ${message.message}`);
        break;
        
      default:
        console.log('收到未知类型的消息:', message);
    }
  } catch (err) {
    console.error('解析消息失败:', err.message);
    console.error('原始消息:', data);
  }
});

// 连接错误事件
ws.on('error', (error) => {
  console.error('WebSocket连接错误:', error.message);
});

// 连接关闭事件
ws.on('close', (code, reason) => {
  console.log(`WebSocket连接已关闭: 代码=${code}, 原因=${reason}`);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('正在关闭WebSocket连接...');
  
  if (ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
  
  process.exit(0);
}); 