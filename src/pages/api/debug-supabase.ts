import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabase.ts';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // 测试连接
    const { data: healthCheck, error: healthError } = await supabase.from('login_logs').select('count(*)', { count: 'exact', head: true });
    
    // 获取表结构
    const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_definition', { table_name: 'login_logs' }).select();
    
    // 测试插入
    const testData = {
      user_id: 'test-user-' + Date.now(),
      ip_address: '127.0.0.1',
      user_agent: 'Debug API',
      device_type: 'server',
      success: true
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('login_logs')
      .insert([testData])
      .select();
    
    return res.status(200).json({
      connection: {
        success: !healthError,
        error: healthError,
        count: healthCheck
      },
      tableInfo: {
        success: !tableError,
        error: tableError,
        data: tableInfo
      },
      insertTest: {
        success: !insertError,
        error: insertError,
        data: insertResult
      }
    });
  } catch (error) {
    console.error('调试Supabase连接错误:', error);
    return res.status(500).json({ error: '服务器内部错误', details: error });
  }
} 