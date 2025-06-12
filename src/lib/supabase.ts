import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase配置
// 如果未设置环境变量，则使用硬编码的值作为后备
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fijmggqhxqjszrnaqnio.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpam1nZ3FoeHFqc3pybmFxbmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDY2NDcsImV4cCI6MjA2NTEyMjY0N30.CdTls1LPjS8t_7B4gz8yBNwQGvm3JR_Ms3A11SUCx2Y';
const siteUrl = import.meta.env.VITE_SITE_URL || 'https://www.veo3-ai.net';

// 创建Supabase客户端
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage, // 显式指定使用localStorage作为存储
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'veo3-ai',
    },
  },
});

// 添加全局错误处理器
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth状态变化:', event, session ? '有会话' : '无会话');
  
  // 可以在这里处理全局认证状态变化
  if (event === 'SIGNED_IN') {
    console.log('用户已登录，用户ID:', session?.user?.id);
  } else if (event === 'SIGNED_OUT') {
    console.log('用户已登出');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('令牌已刷新');
  } else if (event === 'USER_UPDATED') {
    console.log('用户信息已更新');
  }
});

// 输出调试信息
console.log('Supabase客户端已初始化');
console.log('当前网站URL:', siteUrl);

export default supabase; 