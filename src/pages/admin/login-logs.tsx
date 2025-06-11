import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import supabase from '../../lib/supabase.ts';

interface LoginLog {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  device_type: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export default function LoginLogs() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // 检查用户身份验证
  useEffect(() => {
    const checkAuth = async () => {
      // 从localStorage获取用户信息，检查是否为管理员
      const userString = localStorage.getItem('user');
      if (!userString) {
        router.push('/');
        return;
      }
      
      try {
        const user = JSON.parse(userString);
        // 这里应该有一个更严格的检查，例如检查用户角色或特定邮箱
        // 这里只是一个简单的示例，您应该实现更严格的访问控制
        if (user.email) {
          setIsAuthenticated(true);
          fetchLogs();
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('解析用户信息错误:', error);
        router.push('/');
      }
    };
    
    checkAuth();
  }, [router]);

  // 获取登录日志
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error, count } = await supabase
        .from('login_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 10, page * 10 - 1);
      
      if (error) {
        throw error;
      }
      
      setLogs(data || []);
      if (count) {
        setTotalPages(Math.ceil(count / 10));
      }
    } catch (error) {
      console.error('获取登录日志错误:', error);
      alert('获取日志失败');
    } finally {
      setLoading(false);
    }
  };

  // 切换页面
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // 当页码改变时重新获取数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
    }
  }, [page, isAuthenticated]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  if (!isAuthenticated) {
    return <div className="text-center p-10">正在验证身份...</div>;
  }

  return (
    <>
      <Head>
        <title>登录日志 - 管理后台</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">登录日志</h1>
        
        {loading ? (
          <div className="text-center p-10">加载中...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">用户ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IP地址</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">设备类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.user_id ? log.user_id.substring(0, 8) + '...' : '未登录'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.ip_address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{log.device_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.success ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'}`}>
                          {log.success ? '成功' : '失败'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(log.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            <div className="flex justify-between items-center mt-6">
              <button 
                onClick={() => handlePageChange(page - 1)} 
                disabled={page === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                上一页
              </button>
              <span className="text-sm">
                第 {page} 页，共 {totalPages} 页
              </span>
              <button 
                onClick={() => handlePageChange(page + 1)} 
                disabled={page === totalPages}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                下一页
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
} 