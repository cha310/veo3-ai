/**
 * 监控脚本
 * 用于监控推送与轮询接口的延迟和错误率，及时报警
 * 
 * 使用方法：
 * node monitor.js <token> [interval]
 * 
 * 参数说明：
 * - token: JWT令牌
 * - interval: 可选，监控间隔（秒），默认为60
 */

const WebSocket = require('ws');
const fetch = require('node-fetch');
const EventSource = require('eventsource');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// 加载环境变量
dotenv.config();

// 获取命令行参数
const token = process.argv[2];
const interval = parseInt(process.argv[3] || '60', 10);

if (!token) {
  console.error('请提供JWT令牌');
  console.error('用法: node monitor.js <token> [interval]');
  process.exit(1);
}

// 服务器URL
const API_URL = process.env.API_URL || 'http://localhost:3000';
const WS_URL = process.env.WS_URL || 'ws://localhost:3000';

// 监控指标
const metrics = {
  websocket: {
    requests: 0,
    success: 0,
    errors: 0,
    totalLatency: 0,
    avgLatency: 0,
    lastLatency: 0,
    errorRate: 0,
    status: 'unknown'
  },
  sse: {
    requests: 0,
    success: 0,
    errors: 0,
    totalLatency: 0,
    avgLatency: 0,
    lastLatency: 0,
    errorRate: 0,
    status: 'unknown'
  },
  polling: {
    requests: 0,
    success: 0,
    errors: 0,
    totalLatency: 0,
    avgLatency: 0,
    lastLatency: 0,
    errorRate: 0,
    status: 'unknown'
  }
};

// 报警阈值
const thresholds = {
  errorRate: 0.1, // 10%
  latency: 1000   // 1秒
};

// 日志目录
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// 日志文件
const logFile = path.join(logDir, `monitor-${new Date().toISOString().split('T')[0]}.log`);

// 写入日志
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  fs.appendFileSync(logFile, logMessage);
}

// 发送报警
function sendAlert(message) {
  log(`[报警] ${message}`);
  
  // 这里可以集成实际的报警系统，如邮件、短信、Slack等
  // 例如：
  // sendEmail('alert@example.com', '积分系统监控报警', message);
  // sendSlackMessage('#alerts', message);
}

// 更新指标
function updateMetrics(type, success, latency, error = null) {
  metrics[type].requests++;
  
  if (success) {
    metrics[type].success++;
    metrics[type].totalLatency += latency;
    metrics[type].lastLatency = latency;
    metrics[type].avgLatency = metrics[type].totalLatency / metrics[type].success;
  } else {
    metrics[type].errors++;
    if (error) {
      log(`[${type}] 错误: ${error}`);
    }
  }
  
  metrics[type].errorRate = metrics[type].errors / metrics[type].requests;
  
  // 更新状态
  if (metrics[type].errorRate >= thresholds.errorRate) {
    metrics[type].status = 'error';
  } else if (metrics[type].avgLatency >= thresholds.latency) {
    metrics[type].status = 'warning';
  } else {
    metrics[type].status = 'ok';
  }
  
  // 检查是否需要报警
  if (metrics[type].status === 'error') {
    sendAlert(`${type} 错误率过高: ${(metrics[type].errorRate * 100).toFixed(2)}%`);
  } else if (metrics[type].status === 'warning') {
    sendAlert(`${type} 平均延迟过高: ${metrics[type].avgLatency.toFixed(2)}ms`);
  }
}

