/**
 * 弹性测试脚本
 * 用于模拟断网和服务器重启等异常场景，测试重连与降级逻辑
 * 
 * 使用方法：
 * node test-resilience.js <token> <scenario>
 * 
 * 参数说明：
 * - token: JWT令牌
 * - scenario: 测试场景 network-outage|server-restart|connection-drop
 */

const WebSocket = require('ws');
const fetch = require('node-fetch');
const EventSource = require('eventsource');
const dotenv = require('dotenv');
const { spawn } = require('child_process');

// 加载环境变量
dotenv.config();

// 获取命令行参数
const token = process.argv[2];
const scenario = process.argv[3];

if (!token || !scenario) {
  console.error('请提供JWT令牌和测试场景');
  console.error('用法: node test-resilience.js <token> <scenario>');
  console.error('可用场景: network-outage, server-restart, connection-drop');
  process.exit(1);
}

if (!['network-outage', 'server-restart', 'connection-drop'].includes(scenario)) {
  console.error('无效的场景，必须是 network-outage|server-restart|connection-drop');
  process.exit(1);
}

// 服务器URL
const API_URL = process.env.API_URL || 'http://localhost:3000';
const WS_URL = process.env.WS_URL || 'ws://localhost:3000';

// 连接状态
const connectionState = {
  websocket: {
    connected: false,
    reconnectAttempts: 0,
    lastMessage: null
  },
  sse: {
    connected: false,
    reconnectAttempts: 0,
    lastMessage: null
  }
};

// 测试结果
const testResults = {
  websocketReconnected: false,
  sseReconnected: false,
  degradedToSSE: false,
  degradedToPolling: false,
  recoveryTime: null
};

