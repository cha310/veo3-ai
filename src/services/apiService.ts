import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// API基础URL配置
const isDevelopment = import.meta.env.DEV;
// 修改API基础URL，确保在所有环境中都使用正确的地址
const API_BASE_URL = 'http://localhost:9000';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 增加超时时间到30秒
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // 启用跨域请求携带凭证
});

// 重试配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 毫秒

// 重试函数
const retryRequest = async (config: AxiosRequestConfig, retries = 0): Promise<AxiosResponse> => {
  try {
    return await apiClient(config);
  } catch (error) {
    // 如果是网络错误且未超过最大重试次数，则重试
    if (axios.isAxiosError(error) && 
        (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') && 
        retries < MAX_RETRIES) {
      console.log(`请求失败，将在${RETRY_DELAY}ms后重试(${retries + 1}/${MAX_RETRIES})...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryRequest(config, retries + 1);
    }
    throw error;
  }
};

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`, config);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log(`响应成功: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  async (error: AxiosError) => {
    console.error('响应错误:', error);
    
    if (error.message === 'Network Error') {
      console.error('网络错误，请检查服务器是否运行或网络连接是否正常');
    }
    
    if (error.response) {
      console.error(`请求失败，状态码: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('未收到响应', error.request);
    }
    
    return Promise.reject(error);
  }
);

// API方法
export const apiService = {
  // 健康检查
  checkHealth: async () => {
    try {
      const response = await retryRequest({ method: 'get', url: '/health' });
      return response.data;
    } catch (error) {
      console.error('健康检查失败:', error);
      throw error;
    }
  },
  
  // 测试管理员API
  testAdminApi: async () => {
    try {
      const response = await retryRequest({ method: 'get', url: '/api/admin/test' });
      return response.data;
    } catch (error) {
      console.error('管理员API测试失败:', error);
      throw error;
    }
  },
  
  // 获取服务器状态
  getServerStatus: async (password: string) => {
    try {
      const response = await retryRequest({ 
        method: 'get', 
        url: `/api/admin/status`, 
        params: { password: password || 'veoai-admin-2024' } 
      });
      return response.data;
    } catch (error) {
      console.error('获取服务器状态失败:', error);
      throw error;
    }
  },
  
  // 获取登录日志
  getLoginLogs: async (password: string) => {
    try {
      const response = await retryRequest({ 
        method: 'get', 
        url: `/api/auth/login-logs`, 
        params: { password } 
      });
      return response.data;
    } catch (error) {
      console.error('获取登录日志失败:', error);
      throw error;
    }
  }
};

export default apiService; 