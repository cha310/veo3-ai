import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface LoginLog {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  timestamp: string;
  userAgent: string;
  ipAddress: string;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  // API基础URL
  const API_BASE_URL = 'http://localhost:9000'; // 开发环境
  // const API_BASE_URL = ''; // 生产环境使用相对路径

  // 测试后端连接
  const testBackendConnection = async () => {
    try {
      setTestResult('正在测试后端连接...');
      const response = await axios.get(`${API_BASE_URL}/health`);
      setTestResult(`后端连接成功: ${response.data}`);
    } catch (err: any) {
      setTestResult(`后端连接失败: ${err.message}`);
    }
  };

  // 测试管理员API
  const testAdminApi = async () => {
    try {
      setTestResult('正在测试管理员API...');
      const response = await axios.get(`${API_BASE_URL}/api/admin/test`);
      setTestResult(`管理员API测试成功: ${JSON.stringify(response.data)}`);
    } catch (err: any) {
      setTestResult(`管理员API测试失败: ${err.message}`);
    }
  };

  // 测试服务器状态
  const testServerStatus = async () => {
    try {
      setTestResult('正在获取服务器状态...');
      const response = await axios.get(`${API_BASE_URL}/api/admin/status?password=${password || 'veoai-admin-2024'}`);
      setTestResult(`服务器状态: ${JSON.stringify(response.data, null, 2)}`);
    } catch (err: any) {
      setTestResult(`获取服务器状态失败: ${err.message}`);
    }
  };

  // 获取登录日志
  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('正在尝试登录，密码:', password);
      const response = await axios.get(`${API_BASE_URL}/api/auth/login-logs?password=${password}`);
      console.log('登录响应:', response);
      
      if (response.data.success) {
        setLogs(response.data.logs);
        setIsAuthenticated(true);
        
        // 保存认证状态到 sessionStorage
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('adminPassword', password);
      }
    } catch (err: any) {
      console.error('获取日志失败:', err);
      // 显示更详细的错误信息
      setError(err.response?.data?.message || err.message || '认证失败或获取日志出错');
      setIsAuthenticated(false);
      
      // 清除认证状态
      sessionStorage.removeItem('adminAuthenticated');
      sessionStorage.removeItem('adminPassword');
    } finally {
      setLoading(false);
    }
  };

  // 检查是否已认证
  useEffect(() => {
    const authenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const savedPassword = sessionStorage.getItem('adminPassword');
    
    if (authenticated && savedPassword) {
      setIsAuthenticated(true);
      setPassword(savedPassword);
      
      // 自动获取日志
      (async () => {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/auth/login-logs?password=${savedPassword}`);
          if (response.data.success) {
            setLogs(response.data.logs);
          } else {
            setIsAuthenticated(false);
            sessionStorage.removeItem('adminAuthenticated');
            sessionStorage.removeItem('adminPassword');
          }
        } catch (err) {
          setIsAuthenticated(false);
          sessionStorage.removeItem('adminAuthenticated');
          sessionStorage.removeItem('adminPassword');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, []);

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  // 处理登录表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  // 处理退出登录
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminPassword');
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">VEOAI 用户登录记录</h1>
        
        {/* 测试区域 */}
        <div className="mb-6 bg-gray-800 p-4 rounded-lg">
          <div className="mb-4">
            <button 
              onClick={testBackendConnection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm mr-4"
            >
              测试后端连接
            </button>
            <button 
              onClick={testAdminApi}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm mr-4"
            >
              测试管理员API
            </button>
            <button 
              onClick={testServerStatus}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm"
            >
              测试服务器状态
            </button>
          </div>
          {testResult && (
            <div className="mt-2 p-2 bg-gray-900 rounded text-sm whitespace-pre-wrap">
              {testResult}
            </div>
          )}
        </div>
        
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto bg-[#1a1e27] rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">管理员登录</h2>
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded-md mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">管理员密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#252a37] border border-[#343a4d] rounded-lg py-3 px-4 text-white placeholder-gray-500"
                  placeholder="请输入管理员密码"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6C5CE7] hover:bg-[#5A49E8] disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? '正在验证...' : '登录'}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-[#1a1e27] rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">用户登录记录</h2>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                退出登录
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6C5CE7]"></div>
                <p className="mt-2 text-gray-400">正在加载日志数据...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                暂无登录记录
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        用户邮箱
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        用户名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        登录时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        IP 地址
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        浏览器信息
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#252a37]">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {log.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            {log.picture && (
                              <img 
                                src={log.picture} 
                                alt={log.name} 
                                className="h-8 w-8 rounded-full mr-2" 
                              />
                            )}
                            {log.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDateTime(log.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {log.ipAddress}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="max-w-xs truncate" title={log.userAgent}>
                            {log.userAgent}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogs; 