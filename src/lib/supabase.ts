import { createClient } from '@supabase/supabase-js';

// 从环境变量或硬编码值获取Supabase URL和匿名密钥
const supabaseUrl = 'https://fijmggqhxqjszrnaqnio.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpam1nZ3FoeHFqc3pybmFxbmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDY2NDcsImV4cCI6MjA2NTEyMjY0N30.CdTls1LPjS8t_7B4gz8yBNwQGvm3JR_Ms3A11SUCx2Y';

// 创建Supabase客户端，添加配置选项
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // 使用本地存储而不是cookie，避免可能的跨域问题
    storage: localStorage,
  },
});

// 输出调试信息
console.log('Supabase客户端已初始化，URL:', supabaseUrl);
console.log('当前域名:', window.location.origin);

// 添加会话检查函数
export const checkSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('会话检查错误:', error);
      return null;
    }
    return data.session;
  } catch (err) {
    console.error('会话检查异常:', err);
    return null;
  }
};

// 直接调用一次检查会话状态
checkSession().then(session => {
  if (session) {
    console.log('有效会话存在，用户ID:', session.user.id);
  } else {
    console.log('未检测到有效会话');
  }
});

export default supabase; 