import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';

// 定义积分余额类型
export interface CreditBalance {
  credit_type: string;
  amount: number;
  expiry_date: string;
}

// 定义连接状态类型
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// 定义连接类型
export type ConnectionType = 'websocket' | 'sse' | 'polling' | 'none';

// 定义上下文类型
interface CreditContextType {
  totalCredits: number;
  balances: CreditBalance[];
  connectionStatus: ConnectionStatus;
  connectionType: ConnectionType;
  lastUpdated: Date | null;
  reconnect: () => void;
  disconnect: () => void;
}

// 创建上下文
const CreditContext = createContext<CreditContextType>({
  totalCredits: 0,
  balances: [],
  connectionStatus: 'disconnected',
  connectionType: 'none',
  lastUpdated: null,
  reconnect: () => {},
  disconnect: () => {}
});

// 提供器属性类型
interface CreditProviderProps {
  children: React.ReactNode;
}

// 定义WebSocket重连配置
const WS_RECONNECT_DELAY = 2000; // 2秒
const WS_MAX_RECONNECT_ATTEMPTS = 5;

// 定义SSE重连配置
const SSE_RECONNECT_DELAY = 3000; // 3秒
const SSE_MAX_RECONNECT_ATTEMPTS = 3;

// 定义轮询配置
const POLLING_INTERVAL = 10000; // 10秒

// 扩展EventSource初始化选项类型，添加headers属性
interface ExtendedEventSourceInit extends EventSourceInit {
  headers?: Record<string, string>;
}

