import apiService from './apiService';

// 订阅计划对应的积分配置
const SUBSCRIPTION_CREDIT_CONFIG = {
  lite: {
    credits: 600,
    expires_in: null // 订阅积分永久有效
  },
  pro: {
    credits: 1200,
    expires_in: null
  },
  pro_plus: {
    credits: 2500,
    expires_in: null
  }
};

/**
 * 处理订阅成功后的积分发放
 * @param userId 用户ID
 * @param subscriptionId 订阅ID
 * @param planId 订阅计划ID
 * @returns 积分发放结果
 */
export const handleSubscriptionSuccess = async (
  userId: string,
  subscriptionId: string,
  planId: 'lite' | 'pro' | 'pro_plus'
): Promise<any> => {
  try {
    // 获取订阅计划对应的积分配置
    const creditConfig = SUBSCRIPTION_CREDIT_CONFIG[planId];
    if (!creditConfig) {
      throw new Error(`未知的订阅计划: ${planId}`);
    }

    // 调用积分发放API
    const response = await apiService.post('/api/credits/add/subscription', {
      user_id: userId,
      amount: creditConfig.credits,
      subscription_id: subscriptionId,
      plan_id: planId,
      expires_in: creditConfig.expires_in
    });

    console.log(`订阅积分发放成功: 用户${userId}收到${creditConfig.credits}积分`);
    return response.data;
  } catch (error) {
    console.error('订阅积分发放失败:', error);
    throw error;
  }
};

/**
 * 模拟订阅成功事件
 * @param userId 用户ID
 * @param planId 订阅计划ID
 * @returns 积分发放结果
 */
export const simulateSubscriptionSuccess = async (
  userId: string,
  planId: 'lite' | 'pro' | 'pro_plus'
): Promise<any> => {
  try {
    // 获取订阅计划对应的积分配置
    const creditConfig = SUBSCRIPTION_CREDIT_CONFIG[planId];
    if (!creditConfig) {
      throw new Error(`未知的订阅计划: ${planId}`);
    }
    
    console.log(`模拟订阅成功: 用户${userId}订阅了${planId}计划`);
    
    // 调用测试接口发放积分
    const response = await apiService.post('/api/credits/test/add', {
      user_id: userId,
      amount: creditConfig.credits,
      plan_id: planId
    });

    console.log(`测试订阅积分发放成功: 用户${userId}收到${creditConfig.credits}积分`);
    return response;
  } catch (error) {
    console.error('模拟订阅失败:', error);
    throw error;
  }
};

/**
 * 处理月度订阅积分发放
 * @param userId 用户ID
 * @param subscriptionId 订阅ID
 * @param planId 订阅计划ID
 * @returns 积分发放结果
 */
export const handleMonthlyCreditsAllocation = async (
  userId: string,
  subscriptionId: string,
  planId: 'lite' | 'pro' | 'pro_plus'
): Promise<any> => {
  try {
    // 与订阅成功处理逻辑相同，只是日志信息不同
    const creditConfig = SUBSCRIPTION_CREDIT_CONFIG[planId];
    if (!creditConfig) {
      throw new Error(`未知的订阅计划: ${planId}`);
    }

    // 调用积分发放API
    const response = await apiService.post('/api/credits/add/subscription', {
      user_id: userId,
      amount: creditConfig.credits,
      subscription_id: subscriptionId,
      plan_id: planId,
      expires_in: creditConfig.expires_in
    });

    console.log(`月度订阅积分发放成功: 用户${userId}收到${creditConfig.credits}积分`);
    return response.data;
  } catch (error) {
    console.error('月度订阅积分发放失败:', error);
    throw error;
  }
};

export default {
  handleSubscriptionSuccess,
  simulateSubscriptionSuccess,
  handleMonthlyCreditsAllocation
}; 