import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { simulateSubscriptionSuccess } from '../services/subscriptionService';
import { fetchUserCredits, validateUserCredits } from '../services/creditService';
import { useCredits } from '../contexts/CreditContext';

const DebugPage: React.FC = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [sessionData, setSessionData] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [planId, setPlanId] = useState<'lite' | 'pro' | 'pro_plus'>('pro');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  
  // 使用积分上下文
  const { 
    totalCredits, 
    balances, 
    connectionState, 
    connectionType, 
    refreshCredits 
  } = useCredits();

  // 获取本地存储数据
  useEffect(() => {
    const getSessionData = async () => {
      // 显示会话信息
      setSessionData(session);

      // 显示本地存储数据
      const userData = localStorage.getItem('user');
      const tokenData = localStorage.getItem('supabaseToken');
      setLocalStorageData({
        user: userData ? JSON.parse(userData) : null,
        token: tokenData
      });
    };

    getSessionData();
  }, [session, supabase.auth]);

  useEffect(() => {
    // 获取当前用户ID
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
    
    // 获取用户积分
    fetchUserCredits()
      .then(data => setCredits(data.total))
      .catch(err => console.error('获取积分失败:', err));
  }, [session?.user?.id]);

  // 刷新会话
  const refreshSession = async () => {
    setLoading(true);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      setSessionData(data.session);
      setMessage('会话已刷新');
    } catch (error: any) {
      setMessage(`刷新会话失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 清除本地存储
  const clearLocalStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('supabaseToken');
    setLocalStorageData(null);
    setMessage('本地存储已清除');
  };

  const handleSimulateSubscription = async () => {
    if (!userId) {
      setError('请先输入用户ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await simulateSubscriptionSuccess(userId, planId);
      setResult(response);
      
      // 更新积分显示
      const creditsData = await fetchUserCredits();
      setCredits(creditsData.total);
    } catch (err: any) {
      setError(err.message || '模拟订阅失败');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCredits = async () => {
    if (!userId) {
      setError('请先输入用户ID');
      return;
    }

    setLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const response = await validateUserCredits();
      setValidationResult(response);
      
      // 更新积分显示
      const creditsData = await fetchUserCredits();
      setCredits(creditsData.total);
    } catch (err: any) {
      setError(err.message || '验证积分失败');
    } finally {
      setLoading(false);
    }
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
          
          {/* 实时积分余额状态 */}
          <div className="bg-[#1a1e27] p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold mb-4">实时积分余额状态</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2">总积分: <span className="font-bold">{totalCredits}</span></p>
                <p className="mb-2">连接状态: <span className="font-bold">{connectionState}</span></p>
                <p className="mb-2">连接类型: <span className="font-bold">{connectionType}</span></p>
                <button 
                  onClick={() => refreshCredits()}
                  className="mt-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md"
                >
                  刷新积分
                </button>
              </div>
              <div>
                <h3 className="font-bold mb-2">积分明细:</h3>
                <div className="bg-[#0d1117] p-4 rounded-md overflow-auto max-h-48">
                  {balances.length > 0 ? (
                    <ul>
                      {balances.map((balance, index) => (
                        <li key={index} className="mb-1">
                          {balance.amount} 积分 
                          {balance.expires_at && ` (到期: ${new Date(balance.expires_at).toLocaleDateString()})`}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>无积分明细</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
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
                  onClick={refreshSession}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md disabled:opacity-50"
                >
                  刷新会话
                </button>
                <button 
                  onClick={clearLocalStorage}
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
              <h2 className="text-xl font-bold mb-4">会话数据</h2>
              <pre className="bg-[#0d1117] p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 mb-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">当前积分: {credits !== null ? credits : '加载中...'}</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">用户ID:</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="输入用户ID"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">订阅计划:</label>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value as 'lite' | 'pro' | 'pro_plus')}
                className="w-full border rounded px-3 py-2"
              >
                <option value="lite">Lite (600积分)</option>
                <option value="pro">Pro (1200积分)</option>
                <option value="pro_plus">Pro+ (2500积分)</option>
              </select>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleSimulateSubscription}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? '处理中...' : '模拟订阅成功'}
              </button>
              
              <button
                onClick={handleValidateCredits}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
              >
                {loading ? '处理中...' : '验证积分余额'}
              </button>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                错误: {error}
              </div>
            )}
          </div>
          
          {result && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">订阅结果:</h2>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {validationResult && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2 text-gray-800">验证结果:</h2>
              <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(validationResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DebugPage; 