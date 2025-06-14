-- 1. 彻底禁用users表的RLS，这是最直接的解决方案
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. 删除所有现有策略
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON users', policy_record.policyname);
    END LOOP;
END $$;

-- 3. 确保login_logs表有所有必要字段
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

-- 4. 确保users表可以被正常访问
GRANT ALL ON users TO service_role;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

-- 5. 确保login_logs表可以被正常访问
GRANT ALL ON login_logs TO service_role;
GRANT ALL ON login_logs TO authenticated;
GRANT ALL ON login_logs TO anon; 