export const CreditProvider: React.FC<CreditProviderProps> = ({ children }) => {
  // 获取认证信息
  const { user, token } = useAuth();
  
  // 状态
  const [totalCredits, setTotalCredits] = useState<number>(0);
  const [balances, setBalances] = useState<CreditBalance[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [connectionType, setConnectionType] = useState<ConnectionType>('none');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // 引用
  const wsRef = useRef<WebSocket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsReconnectAttemptsRef = useRef<number>(0);
  const sseReconnectAttemptsRef = useRef<number>(0);
  const isConnectingRef = useRef<boolean>(false);
  const lastBalanceUpdateRef = useRef<string>(''); // 用于防止重复更新
  
  // 清理所有连接
  const cleanupConnections = useCallback(() => {
    // 清理WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // 清理SSE
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // 清理轮询
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    // 重置连接状态
    wsReconnectAttemptsRef.current = 0;
    sseReconnectAttemptsRef.current = 0;
    isConnectingRef.current = false;
  }, []);
  
  // 断开连接
  const disconnect = useCallback(() => {
    cleanupConnections();
    setConnectionStatus('disconnected');
    setConnectionType('none');
  }, [cleanupConnections]);
  
  // 处理余额更新
  const handleBalanceUpdate = useCallback((data: any) => {
    // 防止重复更新
    const updateKey = JSON.stringify(data);
    if (updateKey === lastBalanceUpdateRef.current) {
      return;
    }
    
    lastBalanceUpdateRef.current = updateKey;
    
    // 更新状态
    setTotalCredits(data.total_credits);
    setBalances(data.balances || []);
    setLastUpdated(new Date());
    
    // 记录日志
    console.log('[CreditContext] 余额已更新:', data);
  }, []);
  
  // 连接WebSocket
  const connectWebSocket = useCallback(() => {
    if (!token || isConnectingRef.current) {
      return;
    }
    
    try {
      isConnectingRef.current = true;
      setConnectionStatus('connecting');
      setConnectionType('websocket');
      
      // 获取WebSocket URL
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
      
      // 创建WebSocket连接
      const ws = new WebSocket(`${wsUrl}?token=${token}`);
      wsRef.current = ws;
      
      // 连接打开事件
      ws.onopen = () => {
        console.log('[CreditContext] WebSocket连接已打开');
        setConnectionStatus('connected');
        wsReconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
      };
      
      // 接收消息事件
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'balance_update') {
            handleBalanceUpdate(message.data);
          } else if (message.type === 'error') {
            console.error('[CreditContext] WebSocket错误:', message.message);
          }
        } catch (err) {
          console.error('[CreditContext] 解析WebSocket消息失败:', err);
        }
      };
      
      // 连接关闭事件
      ws.onclose = () => {
        console.log('[CreditContext] WebSocket连接已关闭');
        wsRef.current = null;
        
        // 如果不是主动断开，则尝试重连
        if (connectionStatus !== 'disconnected') {
          setConnectionStatus('disconnected');
          
          // 尝试WebSocket重连
          if (wsReconnectAttemptsRef.current < WS_MAX_RECONNECT_ATTEMPTS) {
            wsReconnectAttemptsRef.current++;
            console.log(`[CreditContext] 尝试WebSocket重连 (${wsReconnectAttemptsRef.current}/${WS_MAX_RECONNECT_ATTEMPTS})...`);
            
            setTimeout(() => {
              isConnectingRef.current = false;
              connectWebSocket();
            }, WS_RECONNECT_DELAY);
          } else {
            // WebSocket重连失败，降级到SSE
            console.log('[CreditContext] WebSocket重连失败，降级到SSE');
            isConnectingRef.current = false;
            connectSSE();
          }
        }
      };
      
      // 连接错误事件
      ws.onerror = (error) => {
        console.error('[CreditContext] WebSocket连接错误:', error);
        setConnectionStatus('error');
      };
    } catch (err) {
      console.error('[CreditContext] 创建WebSocket连接失败:', err);
      setConnectionStatus('error');
      isConnectingRef.current = false;
      
      // 降级到SSE
      connectSSE();
    }
  }, [token, connectionStatus, handleBalanceUpdate]);
  
  // 连接SSE
  const connectSSE = useCallback(() => {
    if (!token || isConnectingRef.current) {
      return;
    }
    
    try {
      isConnectingRef.current = true;
      setConnectionStatus('connecting');
      setConnectionType('sse');
      
      // 获取SSE URL
      const sseUrl = `/api/credits/sse`;
      
      // 创建SSE连接
      // 注意：标准EventSource不支持自定义headers，这里使用了一个变通方法
      // 在实际实现中，可能需要使用支持headers的库或将token作为URL参数传递
      const eventSource = new EventSource(`${sseUrl}?token=${token}`);
      eventSourceRef.current = eventSource;
      
      // 连接打开事件
      eventSource.onopen = () => {
        console.log('[CreditContext] SSE连接已打开');
        setConnectionStatus('connected');
        sseReconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
      };
      
      // 接收消息事件
      eventSource.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'balance_update') {
            handleBalanceUpdate(message.data);
          } else if (message.type === 'error') {
            console.error('[CreditContext] SSE错误:', message.message);
          }
        } catch (err) {
          console.error('[CreditContext] 解析SSE消息失败:', err);
        }
      };
      
      // 连接错误事件
      eventSource.onerror = () => {
        console.error('[CreditContext] SSE连接错误');
        eventSourceRef.current = null;
        
        // 如果不是主动断开，则尝试重连
        if (connectionStatus !== 'disconnected') {
          setConnectionStatus('disconnected');
          
          // 尝试SSE重连
          if (sseReconnectAttemptsRef.current < SSE_MAX_RECONNECT_ATTEMPTS) {
            sseReconnectAttemptsRef.current++;
            console.log(`[CreditContext] 尝试SSE重连 (${sseReconnectAttemptsRef.current}/${SSE_MAX_RECONNECT_ATTEMPTS})...`);
            
            setTimeout(() => {
              isConnectingRef.current = false;
              connectSSE();
            }, SSE_RECONNECT_DELAY);
          } else {
            // SSE重连失败，降级到轮询
            console.log('[CreditContext] SSE重连失败，降级到轮询');
            isConnectingRef.current = false;
            startPolling();
          }
        }
        
        eventSource.close();
      };
    } catch (err) {
      console.error('[CreditContext] 创建SSE连接失败:', err);
      setConnectionStatus('error');
      isConnectingRef.current = false;
      
      // 降级到轮询
      startPolling();
    }
  }, [token, connectionStatus, handleBalanceUpdate]);
  
  // 开始轮询
  const startPolling = useCallback(() => {
    if (!token || isConnectingRef.current) {
      return;
    }
    
    try {
      isConnectingRef.current = true;
      setConnectionStatus('connecting');
      setConnectionType('polling');
      
      // 清理现有轮询
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // 定义轮询函数
      const poll = async () => {
        try {
          const response = await fetch('/api/credits/balance/poll', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error(`轮询失败: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // 更新连接状态
          if (connectionStatus !== 'connected') {
            setConnectionStatus('connected');
            isConnectingRef.current = false;
          }
          
          // 更新余额
          handleBalanceUpdate(data);
          
          // 更新轮询间隔（如果服务器提供）
          if (data.poll_interval && pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = setInterval(poll, data.poll_interval);
          }
        } catch (err) {
          console.error('[CreditContext] 轮询失败:', err);
          setConnectionStatus('error');
        }
      };
      
      // 立即执行一次轮询
      poll();
      
      // 设置轮询间隔
      pollingIntervalRef.current = setInterval(poll, POLLING_INTERVAL);
      
      console.log('[CreditContext] 已启动轮询，间隔:', POLLING_INTERVAL, 'ms');
    } catch (err) {
      console.error('[CreditContext] 启动轮询失败:', err);
      setConnectionStatus('error');
      isConnectingRef.current = false;
    }
  }, [token, connectionStatus, handleBalanceUpdate]);
  
  // 重新连接
  const reconnect = useCallback(() => {
    // 清理现有连接
    cleanupConnections();
    
    // 重置连接状态
    wsReconnectAttemptsRef.current = 0;
    sseReconnectAttemptsRef.current = 0;
    
    // 优先尝试WebSocket
    connectWebSocket();
  }, [cleanupConnections, connectWebSocket]);
  
  // 当用户或令牌变化时，重新连接
  useEffect(() => {
    if (user && token) {
      reconnect();
    } else {
      disconnect();
    }
    
    // 组件卸载时清理连接
    return () => {
      cleanupConnections();
    };
  }, [user, token, reconnect, disconnect, cleanupConnections]);
  
  // 使用useMemo优化上下文值，避免不必要的重新渲染
  const contextValue = useMemo(() => ({
    totalCredits,
    balances,
    connectionStatus,
    connectionType,
    lastUpdated,
    reconnect,
    disconnect
  }), [totalCredits, balances, connectionStatus, connectionType, lastUpdated, reconnect, disconnect]);
  
  return (
    <CreditContext.Provider value={contextValue}>
      {children}
    </CreditContext.Provider>
  );
};

// 自定义钩子，用于在组件中访问上下文
export const useCredit = () => useContext(CreditContext); 