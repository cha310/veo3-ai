-- 创建users表
CREATE TABLE IF NOT EXISTS public.users (
    id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar_url TEXT,
    provider TEXT,
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 创建登录日志表
CREATE TABLE IF NOT EXISTS public.login_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    device_type TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 为users表添加RLS策略
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和修改自己的信息
CREATE POLICY "Users can view own profile" 
    ON public.users 
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.users 
    FOR UPDATE 
    USING (auth.uid() = id);

-- 登录时可以插入新用户
CREATE POLICY "Service role can insert users" 
    ON public.users 
    FOR INSERT 
    WITH CHECK (true);

-- 为登录日志表添加RLS策略
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的登录日志
CREATE POLICY "Users can view own login logs" 
    ON public.login_logs 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 允许插入登录日志
CREATE POLICY "Allow insert login logs" 
    ON public.login_logs 
    FOR INSERT 
    WITH CHECK (true);

-- 创建公共函数来获取当前用户资料
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS SETOF public.users
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT *
    FROM public.users
    WHERE id = auth.uid();
$$; 