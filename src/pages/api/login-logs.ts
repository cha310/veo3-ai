import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../lib/supabase.ts';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 仅允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '仅支持GET方法' });
  }

  try {
    // 从查询参数中获取分页参数
    const { page = '1', limit = '10', userId } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * limitNumber;

    // 构建查询
    let query = supabase
      .from('login_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNumber - 1);

    // 如果提供了userId，则按用户ID筛选
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // 执行查询
    const { data, error, count } = await query;

    if (error) {
      console.error('获取登录日志错误:', error);
      return res.status(500).json({ error: '获取登录日志失败', details: error.message });
    }

    // 返回结果
    return res.status(200).json({
      logs: data,
      total: count,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil((count || 0) / limitNumber)
    });
  } catch (error) {
    console.error('处理登录日志请求错误:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
} 