// 测试WebSocket
async function testWebSocket() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let timeoutId;
    
    try {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      
      // 设置超时
      timeoutId = setTimeout(() => {
        ws.close();
        updateMetrics('websocket', false, 0, '连接超时');
        resolve();
      }, 10000);
      
      ws.on('open', () => {
        log('[WebSocket] 连接成功');
      });
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          
          if (message.type === 'balance_update') {
            const latency = Date.now() - startTime;
            updateMetrics('websocket', true, latency);
            
            log(`[WebSocket] 收到余额更新，延迟: ${latency}ms`);
            
            clearTimeout(timeoutId);
            ws.close();
            resolve();
          }
        } catch (err) {
          updateMetrics('websocket', false, 0, `解析消息失败: ${err.message}`);
        }
      });
      
      ws.on('error', (error) => {
        updateMetrics('websocket', false, 0, error.message);
        clearTimeout(timeoutId);
        resolve();
      });
      
      ws.on('close', () => {
        if (metrics.websocket.requests === metrics.websocket.errors) {
          updateMetrics('websocket', false, 0, '连接关闭，未收到余额更新');
        }
        resolve();
      });
    } catch (err) {
      updateMetrics('websocket', false, 0, err.message);
      clearTimeout(timeoutId);
      resolve();
    }
  });
}

// 测试SSE
async function testSSE() {
  return new Promise((resolve) => {
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
        updateMetrics('sse', false, 0, '连接超时');
        resolve();
      }, 10000);
      
      eventSource.onopen = () => {
        log('[SSE] 连接成功');
      };
      
      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'balance_update') {
            const latency = Date.now() - startTime;
            updateMetrics('sse', true, latency);
            
            log(`[SSE] 收到余额更新，延迟: ${latency}ms`);
            
            clearTimeout(timeoutId);
            eventSource.close();
            resolve();
          }
        } catch (err) {
          updateMetrics('sse', false, 0, `解析消息失败: ${err.message}`);
        }
      };
      
      eventSource.onerror = (error) => {
        updateMetrics('sse', false, 0, '连接错误');
        clearTimeout(timeoutId);
        eventSource.close();
        resolve();
      };
    } catch (err) {
      updateMetrics('sse', false, 0, err.message);
      clearTimeout(timeoutId);
      resolve();
    }
  });
}

// 测试轮询
async function testPolling() {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_URL}/api/credits/balance/poll`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const text = await response.text();
      updateMetrics('polling', false, 0, `${response.status} ${response.statusText}: ${text}`);
      return;
    }
    
    await response.json();
    const latency = Date.now() - startTime;
    updateMetrics('polling', true, latency);
    
    log(`[轮询] 请求成功，延迟: ${latency}ms`);
  } catch (err) {
    updateMetrics('polling', false, 0, err.message);
  }
}

// 显示监控指标
function showMetrics() {
  log('\n===== 监控指标 =====');
  
  ['websocket', 'sse', 'polling'].forEach(type => {
    const m = metrics[type];
    log(`${type}:`);
    log(`- 状态: ${m.status}`);
    log(`- 请求数: ${m.requests}`);
    log(`- 成功率: ${m.requests > 0 ? ((m.success / m.requests) * 100).toFixed(2) : 0}%`);
    log(`- 错误率: ${m.requests > 0 ? (m.errorRate * 100).toFixed(2) : 0}%`);
    log(`- 平均延迟: ${m.avgLatency.toFixed(2)}ms`);
    log(`- 最近延迟: ${m.lastLatency}ms`);
  });
}

// 主循环
async function monitorLoop() {
  log(`开始监控循环，间隔: ${interval}秒`);
  
  while (true) {
    log(`\n[${new Date().toISOString()}] 执行监控检查...`);
    
    try {
      // 测试WebSocket
      await testWebSocket();
      
      // 测试SSE
      await testSSE();
      
      // 测试轮询
      await testPolling();
      
      // 显示监控指标
      showMetrics();
    } catch (err) {
      log(`监控检查出错: ${err.message}`);
    }
    
    // 等待下一次检查
    log(`等待 ${interval} 秒后进行下一次检查...`);
    await new Promise(resolve => setTimeout(resolve, interval * 1000));
  }
}

// 启动监控
monitorLoop().catch(err => {
  log(`监控脚本异常终止: ${err.message}`);
  process.exit(1);
}); 