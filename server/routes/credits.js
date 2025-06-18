const express = require('express');
const router = express.Router();

// 引入Supabase客户端
const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取Supabase配置
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('[credits route] 未检测到 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 环境变量，积分接口将无法工作。');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 解析Bearer Token并验证
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: '缺少Bearer Token' });
    }

    const { data: userData, error } = await supabase.auth.getUser(token);
    if (error || !userData?.user) {
      console.error('Supabase 验证失败 →', error);
      console.error('收到的 JWT 前 40 字符 →', token.slice(0, 40));
      return res.status(401).json({ success: false, message: '无效的Token' });
    }

    // 将用户信息附加到请求对象
    req.user = userData.user;
    next();
  } catch (err) {
    console.error('验证Token异常:', err);
    res.status(500).json({ success: false, message: '身份验证失败' });
  }
};

// GET /api/credits/balance  返回当前用户积分余额
router.get('/balance', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 调用存储过程获取总积分
    const { data: totalRows, error: totalErr } = await supabase.rpc('get_user_credits', { user_id: userId });
    if (totalErr) {
      console.error('获取总积分失败:', totalErr);
      return res.status(500).json({ success: false, message: '获取积分失败' });
    }
    const totalCredits = Array.isArray(totalRows) && totalRows.length ? totalRows[0].credits : 0;

    // 调用存储过程获取有效积分明细
    const { data: balances, error: balErr } = await supabase.rpc('get_user_credit_balances', { user_id: userId });
    if (balErr) {
      console.error('获取积分明细失败:', balErr);
      return res.status(500).json({ success: false, message: '获取积分失败' });
    }

    res.status(200).json({
      success: true,
      data: {
        total_credits: totalCredits,
        balances: balances || []
      }
    });
  } catch (err) {
    console.error('查询积分余额接口报错:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

module.exports = router; 