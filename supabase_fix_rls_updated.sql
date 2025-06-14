-- 1. 完全禁用users表的RLS，解决递归错误问题
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. 删除所有可能存在的策略
DROP POLICY IF EXISTS "用户可以查看自己的资料" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Service role can view all users" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;

-- 3. 创建简单且正确的策略
-- 允许所有操作，但仅限于用户自己的数据
CREATE POLICY "Enable all for users based on user_id" ON users
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. 允许服务角色完全访问
CREATE POLICY "Service role has full access" ON users
  USING (auth.jwt() ->> 'role' = 'service_role');

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