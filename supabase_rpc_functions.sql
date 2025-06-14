-- 创建一个安全的RPC函数来获取用户积分
CREATE OR REPLACE FUNCTION public.get_user_credits(user_id UUID)
RETURNS TABLE (credits INTEGER) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT u.credits
  FROM users u
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql;

-- 确保函数可以被调用
GRANT EXECUTE ON FUNCTION public.get_user_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_credits(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_credits(UUID) TO service_role; 