/**
 * 轮询接口测试脚本
 * 
 * 使用方法：
 * 1. 确保服务器已启动
 * 2. 运行 node test-polling.js <JWT令牌>
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 获取命令行参数
const token = process.argv[2];

if (!token) {
  console.error('错误: 缺少JWT令牌参数');
  console.error('用法: node test-polling.js <JWT令牌>');
  process.exit(1);
}

// 服务器地址
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:9000';
const POLL_URL = `${SERVER_URL}/api/credits/balance/poll`;

console.log('开始轮询积分余额...');
console.log(`URL: ${POLL_URL}`);
console.log(`Token: ${token.substring(0, 10)}...`);

// 轮询函数
async function pollBalance() {
  try {
    const response = await fetch(POLL_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error(`请求失败: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`响应内容: ${text}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('轮询请求出错:', err);
    return null;
  }
}

// 开始轮询
let lastTotal = null;
let pollInterval = 10000; // 默认10秒

async function startPolling() {
  console.log('开始轮询...');
  
  while (true) {
    const result = await pollBalance();
    
    if (result && result.success) {
      const { total_credits, timestamp, poll_interval } = result.data;
      
      // 更新轮询间隔
      if (poll_interval) {
        pollInterval = poll_interval;
      }
      
      // 检查积分是否变化
      if (lastTotal !== null && lastTotal !== total_credits) {
        console.log(`[${new Date().toISOString()}] 积分已变化: ${lastTotal} -> ${total_credits}`);
      }
      
      console.log(`[${new Date().toISOString()}] 当前积分: ${total_credits}`);
      console.log(`服务器时间戳: ${new Date(timestamp).toISOString()}`);
      console.log(`建议轮询间隔: ${pollInterval}ms`);
      console.log('-----------------------------------');
      
      // 更新上次的积分
      lastTotal = total_credits;
    } else {
      console.log(`[${new Date().toISOString()}] 轮询失败`);
    }
    
    // 等待下一次轮询
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }
}

// 启动轮询
startPolling().catch(err => {
  console.error('轮询过程出错:', err);
  process.exit(1);
});

// 捕获Ctrl+C，优雅地退出
process.on('SIGINT', () => {
  console.log('停止轮询，正在退出...');
  process.exit(0);
}); 