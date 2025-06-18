/**
 * 积分变动模拟工具
 * 
 * 使用方法：
 * 1. 确保服务器已启动
 * 2. 运行 node simulate-credit-change.js <JWT令牌> <用户ID> <积分变动量>
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 获取命令行参数
const token = process.argv[2];
const userId = process.argv[3];
const amount = parseInt(process.argv[4], 10);

if (!token || !userId || isNaN(amount)) {
  console.error('错误: 缺少必要参数');
  console.error('用法: node simulate-credit-change.js <JWT令牌> <用户ID> <积分变动量>');
  console.error('示例: node simulate-credit-change.js eyJhbGciOi... 123e4567-e89b-12d3-a456-426614174000 100');
  process.exit(1);
}

// 服务器地址
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:9000';

// 根据积分变动量选择接口
const API_URL = amount >= 0 
  ? `${SERVER_URL}/api/credits/add/manual` // 增加积分
  : `${SERVER_URL}/api/credits/deduct`; // 扣除积分

console.log(`正在模拟积分${amount >= 0 ? '增加' : '扣除'}...`);
console.log(`用户ID: ${userId}`);
console.log(`变动量: ${Math.abs(amount)}`);
console.log(`API URL: ${API_URL}`);

// 发送请求
async function simulateCreditChange() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        user_id: userId,
        amount: Math.abs(amount),
        reason: '测试积分变动',
        description: '通过模拟工具测试积分实时推送'
      })
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { text };
    }
    
    if (!response.ok) {
      console.error(`请求失败: ${response.status} ${response.statusText}`);
      console.error('响应内容:', data);
      process.exit(1);
    }
    
    console.log('请求成功!');
    console.log('响应数据:', data);
    console.log('-----------------------------------');
    console.log('现在可以检查WebSocket/SSE客户端是否收到了积分变动通知');
    
  } catch (err) {
    console.error('请求出错:', err);
    process.exit(1);
  }
}

// 执行模拟
simulateCreditChange(); 