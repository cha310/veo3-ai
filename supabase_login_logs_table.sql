-- 创建登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_time ON login_logs(login_time);

-- 设置行级安全策略
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以查看所有记录
CREATE POLICY "管理员可以查看所有登录记录" ON login_logs
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE auth.email() IN ('admin@example.com') -- 替换为实际管理员邮箱
    )
  );

-- 用户只能查看自己的登录记录
CREATE POLICY "用户可以查看自己的登录记录" ON login_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 允许插入登录记录（任何已认证用户都可以记录自己的登录）
CREATE POLICY "允许记录登录" ON login_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 不允许更新或删除登录记录
CREATE POLICY "禁止更新登录记录" ON login_logs
  FOR UPDATE USING (false);

CREATE POLICY "禁止删除登录记录" ON login_logs
  FOR DELETE USING (false); 