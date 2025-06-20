import supabase from '../lib/supabase';
import UAParser from 'ua-parser-js';

/**
 * 记录用户登录信息（1分钟内只插入一次）
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
    // 1. 查询1分钟内是否已有记录
    const since = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recent, error: queryError } = await supabase
      .from('login_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('login_time', since)
      .limit(1);
    if (queryError) {
      console.error('查询登录去重失败:', queryError);
      // 查询失败时，保险起见还是允许插入
    } else if (recent && recent.length > 0) {
      // 1分钟内已有记录，不再插入
      return { success: true, skipped: true, message: '1分钟内已记录，无需重复插入' };
    }

    // 获取IP地址
    let ipAddress = 'unknown';
    
    // 尝试获取IP地址 - 简单方法
    try {
      // 尝试使用ipify服务获取IP
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json', { 
          signal: controller.signal 
        });
        if (ipResponse.ok) {
          const data = await ipResponse.json();
          ipAddress = data.ip;
        }
      } catch (error) {
        console.error('获取IP失败，继续主流程:', error);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('获取IP地址失败，继续主流程:', error);
    }

    // 解析设备类型及相关信息
    let device_type = 'unknown';
    let os_name = '';
    let browser_name = '';
    let device_brand = '';
    let device_model = '';
    let is_mobile = false;
    try {
      const parser = new UAParser();
      parser.setUA(userAgent);
      const device = parser.getDevice();
      const os = parser.getOS();
      const browser = parser.getBrowser();
      if (device.type) {
        device_type = device.type; // mobile, tablet, etc.
        is_mobile = device.type === 'mobile' || device.type === 'tablet';
      } else {
        device_type = 'desktop';
        is_mobile = false;
      }
      os_name = os.name || '';
      browser_name = browser.name || '';
      device_brand = device.vendor || '';
      device_model = device.model || '';
    } catch (error) {
      console.error('解析设备类型失败:', error);
    }

    // 获取本地时间字符串
    let local_time = '';
    try {
      local_time = new Date().toLocaleString();
    } catch (error) {
      local_time = '';
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
          provider: provider,
          device_type,
          local_time,
          os_name,
          browser_name,
          device_brand,
          device_model,
          is_mobile
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