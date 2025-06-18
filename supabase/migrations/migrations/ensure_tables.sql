-- 确保用户表存在
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为users表添加注释
COMMENT ON TABLE public.users IS '存储用户扩展信息，关联到auth.users';
COMMENT ON COLUMN public.users.id IS '与auth.users表关联的用户ID';
COMMENT ON COLUMN public.users.provider IS '第三方认证提供商，如google';
COMMENT ON COLUMN public.users.credits IS '用户积分';

-- 创建登录日志表
CREATE TABLE IF NOT EXISTS public.login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT, -- 使用TEXT类型，避免外键约束问题
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 为login_logs表添加注释
COMMENT ON TABLE public.login_logs IS '记录用户登录历史';
COMMENT ON COLUMN public.login_logs.user_id IS '用户ID，可以是未注册用户或匿名用户';
COMMENT ON COLUMN public.login_logs.device_type IS '登录设备类型：desktop, mobile, tablet';

-- 确保索引存在
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON public.login_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_login_logs_success ON public.login_logs(success);

-- 启用RLS (行级安全)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户表策略
DROP POLICY IF EXISTS "用户可以查看自己的资料" ON public.users;
CREATE POLICY "用户可以查看自己的资料" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "用户可以更新自己的资料" ON public.users;
CREATE POLICY "用户可以更新自己的资料" ON public.users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "管理员可以查看所有用户资料" ON public.users;
CREATE POLICY "管理员可以查看所有用户资料" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND email = 'admin@example.com'
    )
  );

-- 登录日志表策略
DROP POLICY IF EXISTS "允许匿名插入登录日志" ON public.login_logs;
CREATE POLICY "允许匿名插入登录日志" ON public.login_logs
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "用户可以查看自己的登录日志" ON public.login_logs;
CREATE POLICY "用户可以查看自己的登录日志" ON public.login_logs
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "管理员可以查看所有登录日志" ON public.login_logs;
CREATE POLICY "管理员可以查看所有登录日志" ON public.login_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND email = 'admin@example.com'
    )
  ); 