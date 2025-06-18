/**
 * Redis Pub/Sub 服务
 * 用于在多实例部署时同步积分变动事件
 */

const redis = require('redis');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// Redis配置
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

// 频道名称
const CHANNELS = {
  CREDIT_CHANGE: 'credit:change',
};

// 创建Redis客户端
const createRedisClient = () => {
  const options = {
    url: REDIS_URL,
  };
  
  if (REDIS_PASSWORD) {
    options.password = REDIS_PASSWORD;
  }
  
  return redis.createClient(options);
};

// 发布者客户端
let publisherClient = null;

// 订阅者客户端
let subscriberClient = null;

// 事件处理器
const eventHandlers = {
  [CHANNELS.CREDIT_CHANGE]: []
};

/**
 * 初始化Redis客户端
 * @returns {Promise<void>}
 */
const initRedisClients = async () => {
  try {
    // 如果Redis URL未配置，则不初始化
    if (!REDIS_URL) {
      console.warn('[Redis] Redis URL未配置，将不使用Redis Pub/Sub功能');
      return;
    }
    
    // 创建发布者客户端
    publisherClient = createRedisClient();
    await publisherClient.connect();
    
    console.log('[Redis] 发布者客户端已连接');
    
    // 创建订阅者客户端
    subscriberClient = createRedisClient();
    
    // 设置错误处理
    subscriberClient.on('error', (err) => {
      console.error('[Redis] 订阅者客户端错误:', err);
    });
    
    await subscriberClient.connect();
    console.log('[Redis] 订阅者客户端已连接');
    
    // 订阅积分变动频道
    await subscriberClient.subscribe(CHANNELS.CREDIT_CHANGE, (message) => {
      try {
        const data = JSON.parse(message);
        
        // 调用所有注册的处理器
        eventHandlers[CHANNELS.CREDIT_CHANGE].forEach(handler => {
          try {
            handler(data);
          } catch (handlerError) {
            console.error('[Redis] 处理积分变动事件时出错:', handlerError);
          }
        });
      } catch (err) {
        console.error('[Redis] 解析消息失败:', err);
      }
    });
    
    console.log(`[Redis] 已订阅频道: ${CHANNELS.CREDIT_CHANGE}`);
  } catch (err) {
    console.error('[Redis] 初始化Redis客户端失败:', err);
    
    // 关闭客户端连接
    if (publisherClient) {
      await publisherClient.quit();
      publisherClient = null;
    }
    
    if (subscriberClient) {
      await subscriberClient.quit();
      subscriberClient = null;
    }
  }
};

/**
 * 发布积分变动事件
 * @param {string} userId - 用户ID
 * @param {number} amount - 变动金额
 * @param {string} type - 变动类型
 * @param {Object} metadata - 额外元数据
 * @returns {Promise<boolean>} - 是否发布成功
 */
const publishCreditChange = async (userId, amount, type, metadata = {}) => {
  try {
    if (!publisherClient) {
      console.warn('[Redis] Redis客户端未初始化，无法发布积分变动事件');
      return false;
    }
    
    const message = JSON.stringify({
      userId,
      amount,
      type,
      timestamp: Date.now(),
      metadata,
    });
    
    await publisherClient.publish(CHANNELS.CREDIT_CHANGE, message);
    console.log(`[Redis] 已发布积分变动事件: ${userId} ${amount} ${type}`);
    return true;
  } catch (err) {
    console.error('[Redis] 发布积分变动事件失败:', err);
    return false;
  }
};

/**
 * 注册积分变动事件处理器
 * @param {Function} handler - 处理函数，接收事件数据作为参数
 * @returns {Function} - 取消注册的函数
 */
const onCreditChange = (handler) => {
  if (typeof handler !== 'function') {
    throw new Error('处理器必须是一个函数');
  }
  
  eventHandlers[CHANNELS.CREDIT_CHANGE].push(handler);
  
  // 返回取消注册的函数
  return () => {
    const index = eventHandlers[CHANNELS.CREDIT_CHANGE].indexOf(handler);
    if (index !== -1) {
      eventHandlers[CHANNELS.CREDIT_CHANGE].splice(index, 1);
    }
  };
};

/**
 * 关闭Redis连接
 * @returns {Promise<void>}
 */
const closeRedisConnections = async () => {
  try {
    if (publisherClient) {
      await publisherClient.quit();
      publisherClient = null;
    }
    
    if (subscriberClient) {
      await subscriberClient.quit();
      subscriberClient = null;
    }
    
    console.log('[Redis] Redis连接已关闭');
  } catch (err) {
    console.error('[Redis] 关闭Redis连接失败:', err);
  }
};

// 检查Redis是否可用
const isRedisAvailable = () => {
  return !!publisherClient && !!subscriberClient;
};

module.exports = {
  initRedisClients,
  publishCreditChange,
  onCreditChange,
  closeRedisConnections,
  isRedisAvailable,
  CHANNELS,
}; 