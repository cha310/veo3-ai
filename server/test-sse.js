/**
 * SSE客户端测试脚本
 * 用于测试SSE连接和积分余额实时推送
 * 
 * 使用方法：
 * node test-sse.js <token>
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');
const EventSource = require('eventsource');

// 加载环境变量
dotenv.config();

// 获取命令行参数
const token = process.argv[2];
if (!token) {
  console.error('请提供JWT令牌');
  console.error('用法: node test-sse.js <token>');
  process.exit(1);
}

// SSE服务器URL
const API_URL = process.env.API_URL || 'http://localhost:3000';
const SSE_URL = `${API_URL}/api/credits/sse`;

console.log(`正在连接到SSE服务器: ${SSE_URL}`);

// 创建EventSource连接
const headers = {
  'Authorization': `Bearer ${token}`
};

const eventSource = new EventSource(SSE_URL, { headers });

// 连接打开事件
eventSource.onopen = () => {
  console.log('已连接到SSE服务器');
};

// 接收消息事件
eventSource.onmessage = (event) => {
  try {
    const message = JSON.parse(event.data);
    
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
        
      case 'ping':
        console.log(`收到ping消息: ${new Date(message.timestamp).toLocaleString()}`);
        break;
        
      case 'error':
        console.error(`错误: ${message.message}`);
        break;
        
      default:
        console.log('收到未知类型的消息:', message);
    }
  } catch (err) {
    console.error('解析消息失败:', err.message);
    console.error('原始消息:', event.data);
  }
};

// 连接错误事件
eventSource.onerror = (error) => {
  console.error('SSE连接错误:', error);
  
  // 尝试重新连接
  console.log('尝试重新连接...');
};

// 处理进程退出
process.on('SIGINT', () => {
  console.log('正在关闭SSE连接...');
  
  eventSource.close();
  
  process.exit(0);
}); 