/**
 * WebSocket服务端测试脚本
 * 
 * 使用方法：
 * 1. 确保服务器已启动
 * 2. 运行 node test-websocket.js <JWT令牌>
 */

const WebSocket = require('ws');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 获取命令行参数
const token = process.argv[2];

if (!token) {
  console.error('错误: 缺少JWT令牌参数');
  console.error('用法: node test-websocket.js <JWT令牌>');
  process.exit(1);
}

// 服务器地址
const SERVER_URL = process.env.SERVER_URL || 'localhost:9000';
const WS_URL = `ws://${SERVER_URL}?token=${token}`;

console.log('正在连接WebSocket服务端...');
console.log(`URL: ${WS_URL.substring(0, WS_URL.indexOf('?') + 7)}...`);

// 创建WebSocket连接
const ws = new WebSocket(WS_URL);

// 连接打开时
ws.on('open', () => {
  console.log('连接成功！');
  
  // 每5秒发送一次ping消息
  setInterval(() => {
    ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    console.log('发送ping消息...');
  }, 5000);
});

// 接收消息
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data);
    console.log(`[${new Date().toISOString()}] 收到消息:`, message.type);
    console.log(JSON.stringify(message, null, 2));
    console.log('-----------------------------------');
  } catch (e) {
    console.error('解析消息失败:', e);
    console.error('原始数据:', data);
  }
});

// 连接关闭
ws.on('close', (code, reason) => {
  console.log(`连接关闭: ${code} ${reason}`);
  process.exit(0);
});

// 连接错误
ws.on('error', (error) => {
  console.error('连接错误:', error.message);
  process.exit(1);
});

// 捕获Ctrl+C，优雅地关闭连接
process.on('SIGINT', () => {
  console.log('正在关闭连接...');
  ws.close();
  setTimeout(() => {
    console.log('强制退出');
    process.exit(0);
  }, 1000);
}); 