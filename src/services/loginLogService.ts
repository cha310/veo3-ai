import supabase from '../lib/supabase';

/**
 * 记录用户登录信息
 * @param userId 用户ID
 * @param provider 登录提供商（例如：google, github等）
 * @param userAgent 用户浏览器信息
 * @returns 操作结果
 */
export const recordLoginActivity = async (
  userId: string,
  provider: string = 'google',
  userAgent: string = navigator.userAgent
) => {
  try {
    // 获取IP地址（通过外部服务）
    let ipAddress = 'unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        ipAddress = ipData.ip;
      }
    } catch (error) {
      console.error('获取IP地址失败:', error);
    }

    // 记录登录信息到数据库
    const { data, error } = await supabase
      .from('login_logs')
      .insert([
        {
          user_id: userId,
          login_time: new Date().toISOString(),
          ip_address: ipAddress,
          user_agent: userAgent,
          provider: provider
        }
      ]);

    if (error) {
      console.error('记录登录信息失败:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('记录登录活动异常:', error);
    return { success: false, error };
  }
};

/**
 * 获取用户的登录历史记录
 * @param userId 用户ID
 * @param limit 限制返回的记录数量
 * @returns 登录历史记录
 */
export const getUserLoginHistory = async (userId: string, limit: number = 10) => {
  try {
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .eq('user_id', userId)
      .order('login_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取登录历史失败:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('获取登录历史异常:', error);
    return { success: false, error };
  }
}; 