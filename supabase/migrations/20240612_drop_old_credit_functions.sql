-- 删除旧版积分系统函数（若存在，可重复执行）

DROP FUNCTION IF EXISTS public.get_user_credits(uuid);
DROP FUNCTION IF EXISTS public.get_user_credit_balances(uuid);
DROP FUNCTION IF EXISTS public.consume_credits(uuid, integer, text, text, text);
DROP FUNCTION IF EXISTS public.add_credits(uuid, integer, text, text, text, integer, text); 