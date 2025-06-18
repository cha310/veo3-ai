/**
 * 综合测试脚本
 * 用于测试WebSocket、SSE和轮询三种模式
 * 
 * 使用方法：
 * node test-all-modes.js <token> [mode]
 * 
 * 参数说明：
 * - token: JWT令牌
 * - mode: 可选，指定测试模式 websocket|sse|polling|all，默认为all
 */

const WebSocket = require('ws');
const fetch = require('node-fetch');
const EventSource = require('eventsource');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 获取命令行参数
const token = process.argv[2];
const mode = process.argv[3] || 'all';

if (!token) {
  console.error('请提供JWT令牌');
  console.error('用法: node test-all-modes.js <token> [mode]');
  process.exit(1);
}

if (!['websocket', 'sse', 'polling', 'all'].includes(mode)) {
  console.error('无效的模式，必须是 websocket|sse|polling|all');
  process.exit(1);
}

// 服务器URL
const API_URL = process.env.API_URL || 'http://localhost:3000';
const WS_URL = process.env.WS_URL || 'ws://localhost:3000';

// 测试结果
const results = {
  websocket: { success: false, latency: null, error: null },
  sse: { success: false, latency: null, error: null },
  polling: { success: false, latency: null, error: null }
};

// 测试WebSocket
async function testWebSocket() {
  return new Promise((resolve) => {
    console.log('\n===== 测试WebSocket连接 =====');
    console.log(`连接URL: ${WS_URL}?token=***`);
    
    const startTime = Date.now();
    let timeoutId;
    
    try {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      
      // 设置超时
      timeoutId = setTimeout(() => {
        ws.close();
        results.websocket.error = '连接超时';
        console.error('WebSocket连接超时');
        resolve();
      }, 10000);
      
      ws.on('open', () => {
        console.log('WebSocket连接成功');
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          
          if (message.type === 'connected') {
            console.log(`连接已认证: 用户ID = ${message.userId}`);
          } else if (message.type === 'balance_update') {
            const latency = Date.now() - startTime;
            results.websocket.success = true;
            results.websocket.latency = latency;
            
            console.log(`收到积分余额更新，延迟: ${latency}ms`);
            console.log(`- 总积分: ${message.data.total_credits}`);
            console.log('- 积分明细:');
            message.data.balances.forEach(balance => {
              console.log(`  * ${balance.credit_type}: ${balance.amount} (过期时间: ${new Date(balance.expiry_date).toLocaleString()})`);
            });
            
            clearTimeout(timeoutId);
            ws.close();
            resolve();
          }
        } catch (err) {
          console.error('解析消息失败:', err.message);
        }
      });
      
      ws.on('error', (error) => {
        results.websocket.error = error.message;
        console.error('WebSocket连接错误:', error.message);
        clearTimeout(timeoutId);
        resolve();
      });
      
      ws.on('close', () => {
        if (!results.websocket.success) {
          results.websocket.error = '连接关闭，未收到余额更新';
        }
        resolve();
      });
    } catch (err) {
      results.websocket.error = err.message;
      console.error('WebSocket测试出错:', err.message);
      clearTimeout(timeoutId);
      resolve();
    }
  });
}

// 测试SSE
async function testSSE() {
  return new Promise((resolve) => {
    console.log('\n===== 测试SSE连接 =====');
    console.log(`连接URL: ${API_URL}/api/credits/sse`);
    
    const startTime = Date.now();
    let timeoutId;
    
    try {
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      const eventSource = new EventSource(`${API_URL}/api/credits/sse`, { headers });
      
      // 设置超时
      timeoutId = setTimeout(() => {
        eventSource.close();
        results.sse.error = '连接超时';
        console.error('SSE连接超时');
        resolve();
      }, 10000);
      
      eventSource.onopen = () => {
        console.log('SSE连接成功');
      };
      
      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'connected') {
            console.log(`连接已认证: 用户ID = ${message.userId}`);
          } else if (message.type === 'balance_update') {
            const latency = Date.now() - startTime;
            results.sse.success = true;
            results.sse.latency = latency;
            
            console.log(`收到积分余额更新，延迟: ${latency}ms`);
            console.log(`- 总积分: ${message.data.total_credits}`);
            console.log('- 积分明细:');
            message.data.balances.forEach(balance => {
              console.log(`  * ${balance.credit_type}: ${balance.amount} (过期时间: ${new Date(balance.expiry_date).toLocaleString()})`);
            });
            
            clearTimeout(timeoutId);
            eventSource.close();
            resolve();
          }
        } catch (err) {
          console.error('解析消息失败:', err.message);
        }
      };
      
      eventSource.onerror = (error) => {
        results.sse.error = '连接错误';
        console.error('SSE连接错误:', error);
        clearTimeout(timeoutId);
        eventSource.close();
        resolve();
      };
    } catch (err) {
      results.sse.error = err.message;
      console.error('SSE测试出错:', err.message);
      clearTimeout(timeoutId);
      resolve();
    }
  });
}

