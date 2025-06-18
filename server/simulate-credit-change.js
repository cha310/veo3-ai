/**
 * 模拟积分变动脚本
 * 用于测试实时推送功能
 * 
 * 使用方法：
 * node simulate-credit-change.js <user_id> <amount> <type>
 * 
 * 参数说明：
 * - user_id: 用户ID
 * - amount: 积分变动数量，正数为增加，负数为减少
 * - type: 变动类型，如 'manual', 'purchase', 'subscription', 'video_generation' 等
 */

const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { publishCreditChange } = require('./websocket');
const redisPubSub = require('./redis-pubsub');

// 加载环境变量
dotenv.config();

// 从环境变量读取Supabase配置
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('未检测到 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 获取命令行参数
const userId = process.argv[2];
const amount = parseInt(process.argv[3]);
const type = process.argv[4] || 'manual';

if (!userId || isNaN(amount)) {
  console.error('请提供有效的用户ID和积分变动数量');
  console.error('用法: node simulate-credit-change.js <user_id> <amount> <type>');
  process.exit(1);
}

// 模拟积分变动
async function simulateCreditChange() {
  try {
    console.log(`模拟积分变动: 用户=${userId}, 数量=${amount}, 类型=${type}`);
    
    // 1. 调用Supabase存储过程添加积分
    const { data, error } = await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_credit_type: 'standard',
      p_expiry_days: 365,
      p_description: `模拟积分变动: ${type}`,
      p_metadata: { source: 'simulation', type }
    });
    
    if (error) {
      console.error('添加积分失败:', error);
      process.exit(1);
    }
    
    console.log('积分添加成功:', data);
    
    // 2. 发布积分变动事件
    console.log('正在发布积分变动事件...');
    
    // 通过WebSocket发布（内部会处理Redis发布）
    await publishCreditChange(userId, amount, type, { source: 'simulation' });
    
    // 直接通过Redis发布（测试Redis Pub/Sub）
    if (redisPubSub.isRedisAvailable()) {
      await redisPubSub.publishCreditChange(userId, amount, type, { source: 'simulation_redis' });
    }
    
    console.log('积分变动事件已发布');
    
    // 等待事件处理完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('模拟完成');
    process.exit(0);
  } catch (err) {
    console.error('模拟积分变动失败:', err.message);
    process.exit(1);
  }
}

// 初始化Redis并执行模拟
async function init() {
  try {
    // 初始化Redis
    await redisPubSub.initRedisClients();
    
    // 执行模拟
    await simulateCreditChange();
  } catch (err) {
    console.error('初始化失败:', err.message);
    process.exit(1);
  }
}

// 开始执行
init(); 