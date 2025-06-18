import { useState, useEffect } from 'react';
import { createClient, User } from '@supabase/supabase-js';

// 创建Supabase客户端
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 认证钩子返回类型
interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * 认证钩子，用于获取用户认证信息
 * @returns 认证状态和方法
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 初始化时检查会话
  useEffect(() => {
    // 获取当前会话
    const getSession = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data.session) {
          setUser(data.session.user);
          setToken(data.session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('获取会话失败:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    
    getSession();
    
    // 监听认证状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setUser(session.user);
          setToken(session.access_token);
        } else {
          setUser(null);
          setToken(null);
        }
        setLoading(false);
      }
    );
    
    // 清理监听器
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);
  
  // 登录方法
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      setUser(data.user);
      setToken(data.session?.access_token || null);
    } catch (err) {
      console.error('登录失败:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // 登出方法
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setUser(null);
      setToken(null);
    } catch (err) {
      console.error('登出失败:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    user,
    token,
    loading,
    error,
    signIn,
    signOut
  };
} 