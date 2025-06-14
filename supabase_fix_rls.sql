-- 1. 查看当前users表的RLS策略
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 2. 临时禁用RLS，解决紧急问题
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 3. 删除可能有问题的策略
DROP POLICY IF EXISTS "用户可以查看自己的资料" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

-- 4. 重新创建正确的策略
-- 允许用户查看自己的资料
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- 允许用户更新自己的资料
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 允许服务角色查看所有用户
CREATE POLICY "Service role can view all users" ON users
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. 重新启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. 确保login_logs表有所有必要字段
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS local_time TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS city_code TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS timezone TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS isp TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS os_name TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS browser_name TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS device_brand TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS device_model TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS is_mobile BOOLEAN; 