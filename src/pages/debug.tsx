import { useState, useEffect } from 'react';
import supabase from '../lib/supabase.ts';

export default function DebugPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSupabase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 测试连接
      const { data: tableData, error: tableError } = await supabase
        .from('login_logs')
        .select('*')
        .limit(5);
      
      if (tableError) {
        throw tableError;
      }
      
      // 测试插入
      const testData = {
        user_id: 'test-user-' + Date.now(),
        ip_address: '127.0.0.1',
        user_agent: navigator.userAgent,
        device_type: 'browser',
        success: true
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('login_logs')
        .insert([testData])
        .select();
      
      if (insertError) {
        throw insertError;
      }
      
      setResult({
        existingData: tableData,
        insertedData: insertData
      });
    } catch (err: any) {
      console.error('Supabase测试错误:', err);
      setError(err.message || '未知错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase调试页面</h1>
      
      <button
        onClick={testSupabase}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? '测试中...' : '测试Supabase连接'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">错误:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">测试结果:</h2>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">现有数据:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
              {JSON.stringify(result.existingData, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">插入的数据:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
              {JSON.stringify(result.insertedData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 