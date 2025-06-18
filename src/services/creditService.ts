// Define credit consumption constants
export const CREDIT_COSTS = {
  'kling-1.6': 20,   // Kling 1.6 costs 20 credits
  'veo-2': 180,      // Veo 2 costs 180 credits
  'veo-3': 330,      // Veo 3 costs 330 credits
};

// User credit related interfaces
export interface UserCredit {
  credits: number;
}

export interface CreditBalance {
  id: string;
  amount: number;
  source: string;
  source_id: string | null;
  expires_at: string | null;
}

export interface CreditTransaction {
  id: string;
  amount: number;
  balance_after: number;
  type: string;
  source: string;
  description: string | null;
  created_at: string;
  expires_at: string | null;
}

// API相关函数
const API_BASE_URL = '/api/credits';

// 获取API请求头
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('supabaseToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// 从API获取用户积分余额
export const fetchUserCredits = async (): Promise<{ total: number, balances: CreditBalance[] }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/balance`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`获取积分失败: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '获取积分失败');
    }
    
    // 更新本地存储的积分
    updateLocalUserCredits(data.data.total_credits);
    
    return {
      total: data.data.total_credits,
      balances: data.data.balances
    };
  } catch (error) {
    console.error('获取用户积分失败:', error);
    return { total: getUserCredits(), balances: [] };
  }
};

// 更新本地存储中的用户积分
const updateLocalUserCredits = (newCredits: number): boolean => {
  const userData = localStorage.getItem('user');
  if (!userData) return false;
  
  try {
    const user = JSON.parse(userData);
    user.credits = newCredits;
    localStorage.setItem('user', JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('更新本地用户积分数据失败:', error);
    return false;
  }
};

// Get user's current credits from localStorage
export const getUserCredits = (): number => {
  const userData = localStorage.getItem('user');
  if (!userData) return 0;
  
  try {
    const user = JSON.parse(userData);
    // If there's no credits field in user data, default to 0
    return user.credits || 0;
  } catch (error) {
    console.error('Error parsing user credit data:', error);
    return 0;
  }
};

// Update user credits
export const updateUserCredits = (newCredits: number): boolean => {
  return updateLocalUserCredits(newCredits);
};

// 消费积分API
export const apiConsumeCredits = async (amount: number, type: string, source: string, description?: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/consume`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        amount,
        type,
        source,
        description
      })
    });
    
    if (!response.ok) {
      throw new Error(`消费积分失败: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '消费积分失败');
    }
    
    // 更新本地存储的积分
    updateLocalUserCredits(data.data.balance_after);
    
    return true;
  } catch (error) {
    console.error('消费积分失败:', error);
    return false;
  }
};

// Consume credits - returns whether successful
export const consumeCredits = (modelId: string): boolean => {
  const currentCredits = getUserCredits();
  const cost = CREDIT_COSTS[modelId as keyof typeof CREDIT_COSTS] || 0;
  
  if (currentCredits < cost) {
    return false; // Not enough credits
  }
  
  // 调用API消费积分
  apiConsumeCredits(cost, 'video_generation', modelId, `生成${modelId}视频`)
    .catch(error => {
      console.error('API消费积分失败，回退到本地消费:', error);
      // 如果API调用失败，回退到本地消费
      updateUserCredits(currentCredits - cost);
    });
  
  // 先更新本地状态，保证UI响应
  return updateUserCredits(currentCredits - cost);
};

// Add credits
export const addCredits = (amount: number): boolean => {
  const currentCredits = getUserCredits();
  return updateUserCredits(currentCredits + amount);
};

// Check if user has enough credits to use a model
export const hasEnoughCredits = (modelId: string): boolean => {
  const currentCredits = getUserCredits();
  const cost = CREDIT_COSTS[modelId as keyof typeof CREDIT_COSTS] || 0;
  return currentCredits >= cost;
};

// Get the credit cost for a model
export const getModelCreditCost = (modelId: string): number => {
  return CREDIT_COSTS[modelId as keyof typeof CREDIT_COSTS] || 0;
};

// 获取用户积分交易记录
export interface TransactionQueryParams {
  limit?: number;
  offset?: number;
  type?: 'all' | 'consumption' | 'subscription' | 'purchase' | 'adjustment' | 'expiration';
  startDate?: string;
  endDate?: string;
}

export const fetchCreditTransactions = async (params: TransactionQueryParams = {}): Promise<{ total: number, transactions: CreditTransaction[] }> => {
  try {
    const { limit = 20, offset = 0, type = 'all', startDate, endDate } = params;
    
    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    queryParams.append('offset', offset.toString());
    queryParams.append('type', type);
    
    if (startDate) {
      queryParams.append('start_date', startDate);
    }
    
    if (endDate) {
      queryParams.append('end_date', endDate);
    }
    
    const response = await fetch(`${API_BASE_URL}/transactions?${queryParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`获取交易记录失败: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '获取交易记录失败');
    }
    
    return {
      total: data.data.total,
      transactions: data.data.transactions
    };
  } catch (error) {
    console.error('获取积分交易记录失败:', error);
    return { total: 0, transactions: [] };
  }
};

// 检查用户是否有足够积分
export const checkCredits = async (amount: number, model?: string): Promise<{ hasEnough: boolean, required: number, current: number, after: number }> => {
  try {
    // 如果提供了model，计算所需积分
    const requiredCredits = model ? getModelCreditCost(model) : amount;
    
    // 获取最新积分余额
    const { total } = await fetchUserCredits();
    
    return {
      hasEnough: total >= requiredCredits,
      required: requiredCredits,
      current: total,
      after: total - requiredCredits
    };
  } catch (error) {
    console.error('检查积分失败:', error);
    
    // 回退到本地检查
    const currentCredits = getUserCredits();
    const requiredCredits = model ? getModelCreditCost(model) : amount;
    
    return {
      hasEnough: currentCredits >= requiredCredits,
      required: requiredCredits,
      current: currentCredits,
      after: currentCredits - requiredCredits
    };
  }
};

