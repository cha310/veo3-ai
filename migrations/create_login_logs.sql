-- 删除旧表（如果存在）
DROP TABLE IF EXISTS public.login_logs;

-- 创建新的登录日志表，使用TEXT类型的user_id
CREATE TABLE IF NOT EXISTS public.login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT, -- 改为TEXT类型，可以接受任何类型的ID
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON public.login_logs(created_at);

-- 启用RLS (行级安全)
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- 创建开放策略以允许匿名插入
CREATE POLICY "允许所有用户插入登录日志" ON public.login_logs
  FOR INSERT TO anon, authenticated USING (true);

-- 创建策略允许查看登录日志
CREATE POLICY "允许查看所有登录日志" ON public.login_logs
  FOR SELECT USING (true); 