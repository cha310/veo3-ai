import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DebugPage: React.FC = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [cookieData, setCookieData] = useState<string>('');
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 获取本地存储数据
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setLocalStorageData(JSON.parse(userData));
      } catch (e) {
        setLocalStorageData({ error: '无法解析本地存储数据' });
      }
    } else {
      setLocalStorageData({ message: '本地存储中没有用户数据' });
    }

    // 获取Cookie
    setCookieData(document.cookie);
  }, [session]);

  // 获取会话数据
  useEffect(() => {
    const getSessionData = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setSessionData({ error: error.message });
        } else {
          setSessionData(data);
        }
      } catch (err) {
        setSessionData({ error: '获取会话时出错' });
      }
    };

    getSessionData();
  }, [session, supabase.auth]);

  // 刷新会话
  const handleRefreshSession = async () => {
    setLoading(true);
    setMessage('正在刷新会话...');
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        setMessage(`会话刷新失败: ${error.message}`);
      } else {
        setMessage('会话刷新成功');
        setSessionData(data);
      }
    } catch (error) {
      setMessage(`会话刷新异常: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试Google登录
  const handleTestGoogleLogin = async () => {
    setLoading(true);
    setMessage('开始Google登录测试...');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/debug',
        },
      });
      
      if (error) {
        setMessage(`登录错误: ${error.message}`);
      } else {
        setMessage('正在重定向到Google...');
      }
    } catch (error) {
      setMessage(`登录异常: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 登出
  const handleSignOut = async () => {
    setLoading(true);
    setMessage('正在登出...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage(`登出错误: ${error.message}`);
      } else {
        setMessage('登出成功');
        // 刷新页面
        window.location.reload();
      }
    } catch (error) {
      setMessage(`登出异常: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // 清除本地存储
  const handleClearLocalStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('googleUserInfo');
    setLocalStorageData({ message: '本地存储已清除' });
    setMessage('本地存储已清除');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#121a22] text-white pt-20 pb-10">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">身份验证调试</h1>
          
          {message && (
            <div className="bg-blue-900 p-4 rounded-lg mb-6">
              <p>{message}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#1a1e27] p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">用户状态</h2>
              <p className="mb-2">登录状态: <span className="font-bold">{session ? '已登录' : '未登录'}</span></p>
              <p className="mb-2">用户邮箱: <span className="font-bold">{session?.user?.email || '无'}</span></p>
              <p className="mb-2">用户ID: <span className="font-bold">{session?.user?.id || '无'}</span></p>
              <p className="mb-2">会话有效: <span className="font-bold">{session ? '是' : '否'}</span></p>
            </div>
            
            <div className="bg-[#1a1e27] p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">操作</h2>
              <div className="flex flex-col space-y-3">
                <button 
                  onClick={handleRefreshSession}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md disabled:opacity-50"
                >
                  刷新会话
                </button>
                <button 
                  onClick={handleTestGoogleLogin}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md disabled:opacity-50"
                >
                  测试Google登录
                </button>
                <button 
                  onClick={handleSignOut}
                  disabled={loading || !session}
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-md disabled:opacity-50"
                >
                  登出
                </button>
                <button 
                  onClick={handleClearLocalStorage}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
                >
                  清除本地存储
                </button>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-[#1a1e27] p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">本地存储数据</h2>
              <pre className="bg-[#0d1117] p-4 rounded-md overflow-auto max-h-48">
                {JSON.stringify(localStorageData, null, 2)}
              </pre>
            </div>
            
            <div className="bg-[#1a1e27] p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Cookie 数据</h2>
              <pre className="bg-[#0d1117] p-4 rounded-md overflow-auto max-h-48">
                {cookieData || '无Cookie数据'}
              </pre>
            </div>
            
            <div className="bg-[#1a1e27] p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">会话数据</h2>
              <pre className="bg-[#0d1117] p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DebugPage; 