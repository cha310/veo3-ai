import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../lib/supabase.ts';
import { Session, User } from '@supabase/supabase-js';

// 定义上下文类型
interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// 创建上下文
const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

// 用于强制刷新会话的函数
const refreshUserSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('刷新会话时发生错误:', error);
      return null;
    }
    return data.session;
  } catch (err) {
    console.error('刷新会话异常:', err);
    return null;
  }
};

// 上下文提供者组件
export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 刷新会话状态的函数
  const refreshSession = async () => {
    try {
      const session = await refreshUserSession();
      if (session) {
        console.log('会话刷新成功:', session.user.id);
        setSession(session);
        setUser(session.user);
        
        // 存储用户基本信息到localStorage，确保UI一致性
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          picture: session.user.user_metadata?.avatar_url,
          credits: 0
        };
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.log('会话刷新 - 无有效会话');
        setSession(null);
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (err) {
      console.error('刷新会话出错:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取会话状态
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      await refreshSession();
    };

    initSession();

    // 监听身份验证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('认证状态变化:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('用户已登录，更新会话状态');
          setSession(session);
          setUser(session.user);
          
          // 存储用户基本信息到localStorage
          const userData = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            picture: session.user.user_metadata?.avatar_url,
            credits: 0
          };
          localStorage.setItem('user', JSON.stringify(userData));
          
          // 刷新页面以确保全应用状态一致
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('用户已登出，清除状态');
          setSession(null);
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('googleUserInfo');
        }
        
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
      console.log('使用魔术链接登录:', email);
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
  
  // Google登录函数 - 使用Supabase OAuth
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      console.log('开始Google OAuth登录流程');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Supabase OAuth流程启动:', data);
    } catch (error) {
      console.error('Google登录错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const signOut = async () => {
    setLoading(true);
    try {
      console.log('开始登出流程');
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // 清除本地存储
      localStorage.removeItem('user');
      localStorage.removeItem('googleUserInfo');
      
      // 重定向到当前域名根路径
      window.location.href = window.location.origin;
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
    signInWithGoogle,
    signOut,
    refreshSession,
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