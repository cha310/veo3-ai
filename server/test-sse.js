/**
 * SSE服务端测试脚本
 * 
 * 使用方法：
 * 1. 确保服务器已启动
 * 2. 运行 node test-sse.js <JWT令牌>
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 获取命令行参数
const token = process.argv[2];

if (!token) {
  console.error('错误: 缺少JWT令牌参数');
  console.error('用法: node test-sse.js <JWT令牌>');
  process.exit(1);
}

// 服务器地址
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:9000';

// 创建SSE连接
console.log('正在连接SSE服务端...');
console.log(`URL: ${SERVER_URL}/api/credits/sse`);
console.log(`Token: ${token.substring(0, 10)}...`);

// 由于Node.js没有内置的EventSource，我们使用fetch并手动处理响应流
async function connectSSE() {
  try {
    const response = await fetch(`${SERVER_URL}/api/credits/sse`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error(`连接失败: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(`响应内容: ${text}`);
      process.exit(1);
    }
    
    console.log('连接成功，等待事件...');
    
    // 处理响应流
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // 处理接收到的数据
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || ''; // 保留最后一个不完整的块
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6); // 去掉 "data: " 前缀
          try {
            const event = JSON.parse(data);
            console.log(`[${new Date().toISOString()}] 收到事件:`, event.type);
            console.log(JSON.stringify(event, null, 2));
            console.log('-----------------------------------');
          } catch (e) {
            console.error('解析事件数据失败:', e);
            console.error('原始数据:', data);
          }
        }
      }
    }
    
  } catch (err) {
    console.error('连接或处理SSE流时出错:', err);
    process.exit(1);
  }
}

// 启动连接
connectSSE(); 