// 测试轮询
async function testPolling() {
  console.log('\n===== 测试轮询接口 =====');
  console.log(`轮询URL: ${API_URL}/api/credits/balance/poll`);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_URL}/api/credits/balance/poll`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      results.polling.error = `${response.status} ${response.statusText}: ${text}`;
      console.error(`轮询失败: ${response.status} ${response.statusText}`);
      console.error(`响应内容: ${text}`);
      return;
    }
    
    const data = await response.json();
    const latency = Date.now() - startTime;
    results.polling.success = true;
    results.polling.latency = latency;
    
    console.log(`轮询成功，延迟: ${latency}ms`);
    console.log(`- 总积分: ${data.total_credits}`);
    console.log('- 积分明细:');
    data.balances.forEach(balance => {
      console.log(`  * ${balance.credit_type}: ${balance.amount} (过期时间: ${new Date(balance.expiry_date).toLocaleString()})`);
    });
    console.log(`- 建议轮询间隔: ${data.poll_interval || 'N/A'}ms`);
  } catch (err) {
    results.polling.error = err.message;
    console.error('轮询测试出错:', err.message);
  }
}

// 模拟积分变动
async function simulateCreditChange() {
  try {
    console.log('\n===== 模拟积分变动 =====');
    
    // 提取用户ID（从令牌中）
    let userId;
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        userId = payload.sub;
      }
    } catch (e) {
      console.error('无法从令牌中提取用户ID:', e.message);
    }
    
    if (!userId) {
      console.log('无法从令牌中提取用户ID，请手动指定用户ID');
      return;
    }
    
    console.log(`用户ID: ${userId}`);
    console.log('正在模拟积分变动...');
    
    // 调用模拟脚本
    const { spawn } = require('child_process');
    const amount = Math.floor(Math.random() * 100) + 1; // 随机1-100的积分
    
    const child = spawn('node', [
      'simulate-credit-change.js',
      userId,
      amount.toString(),
      'test'
    ]);
    
    child.stdout.on('data', (data) => {
      console.log(`模拟输出: ${data}`);
    });
    
    child.stderr.on('data', (data) => {
      console.error(`模拟错误: ${data}`);
    });
    
    await new Promise((resolve) => {
      child.on('close', (code) => {
        console.log(`模拟进程退出，退出码: ${code}`);
        resolve();
      });
    });
  } catch (err) {
    console.error('模拟积分变动失败:', err.message);
  }
}

// 显示测试结果
function showResults() {
  console.log('\n===== 测试结果汇总 =====');
  
  console.log('WebSocket:');
  console.log(`- 状态: ${results.websocket.success ? '成功' : '失败'}`);
  console.log(`- 延迟: ${results.websocket.latency !== null ? `${results.websocket.latency}ms` : 'N/A'}`);
  if (results.websocket.error) {
    console.log(`- 错误: ${results.websocket.error}`);
  }
  
  console.log('\nSSE:');
  console.log(`- 状态: ${results.sse.success ? '成功' : '失败'}`);
  console.log(`- 延迟: ${results.sse.latency !== null ? `${results.sse.latency}ms` : 'N/A'}`);
  if (results.sse.error) {
    console.log(`- 错误: ${results.sse.error}`);
  }
  
  console.log('\n轮询:');
  console.log(`- 状态: ${results.polling.success ? '成功' : '失败'}`);
  console.log(`- 延迟: ${results.polling.latency !== null ? `${results.polling.latency}ms` : 'N/A'}`);
  if (results.polling.error) {
    console.log(`- 错误: ${results.polling.error}`);
  }
  
  // 延迟比较
  if (results.websocket.success && results.sse.success && results.polling.success) {
    console.log('\n延迟比较:');
    const modes = [
      { name: 'WebSocket', latency: results.websocket.latency },
      { name: 'SSE', latency: results.sse.latency },
      { name: 'Polling', latency: results.polling.latency }
    ].sort((a, b) => a.latency - b.latency);
    
    modes.forEach((mode, index) => {
      console.log(`${index + 1}. ${mode.name}: ${mode.latency}ms`);
    });
  }
}

// 主函数
async function main() {
  try {
    console.log('开始综合测试...');
    console.log(`测试模式: ${mode}`);
    
    if (mode === 'websocket' || mode === 'all') {
      await testWebSocket();
    }
    
    if (mode === 'sse' || mode === 'all') {
      await testSSE();
    }
    
    if (mode === 'polling' || mode === 'all') {
      await testPolling();
    }
    
    // 显示测试结果
    showResults();
    
    process.exit(0);
  } catch (err) {
    console.error('测试过程出错:', err.message);
    process.exit(1);
  }
}

// 执行主函数
main(); 