-- 创建users表（如果不存在）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT,
  credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 创建触发器更新updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 启用RLS (行级安全)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "允许用户查看自己的信息" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "允许用户更新自己的信息" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "允许用户插入自己的信息" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 如果需要公开查询特定字段
CREATE POLICY "允许公开查询用户名和头像" ON public.users
  FOR SELECT USING (true) WITH CHECK (true)
  USING (true); 