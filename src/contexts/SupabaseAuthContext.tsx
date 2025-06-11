import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase.ts';
import { Session, User } from '@supabase/supabase-js';

// 定义上下文类型
interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// 创建上下文
const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

// 上下文提供者组件
export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时获取会话状态
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('获取会话错误:', error);
        }
        
        setSession(session);
        setUser(session?.user || null);
      } catch (err) {
        console.error('获取会话异常:', err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 监听身份验证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    // 清理订阅
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 登录函数 - 使用魔术链接
  const signIn = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('登录错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // 清除本地存储
      localStorage.removeItem('user');
      
      // 重新加载页面以确保状态一致
      window.location.reload();
    } catch (error) {
      console.error('登出错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// 使用钩子
export const useSupabaseAuth = (): SupabaseAuthContextType => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export default SupabaseAuthContext; 