/**
 * 轮询客户端测试脚本
 * 用于测试积分余额轮询接口
 * 
 * 使用方法：
 * node test-polling.js <token>
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 获取命令行参数
const token = process.argv[2];
if (!token) {
  console.error('请提供JWT令牌');
  console.error('用法: node test-polling.js <token>');
  process.exit(1);
}

// API服务器URL
const API_URL = process.env.API_URL || 'http://localhost:3000';
const POLL_URL = `${API_URL}/api/credits/balance/poll`;

console.log(`将轮询积分余额接口: ${POLL_URL}`);

// 轮询间隔（毫秒）
let pollInterval = 10000; // 默认10秒
let isPolling = true;

// 开始轮询
async function startPolling() {
  console.log('开始轮询...');
  
  while (isPolling) {
    try {
      // 发送请求
      const response = await fetch(POLL_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error(`轮询失败: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error(`响应内容: ${text}`);
        await sleep(pollInterval);
        continue;
      }
      
      // 解析响应
      const data = await response.json();
      
      // 更新轮询间隔（如果服务器提供）
      if (data.poll_interval) {
        pollInterval = data.poll_interval;
      }
      
      // 显示积分余额
      console.log(`[${new Date().toLocaleString()}] 轮询结果:`);
      console.log(`- 总积分: ${data.total_credits}`);
      console.log('- 积分明细:');
      data.balances.forEach(balance => {
        console.log(`  * ${balance.credit_type}: ${balance.amount} (过期时间: ${new Date(balance.expiry_date).toLocaleString()})`);
      });
      console.log(`- 下次轮询间隔: ${pollInterval}ms`);
      console.log('-----------------------------------');
      
    } catch (err) {
      console.error('轮询出错:', err.message);
    }
    
    // 等待指定时间后再次轮询
    await sleep(pollInterval);
  }
}

// 睡眠函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 处理进程退出
process.on('SIGINT', () => {
  console.log('正在停止轮询...');
  isPolling = false;
  process.exit(0);
});

// 启动轮询
startPolling(); 