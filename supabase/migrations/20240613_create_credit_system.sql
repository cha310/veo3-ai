-- ===============================
-- 阶段2：积分系统数据库结构
-- 该脚本创建积分系统所需的表、索引、函数和RLS策略。
-- 执行顺序：应在用户表(users)已存在的基础上执行。
-- ===============================

-- 1. subscriptions 表
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_provider TEXT NOT NULL,
  payment_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- 触发器：自动更新时间戳
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION trigger_update_timestamp();

-- 2. credit_packages 表
CREATE TABLE IF NOT EXISTS public.credit_packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  expires_in INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. credit_balances 表
CREATE TABLE IF NOT EXISTS public.credit_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  source TEXT NOT NULL,
  source_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_credit_balances_user_id ON public.credit_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_expires_at ON public.credit_balances(expires_at);

-- 4. credit_transactions 表
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  type TEXT NOT NULL,
  source TEXT,
  description TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);

-- 5. 行级安全 (RLS) 设置
-- 启用RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在），然后创建新策略

-- 订阅表策略
DROP POLICY IF EXISTS "用户可以查看自己的订阅" ON public.subscriptions;
CREATE POLICY "用户可以查看自己的订阅" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 积分余额表策略
DROP POLICY IF EXISTS "用户可以查看自己的积分余额" ON public.credit_balances;
CREATE POLICY "用户可以查看自己的积分余额" ON public.credit_balances
  FOR SELECT USING (auth.uid() = user_id);

-- 积分交易记录表策略
DROP POLICY IF EXISTS "用户可以查看自己的积分交易记录" ON public.credit_transactions;
CREATE POLICY "用户可以查看自己的积分交易记录" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- 积分包配置表策略
DROP POLICY IF EXISTS "所有用户可以查看积分包配置" ON public.credit_packages;
CREATE POLICY "所有用户可以查看积分包配置" ON public.credit_packages
  FOR SELECT USING (true);

-- 6. 常用函数

-- 6.1 获取用户积分总额
CREATE OR REPLACE FUNCTION public.get_user_credits(p_user_id UUID)
RETURNS TABLE (credits INTEGER)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.credits
  FROM public.users u
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 6.2 获取有效积分余额明细
CREATE OR REPLACE FUNCTION public.get_user_credit_balances(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  amount INTEGER,
  source TEXT,
  source_id TEXT,
  expires_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cb.id,
    cb.amount,
    cb.source,
    cb.source_id,
    cb.expires_at
  FROM public.credit_balances cb
  WHERE cb.user_id = get_user_credit_balances.p_user_id
    AND cb.amount > 0
    AND (cb.expires_at IS NULL OR cb.expires_at > NOW())
  ORDER BY
    CASE WHEN cb.expires_at IS NULL THEN 1 ELSE 0 END,
    cb.expires_at ASC;
END;
$$ LANGUAGE plpgsql;

-- 6.3 消费积分函数
CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_source TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_credits INTEGER;
  v_record RECORD;
  v_remaining INTEGER := p_amount;
  v_consumed INTEGER := 0;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- 获取用户当前积分
  SELECT credits INTO v_total_credits FROM public.users WHERE id = p_user_id;

  -- 检查积分是否足够
  IF v_total_credits < p_amount THEN
    RETURN FALSE;
  END IF;

  -- 遍历积分余额, 优先消费即将过期的积分
  FOR v_record IN SELECT * FROM public.get_user_credit_balances(p_user_id) LOOP
    EXIT WHEN v_remaining <= 0;
    v_consumed := LEAST(v_record.amount, v_remaining);
    UPDATE public.credit_balances
    SET amount = amount - v_consumed,
        updated_at = NOW()
    WHERE id = v_record.id;
    v_remaining := v_remaining - v_consumed;
  END LOOP;

  -- 更新用户总积分
  UPDATE public.users
  SET credits = credits - p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- 记录交易
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    balance_after,
    type,
    source,
    description
  ) VALUES (
    p_user_id,
    -p_amount,
    v_total_credits - p_amount,
    p_type,
    p_source,
    p_description
  );

  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 6.4 发放积分函数
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_source TEXT,
  p_source_id TEXT DEFAULT NULL,
  p_expires_in INTEGER DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_credits INTEGER;
  v_expires_at TIMESTAMPTZ := NULL;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- 计算过期时间
  IF p_expires_in IS NOT NULL THEN
    v_expires_at := NOW() + (p_expires_in || ' days')::INTERVAL;
  END IF;

  SELECT credits INTO v_total_credits FROM public.users WHERE id = p_user_id;

  -- 添加积分余额记录
  INSERT INTO public.credit_balances (
    user_id,
    amount,
    source,
    source_id,
    expires_at
  ) VALUES (
    p_user_id,
    p_amount,
    p_type,
    p_source_id,
    v_expires_at
  );

  -- 更新用户总积分
  UPDATE public.users
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- 记录交易
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    balance_after,
    type,
    source,
    description,
    expires_at
  ) VALUES (
    p_user_id,
    p_amount,
    v_total_credits + p_amount,
    p_type,
    p_source,
    p_description,
    v_expires_at
  );

  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  RAISE;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- 7. 授权函数执行权限
GRANT EXECUTE ON FUNCTION public.get_user_credits(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_credit_balances(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.consume_credits(UUID, INTEGER, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_credits(UUID, INTEGER, TEXT, TEXT, TEXT, INTEGER, TEXT) TO service_role;

-- 8. 完成
-- ===============================
