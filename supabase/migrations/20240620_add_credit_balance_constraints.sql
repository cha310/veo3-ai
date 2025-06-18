-- 添加积分余额约束，确保余额不为负
-- 1. 为users表添加检查约束
ALTER TABLE public.users
ADD CONSTRAINT credits_non_negative CHECK (credits >= 0);

-- 2. 为credit_balances表添加检查约束
-- 注意：PostgreSQL的ALTER TABLE ADD CONSTRAINT不支持IF NOT EXISTS语法
-- 先检查约束是否存在，不存在则添加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'positive_balance' AND conrelid = 'public.credit_balances'::regclass
  ) THEN
    ALTER TABLE public.credit_balances
    ADD CONSTRAINT positive_balance CHECK (amount >= 0);
  END IF;
END
$$;

-- 3. 修改consume_credits函数，增强余额校验
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
  v_balance_record RECORD;
  v_remaining INTEGER := p_amount;
  v_consumed INTEGER := 0;
  v_available_credits INTEGER := 0;
BEGIN
  -- 检查参数
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- 获取用户总积分
  SELECT credits INTO v_total_credits FROM users WHERE id = p_user_id;
  IF v_total_credits IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  -- 检查积分是否足够
  IF v_total_credits < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- 计算可用积分总额（双重校验）
  SELECT COALESCE(SUM(amount), 0) INTO v_available_credits 
  FROM credit_balances 
  WHERE user_id = p_user_id 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND amount > 0;
  
  -- 再次检查积分是否足够
  IF v_available_credits < p_amount THEN
    -- 如果数据不一致，尝试修复用户总积分
    UPDATE users SET credits = v_available_credits WHERE id = p_user_id;
    RETURN FALSE;
  END IF;
  
  -- 开始事务
  BEGIN
    -- 按过期时间优先消费积分
    FOR v_balance_record IN 
      SELECT * FROM get_user_credit_balances(p_user_id)
    LOOP
      -- 计算本次消费数量
      v_consumed := LEAST(v_balance_record.amount, v_remaining);
      
      -- 更新余额
      UPDATE credit_balances
      SET amount = amount - v_consumed,
          updated_at = NOW()
      WHERE id = v_balance_record.id;
      
      -- 减少剩余需消费数量
      v_remaining := v_remaining - v_consumed;
      
      -- 如果已经消费完所需积分，退出循环
      IF v_remaining <= 0 THEN
        EXIT;
      END IF;
    END LOOP;
    
    -- 如果仍有剩余未消费的积分，说明出现了问题
    IF v_remaining > 0 THEN
      RAISE EXCEPTION 'Failed to consume all required credits. Remaining: %', v_remaining;
    END IF;
    
    -- 更新用户总积分
    UPDATE users
    SET credits = credits - p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- 记录交易
    INSERT INTO credit_transactions (
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
  EXCEPTION
    WHEN OTHERS THEN
      RAISE;
      RETURN FALSE;
  END;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建一个新的函数用于校验和修复积分余额
CREATE OR REPLACE FUNCTION public.validate_user_credits(p_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_credits INTEGER;
  v_available_credits INTEGER;
BEGIN
  -- 获取用户总积分
  SELECT credits INTO v_total_credits FROM users WHERE id = p_user_id;
  IF v_total_credits IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  -- 计算实际可用积分总额
  SELECT COALESCE(SUM(amount), 0) INTO v_available_credits 
  FROM credit_balances 
  WHERE user_id = p_user_id 
    AND (expires_at IS NULL OR expires_at > NOW())
    AND amount > 0;
  
  -- 如果总积分与可用积分不一致，进行修复
  IF v_total_credits != v_available_credits THEN
    UPDATE users SET credits = v_available_credits, updated_at = NOW() WHERE id = p_user_id;
    
    -- 记录修复操作
    INSERT INTO credit_transactions (
      user_id,
      amount,
      balance_after,
      type,
      source,
      description
    ) VALUES (
      p_user_id,
      v_available_credits - v_total_credits,
      v_available_credits,
      'adjustment',
      'system',
      '系统自动修复积分余额不一致'
    );
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE; -- 无需修复
END;
$$ LANGUAGE plpgsql;

-- 授权
GRANT EXECUTE ON FUNCTION public.validate_user_credits(UUID) TO service_role; 