// 直接写入积分变动记录（仅管理员）
export interface CreditTransactionRecord {
  user_id: string;
  amount: number;
  type: string;
  source?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// 写入单条积分变动记录
export const writeTransactionRecord = async (transaction: CreditTransactionRecord): Promise<{ success: boolean, transaction_id?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(transaction)
    });
    
    if (!response.ok) {
      throw new Error(`写入积分变动记录失败: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '写入积分变动记录失败');
    }
    
    return {
      success: true,
      transaction_id: data.data.transaction_id
    };
  } catch (error) {
    console.error('写入积分变动记录失败:', error);
    return { success: false };
  }
};

// 批量写入积分变动记录
export const writeBatchTransactionRecords = async (transactions: CreditTransactionRecord[]): Promise<{ success: boolean, inserted_count?: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/batch-transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ transactions })
    });
    
    if (!response.ok) {
      throw new Error(`批量写入积分变动记录失败: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '批量写入积分变动记录失败');
    }
    
    return {
      success: true,
      inserted_count: data.data.inserted_count
    };
  } catch (error) {
    console.error('批量写入积分变动记录失败:', error);
    return { success: false };
  }
};

// 管理员获取指定用户的积分交易记录
export const fetchUserTransactions = async (userId: string, params: TransactionQueryParams = {}): Promise<{ total: number, transactions: CreditTransaction[] }> => {
  try {
    const { limit = 20, offset = 0, type = 'all', startDate, endDate } = params;
    
    // 构建查询参数
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    queryParams.append('offset', offset.toString());
    queryParams.append('type', type);
    
    if (startDate) {
      queryParams.append('start_date', startDate);
    }
    
    if (endDate) {
      queryParams.append('end_date', endDate);
    }
    
    const response = await fetch(`${API_BASE_URL}/transactions/admin/${userId}?${queryParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`获取用户交易记录失败: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '获取用户交易记录失败');
    }
    
    return {
      total: data.data.total,
      transactions: data.data.transactions
    };
  } catch (error) {
    console.error('获取用户积分交易记录失败:', error);
    return { total: 0, transactions: [] };
  }
};

// 视频生成相关的接口
export interface VideoGenerationOptions {
  model_id: string;
  video_id?: string;
  duration?: number;
  resolution?: string;
  additional_features?: string[];
}

// 视频生成结果
export interface VideoGenerationResult {
  success: boolean;
  transaction_id?: string;
  amount?: number;
  balance_after?: number;
  error?: {
    code: string;
    message: string;
    details?: {
      required: number;
      available: number;
    };
  };
}

// 检查视频生成所需积分
export const checkVideoGenerationCredits = async (options: VideoGenerationOptions): Promise<{
  hasEnough: boolean;
  required: number;
  current: number;
  after: number;
  model_id: string;
  features: string[];
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/check/video`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(options)
    });
    
    if (!response.ok) {
      throw new Error(`检查视频生成积分失败: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '检查视频生成积分失败');
    }
    
    return {
      hasEnough: data.data.has_enough_credits,
      required: data.data.required_credits,
      current: data.data.current_credits,
      after: data.data.credits_after,
      model_id: data.data.model_id,
      features: data.data.features
    };
  } catch (error) {
    console.error('检查视频生成积分失败:', error);
    
    // 回退到本地检查
    const currentCredits = getUserCredits();
    let requiredCredits = getModelCreditCost(options.model_id);
    
    // 计算额外功能的积分消耗
    if (options.additional_features && Array.isArray(options.additional_features)) {
      for (const feature of options.additional_features) {
        switch (feature) {
          case 'hd':
            requiredCredits += 50;
            break;
          case 'longer_duration':
            requiredCredits += 100;
            break;
          case 'enhanced_quality':
            requiredCredits += 80;
            break;
        }
      }
    }
    
    return {
      hasEnough: currentCredits >= requiredCredits,
      required: requiredCredits,
      current: currentCredits,
      after: currentCredits - requiredCredits,
      model_id: options.model_id,
      features: options.additional_features || []
    };
  }
};

// 视频生成时扣除积分
export const consumeVideoGenerationCredits = async (options: VideoGenerationOptions): Promise<VideoGenerationResult> => {
  try {
    const response = await fetch(`${API_BASE_URL}/consume/video`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(options)
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      // 处理积分不足的情况
      if (response.status === 400 && data.error?.code === 'INSUFFICIENT_CREDITS') {
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: '积分不足',
            details: data.error.details
          }
        };
      }
      
      throw new Error(data.message || '视频生成扣除积分失败');
    }
    
    // 更新本地存储的积分
    updateLocalUserCredits(data.data.balance_after);
    
    return {
      success: true,
      transaction_id: data.data.transaction_id,
      amount: data.data.amount,
      balance_after: data.data.balance_after
    };
  } catch (error) {
    console.error('视频生成扣除积分失败:', error);
    
    // 尝试本地消费（仅在开发环境或紧急情况下使用）
    if (process.env.NODE_ENV === 'development') {
      const currentCredits = getUserCredits();
      const cost = getModelCreditCost(options.model_id);
      
      if (currentCredits >= cost) {
        updateUserCredits(currentCredits - cost);
        return {
          success: true,
          amount: cost,
          balance_after: currentCredits - cost
        };
      }
    }
    
    return { 
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '视频生成扣除积分失败'
      }
    };
  }
}; 