// 模拟断网
async function simulateNetworkOutage() {
  console.log('\n===== 模拟网络中断 =====');
  console.log('1. 建立初始连接');
  console.log('2. 等待连接稳定（5秒）');
  console.log('3. 模拟网络中断（关闭所有连接）');
  console.log('4. 等待重连尝试（10秒）');
  console.log('5. 恢复网络连接');
  console.log('6. 验证重连成功');
  
  // 建立WebSocket连接
  const ws = new WebSocket(`${WS_URL}?token=${token}`);
  
  ws.on('open', () => {
    connectionState.websocket.connected = true;
    console.log('WebSocket连接已建立');
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      connectionState.websocket.lastMessage = message;
      console.log(`收到WebSocket消息: ${message.type}`);
    } catch (err) {
      console.error('解析WebSocket消息失败:', err.message);
    }
  });
  
  ws.on('close', () => {
    connectionState.websocket.connected = false;
    console.log('WebSocket连接已关闭');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket错误:', error.message);
  });
  
  // 建立SSE连接
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  const eventSource = new EventSource(`${API_URL}/api/credits/sse`, { headers });
  
  eventSource.onopen = () => {
    connectionState.sse.connected = true;
    console.log('SSE连接已建立');
  };
  
  eventSource.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      connectionState.sse.lastMessage = message;
      console.log(`收到SSE消息: ${message.type}`);
    } catch (err) {
      console.error('解析SSE消息失败:', err.message);
    }
  };
  
  eventSource.onerror = (error) => {
    connectionState.sse.connected = false;
    console.error('SSE错误');
  };
  
  // 等待连接稳定
  console.log('等待连接稳定...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 模拟网络中断
  console.log('模拟网络中断...');
  ws.close();
  eventSource.close();
  
  // 等待重连尝试
  console.log('等待重连尝试...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // 检查是否重连成功
  // 这里需要前端实现自动重连逻辑
  console.log('检查重连状态...');
  
  // 注意：在实际场景中，这里需要检查前端的重连逻辑是否正常工作
  // 由于这是一个模拟测试，我们只能提供测试框架
  
  console.log('测试完成，请检查前端重连逻辑是否正常工作');
}

// 模拟服务器重启
async function simulateServerRestart() {
  console.log('\n===== 模拟服务器重启 =====');
  console.log('1. 建立初始连接');
  console.log('2. 等待连接稳定（5秒）');
  console.log('3. 模拟服务器重启（重启Node.js服务）');
  console.log('4. 等待服务器重启完成（10秒）');
  console.log('5. 验证重连成功');
  
  // 建立WebSocket连接
  const ws = new WebSocket(`${WS_URL}?token=${token}`);
  
  ws.on('open', () => {
    connectionState.websocket.connected = true;
    console.log('WebSocket连接已建立');
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      connectionState.websocket.lastMessage = message;
      console.log(`收到WebSocket消息: ${message.type}`);
    } catch (err) {
      console.error('解析WebSocket消息失败:', err.message);
    }
  });
  
  ws.on('close', () => {
    connectionState.websocket.connected = false;
    console.log('WebSocket连接已关闭');
  });
  
  // 等待连接稳定
  console.log('等待连接稳定...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 模拟服务器重启
  console.log('模拟服务器重启...');
  console.log('注意：这需要实际重启服务器，此测试脚本仅提供测试框架');
  console.log('请手动重启服务器，然后继续观察前端重连行为');
  
  // 在实际场景中，可以通过以下方式重启服务器：
  // 1. 使用PM2: pm2 restart <id>
  // 2. 使用Docker: docker restart <container>
  // 3. 直接终止进程并重启
  
  // 等待服务器重启完成
  console.log('等待服务器重启完成...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // 检查是否重连成功
  console.log('检查重连状态...');
  console.log('测试完成，请检查前端重连逻辑是否正常工作');
}

// 模拟连接断开
async function simulateConnectionDrop() {
  console.log('\n===== 模拟连接断开 =====');
  console.log('1. 建立初始WebSocket连接');
  console.log('2. 等待连接稳定（5秒）');
  console.log('3. 模拟WebSocket连接断开');
  console.log('4. 验证是否降级到SSE');
  console.log('5. 模拟SSE连接断开');
  console.log('6. 验证是否降级到轮询');
  
  // 建立WebSocket连接
  const ws = new WebSocket(`${WS_URL}?token=${token}`);
  
  ws.on('open', () => {
    connectionState.websocket.connected = true;
    console.log('WebSocket连接已建立');
  });
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      connectionState.websocket.lastMessage = message;
      console.log(`收到WebSocket消息: ${message.type}`);
    } catch (err) {
      console.error('解析WebSocket消息失败:', err.message);
    }
  });
  
  ws.on('close', () => {
    connectionState.websocket.connected = false;
    console.log('WebSocket连接已关闭');
  });
  
  // 等待连接稳定
  console.log('等待连接稳定...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 模拟WebSocket连接断开
  console.log('模拟WebSocket连接断开...');
  ws.close();
  
  // 等待降级到SSE
  console.log('等待降级到SSE...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 注意：在实际场景中，这里需要检查前端是否已降级到SSE
  console.log('请检查前端是否已降级到SSE');
  
  // 模拟SSE连接断开
  console.log('模拟SSE连接断开...');
  console.log('注意：这需要在前端模拟SSE连接断开');
  
  // 等待降级到轮询
  console.log('等待降级到轮询...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 注意：在实际场景中，这里需要检查前端是否已降级到轮询
  console.log('请检查前端是否已降级到轮询');
  
  console.log('测试完成，请检查前端降级逻辑是否正常工作');
}

// 主函数
async function main() {
  try {
    console.log(`开始弹性测试，场景: ${scenario}`);
    
    switch (scenario) {
      case 'network-outage':
        await simulateNetworkOutage();
        break;
      case 'server-restart':
        await simulateServerRestart();
        break;
      case 'connection-drop':
        await simulateConnectionDrop();
        break;
    }
    
  } catch (err) {
    console.error('测试过程出错:', err.message);
  }
}

// 执行主函数
main(); 