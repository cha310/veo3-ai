import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchUserCredits, CreditBalance } from '../services/creditService';

// 连接状态枚举
enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
}

// 连接类型枚举
enum ConnectionType {
  WEBSOCKET = 'websocket',
  SSE = 'sse',
  POLLING = 'polling',
  NONE = 'none',
}

// 上下文接口
interface CreditContextType {
  totalCredits: number;
  balances: CreditBalance[];
  isLoading: boolean;
  error: string | null;
  connectionState: ConnectionState;
  connectionType: ConnectionType;
  refreshCredits: () => Promise<void>;
}

// 创建上下文
const CreditContext = createContext<CreditContextType>({
  totalCredits: 0,
  balances: [],
  isLoading: false,
  error: null,
  connectionState: ConnectionState.DISCONNECTED,
  connectionType: ConnectionType.NONE,
  refreshCredits: async () => {},
});

// 提供者组件
export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 状态
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [balances, setBalances] = useState<CreditBalance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [connectionType, setConnectionType] = useState<ConnectionType>(ConnectionType.NONE);
  
  // 引用
  const wsRef = useRef<WebSocket | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1秒
  
  // 获取JWT令牌
  const getToken = useCallback((): string | null => {
    return localStorage.getItem('supabaseToken');
  }, []);
  
  // 刷新积分余额
  const refreshCredits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { total, balances } = await fetchUserCredits();
      
      setTotalCredits(total);
      setBalances(balances);
    } catch (err) {
      console.error('刷新积分余额失败:', err);
      setError('获取积分余额失败');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // 处理积分余额更新
  const handleBalanceUpdate = useCallback((data: any) => {
    // 只有当积分余额发生变化时才更新状态
    if (data.total_credits !== totalCredits || JSON.stringify(data.balances) !== JSON.stringify(balances)) {
      console.log('积分余额已更新:', data);
      setTotalCredits(data.total_credits);
      setBalances(data.balances || []);
      
      // 更新本地存储中的积分
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          user.credits = data.total_credits;
          localStorage.setItem('user', JSON.stringify(user));
        } catch (err) {
          console.error('更新本地存储中的积分失败:', err);
        }
      }
    }
  }, [totalCredits, balances]);
  
  // 清理所有连接
  const cleanupConnections = useCallback(() => {
    // 清理WebSocket连接
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // 清理SSE连接
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    
    // 清理轮询定时器
    if (pollingIntervalRef.current) {
      window.clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // 清理重连定时器
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);
  
  // 计算重连延迟（指数退避）
  const getReconnectDelay = useCallback(() => {
    const attempt = reconnectAttemptsRef.current;
    // 指数退避，但最多等待30秒
    return Math.min(baseReconnectDelay * Math.pow(2, attempt), 30000);
  }, []);
  
  // 启动轮询
  const startPolling = useCallback(() => {
    setConnectionState(ConnectionState.CONNECTED);
    setConnectionType(ConnectionType.POLLING);
    
    // 立即执行一次轮询
    refreshCredits();
    
    // 设置定时器，每10秒轮询一次
    pollingIntervalRef.current = window.setInterval(() => {
      refreshCredits();
    }, 10000);
    
    return true;
  }, [refreshCredits]);
  
  // 连接SSE
  const connectSSE = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.error('SSE连接失败: 未找到令牌');
      return false;
    }
    
    try {
      setConnectionState(ConnectionState.CONNECTING);
      setConnectionType(ConnectionType.SSE);
      
      // 创建SSE连接，通过URL参数传递令牌
      const eventSource = new EventSource(`/api/credits/sse?token=${encodeURIComponent(token)}`, {
        withCredentials: true
      });
      sseRef.current = eventSource;
      
      // 连接打开时
      eventSource.onopen = () => {
        console.log('SSE连接已建立');
        setConnectionState(ConnectionState.CONNECTED);
        reconnectAttemptsRef.current = 0; // 重置重连计数
      };
      
      // 接收消息时
      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'balance_update' && message.data) {
            handleBalanceUpdate(message.data);
          } else if (message.type === 'error') {
            console.error('SSE错误:', message.message);
          }
        } catch (err) {
          console.error('解析SSE消息失败:', err);
        }
      };
      
      // 连接错误时
      eventSource.onerror = () => {
        console.error('SSE连接错误');
        eventSource.close();
        setConnectionState(ConnectionState.DISCONNECTED);
        
        // 尝试重连
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = getReconnectDelay();
          
          console.log(`将在${delay}毫秒后尝试重新连接(SSE)...`);
          setConnectionState(ConnectionState.RECONNECTING);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            // 尝试重新连接SSE，如果失败则降级到轮询
            if (!connectSSE()) {
              startPolling();
            }
          }, delay);
        } else {
          console.log('达到最大重连次数，降级到轮询');
          startPolling();
        }
      };
      
      return true;
    } catch (err) {
      console.error('建立SSE连接失败:', err);
      setConnectionState(ConnectionState.DISCONNECTED);
      return false;
    }
  }, [getToken, handleBalanceUpdate, getReconnectDelay, startPolling]);
  
  // 连接WebSocket
  const connectWebSocket = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.error('WebSocket连接失败: 未找到令牌');
      return false;
    }
    
    try {
      setConnectionState(ConnectionState.CONNECTING);
      setConnectionType(ConnectionType.WEBSOCKET);
      
      // 获取WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}?token=${token}`;
      
      // 创建WebSocket连接
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      // 连接打开时
      ws.onopen = () => {
        console.log('WebSocket连接已建立');
        setConnectionState(ConnectionState.CONNECTED);
        reconnectAttemptsRef.current = 0; // 重置重连计数
      };
      
      // 接收消息时
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'balance_update' && message.data) {
            handleBalanceUpdate(message.data);
          } else if (message.type === 'error') {
            console.error('WebSocket错误:', message.message);
          }
        } catch (err) {
          console.error('解析WebSocket消息失败:', err);
        }
      };
      
      // 连接关闭时
      ws.onclose = () => {
        console.log('WebSocket连接已关闭');
        setConnectionState(ConnectionState.DISCONNECTED);
        
        // 尝试重连
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = getReconnectDelay();
          
          console.log(`将在${delay}毫秒后尝试重新连接(WebSocket)...`);
          setConnectionState(ConnectionState.RECONNECTING);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            // 尝试重新连接WebSocket，如果失败则降级到SSE
            if (!connectWebSocket()) {
              connectSSE();
            }
          }, delay);
        } else {
          console.log('达到最大重连次数，降级到SSE');
          connectSSE();
        }
      };
      
      // 连接错误时
      ws.onerror = (error) => {
        console.error('WebSocket连接错误:', error);
        // WebSocket会自动触发onclose，所以这里不需要额外处理
      };
      
      return true;
    } catch (err) {
      console.error('建立WebSocket连接失败:', err);
      setConnectionState(ConnectionState.DISCONNECTED);
      return false;
    }
  }, [getToken, handleBalanceUpdate, getReconnectDelay, connectSSE]);
  
  // 初始化连接
  const initConnection = useCallback(() => {
    // 清理现有连接
    cleanupConnections();
    
    // 重置重连计数
    reconnectAttemptsRef.current = 0;
    
    // 尝试按优先级建立连接：WebSocket > SSE > 轮询
    if (!connectWebSocket()) {
      if (!connectSSE()) {
        startPolling();
      }
    }
  }, [cleanupConnections, connectWebSocket, connectSSE, startPolling]);
  
  // 初始化
  useEffect(() => {
    // 先获取一次初始数据
    refreshCredits();
    
    // 初始化连接
    initConnection();
    
    // 监听网络状态变化
    const handleOnline = () => {
      console.log('网络已连接，重新建立连接');
      initConnection();
    };
    
    const handleOffline = () => {
      console.log('网络已断开');
      setConnectionState(ConnectionState.DISCONNECTED);
      cleanupConnections();
    };
    
    // 添加网络状态监听
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // 监听登录状态变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'supabaseToken' || e.key === 'user') {
        console.log('用户登录状态已变化，重新建立连接');
        initConnection();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // 清理函数
    return () => {
      cleanupConnections();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshCredits, initConnection, cleanupConnections]);
  
  // 提供上下文值
  const contextValue: CreditContextType = {
    totalCredits,
    balances,
    isLoading,
    error,
    connectionState,
    connectionType,
    refreshCredits,
  };
  
  return (
    <CreditContext.Provider value={contextValue}>
      {children}
    </CreditContext.Provider>
  );
};

// 自定义钩子，用于在组件中使用上下文
export const useCredits = () => {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
};

export default CreditContext; 