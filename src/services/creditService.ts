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