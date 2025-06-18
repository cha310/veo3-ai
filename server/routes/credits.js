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

// 验证管理员权限
const verifyAdmin = async (req, res, next) => {
  try {
    // 从配置文件中读取管理员列表
    const adminConfig = require('../config/admin_config.json');
    const adminEmails = adminConfig.admin_emails || [];
    
    // 检查用户邮箱是否在管理员列表中
    if (!req.user || !req.user.email || !adminEmails.includes(req.user.email)) {
      return res.status(403).json({ success: false, message: '无管理员权限' });
    }
    
    next();
  } catch (err) {
    console.error('验证管理员权限异常:', err);
    res.status(500).json({ success: false, message: '权限验证失败' });
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

// POST /api/credits/add/subscription - 发放订阅积分
router.post('/add/subscription', verifyAuth, async (req, res) => {
  try {
    // 验证请求体
    const { user_id, amount, subscription_id, plan_id, expires_in } = req.body;
    
    if (!user_id || !amount || !subscription_id || !plan_id) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数',
        error: { code: 'INVALID_PARAMETERS' } 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: '积分数量必须为正数',
        error: { code: 'INVALID_PARAMETERS' } 
      });
    }
    
    // 调用存储过程添加积分
    const { data, error } = await supabase.rpc('add_credits', {
      p_user_id: user_id,
      p_amount: amount,
      p_type: 'subscription',
      p_source: subscription_id,
      p_source_id: plan_id,
      p_expires_in: expires_in || null,
      p_description: `${plan_id}订阅月度积分`
    });
    
    if (error) {
      console.error('发放订阅积分失败:', error);
      return res.status(500).json({ 
        success: false, 
        message: '发放积分失败',
        error: { code: 'INTERNAL_ERROR' } 
      });
    }
    
    // 获取更新后的用户积分
    const { data: userCredits, error: creditsError } = await supabase.rpc('get_user_credits', { user_id });
    
    if (creditsError) {
      console.error('获取用户积分失败:', creditsError);
    }
    
    const totalCredits = Array.isArray(userCredits) && userCredits.length ? userCredits[0].credits : 0;
    
    // 计算过期时间
    let expiresAt = null;
    if (expires_in) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expires_in);
    }
    
    res.status(200).json({
      success: true,
      data: {
        transaction_id: data || 'unknown',
        amount,
        balance_after: totalCredits,
        expires_at: expiresAt
      }
    });
  } catch (err) {
    console.error('发放订阅积分接口报错:', err);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: { code: 'INTERNAL_ERROR' } 
    });
  }
});

// POST /api/credits/add/purchase - 发放购买积分
router.post('/add/purchase', verifyAuth, async (req, res) => {
  try {
    // 验证请求体
    const { user_id, amount, package_id, payment_id } = req.body;
    
    if (!user_id || !amount || !package_id) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数',
        error: { code: 'INVALID_PARAMETERS' } 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: '积分数量必须为正数',
        error: { code: 'INVALID_PARAMETERS' } 
      });
    }
    
    // 查询积分包配置，获取过期时间
    const { data: packageData, error: packageError } = await supabase
      .from('credit_packages')
      .select('expires_in')
      .eq('id', package_id)
      .single();
      
    if (packageError && packageError.code !== 'PGRST116') { // PGRST116 是"没有找到记录"的错误
      console.error('查询积分包配置失败:', packageError);
    }
    
    const expiresIn = packageData?.expires_in || null;
    
    // 调用存储过程添加积分
    const { data, error } = await supabase.rpc('add_credits', {
      p_user_id: user_id,
      p_amount: amount,
      p_type: 'purchase',
      p_source: package_id,
      p_source_id: payment_id || null,
      p_expires_in: expiresIn,
      p_description: `购买${package_id}积分包`
    });
    
    if (error) {
      console.error('发放购买积分失败:', error);
      return res.status(500).json({ 
        success: false, 
        message: '发放积分失败',
        error: { code: 'INTERNAL_ERROR' } 
      });
    }
    
    // 获取更新后的用户积分
    const { data: userCredits, error: creditsError } = await supabase.rpc('get_user_credits', { user_id });
    
    if (creditsError) {
      console.error('获取用户积分失败:', creditsError);
    }
    
    const totalCredits = Array.isArray(userCredits) && userCredits.length ? userCredits[0].credits : 0;
    
    // 计算过期时间
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresIn);
    }
    
    res.status(200).json({
      success: true,
      data: {
        transaction_id: data || 'unknown',
        amount,
        balance_after: totalCredits,
        expires_at: expiresAt
      }
    });
  } catch (err) {
    console.error('发放购买积分接口报错:', err);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: { code: 'INTERNAL_ERROR' } 
    });
  }
});

// POST /api/credits/add/manual - 管理员手动发放积分
router.post('/add/manual', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    // 验证请求体
    const { user_id, amount, reason, expires_in } = req.body;
    
    if (!user_id || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数',
        error: { code: 'INVALID_PARAMETERS' } 
      });
    }
    
    // 调用存储过程添加积分
    const { data, error } = await supabase.rpc('add_credits', {
      p_user_id: user_id,
      p_amount: amount,
      p_type: 'adjustment',
      p_source: 'manual',
      p_source_id: null,
      p_expires_in: expires_in || null,
      p_description: reason || '管理员手动调整'
    });
    
    if (error) {
      console.error('手动发放积分失败:', error);
      return res.status(500).json({ 
        success: false, 
        message: '发放积分失败',
        error: { code: 'INTERNAL_ERROR' } 
      });
    }
    
    // 获取更新后的用户积分
    const { data: userCredits, error: creditsError } = await supabase.rpc('get_user_credits', { user_id });
    
    if (creditsError) {
      console.error('获取用户积分失败:', creditsError);
    }
    
    const totalCredits = Array.isArray(userCredits) && userCredits.length ? userCredits[0].credits : 0;
    
    // 计算过期时间
    let expiresAt = null;
    if (expires_in) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expires_in);
    }
    
    res.status(200).json({
      success: true,
      data: {
        transaction_id: data || 'unknown',
        amount,
        balance_after: totalCredits,
        expires_at: expiresAt
      }
    });
  } catch (err) {
    console.error('手动发放积分接口报错:', err);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: { code: 'INTERNAL_ERROR' } 
    });
  }
});

// POST /api/credits/consume - 消费积分
router.post('/consume', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, type, source, description } = req.body;
    
    if (!amount || !type || !source) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数',
        error: { code: 'INVALID_PARAMETERS' } 
      });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: '消费积分数量必须为正数',
        error: { code: 'INVALID_PARAMETERS' } 
      });
    }
    
    // 调用存储过程消费积分
    const { data, error } = await supabase.rpc('consume_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_type: type,
      p_source: source,
      p_description: description || null
    });
    
    if (error) {
      console.error('消费积分失败:', error);
      return res.status(500).json({ 
        success: false, 
        message: '消费积分失败',
        error: { code: 'INTERNAL_ERROR' } 
      });
    }
    
    // 如果返回false，表示积分不足
    if (data === false) {
      return res.status(400).json({
        success: false,
        message: '积分不足',
        error: {
          code: 'INSUFFICIENT_CREDITS'
        }
      });
    }
    
    // 获取更新后的用户积分
    const { data: userCredits, error: creditsError } = await supabase.rpc('get_user_credits', { user_id: userId });
    
    if (creditsError) {
      console.error('获取用户积分失败:', creditsError);
    }
    
    const totalCredits = Array.isArray(userCredits) && userCredits.length ? userCredits[0].credits : 0;
    
    res.status(200).json({
      success: true,
      data: {
        amount,
        balance_after: totalCredits
      }
    });
  } catch (err) {
    console.error('消费积分接口报错:', err);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: { code: 'INTERNAL_ERROR' } 
    });
  }
});

// GET /api/credits/transactions - 获取当前用户积分交易记录
router.get('/transactions', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0, type = 'all', start_date, end_date } = req.query;
    
    // 构建查询
    let query = supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // 应用过滤条件
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    
    if (end_date) {
      // 添加一天，使得结束日期是包含的
      const endDateObj = new Date(end_date);
      endDateObj.setDate(endDateObj.getDate() + 1);
      query = query.lt('created_at', endDateObj.toISOString());
    }
    
    // 应用分页
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    // 执行查询
    const { data, error, count } = await query;
    
    if (error) {
      console.error('获取积分交易记录失败:', error);
      return res.status(500).json({ 
        success: false, 
        message: '获取交易记录失败',
        error: { code: 'INTERNAL_ERROR' } 
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        total: count || 0,
        transactions: data || []
      }
    });
  } catch (err) {
    console.error('获取积分交易记录接口报错:', err);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: { code: 'INTERNAL_ERROR' } 
    });
  }
});

// POST /api/credits/transactions - 直接写入积分变动记录（不改变用户实际积分）
router.post('/transactions', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { user_id, amount, type, source, description, metadata } = req.body;
    
    if (!user_id || amount === undefined || !type) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必要参数',
        error: { code: 'INVALID_PARAMETERS' } 
      });
    }
    
    // 获取用户当前积分余额
    const { data: userCredits, error: creditsError } = await supabase.rpc('get_user_credits', { user_id });
    
    if (creditsError) {
      console.error('获取用户积分失败:', creditsError);
      return res.status(500).json({ 
        success: false, 
        message: '获取用户积分失败',
        error: { code: 'INTERNAL_ERROR' } 
      });
    }
    
    const currentCredits = Array.isArray(userCredits) && userCredits.length ? userCredits[0].credits : 0;
    
    // 直接写入交易记录，不改变用户实际积分
    const { data, error } = await supabase
      .from('credit_transactions')
      .insert({
        user_id,
        amount,
        balance_after: currentCredits, // 使用当前余额，不实际改变用户积分
        type,
        source,
        description,
        metadata: metadata || null
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('写入积分变动记录失败:', error);
      return res.status(500).json({ 
        success: false, 
        message: '写入积分变动记录失败',
        error: { code: 'INTERNAL_ERROR' } 
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        transaction_id: data.id,
        amount,
        balance_after: currentCredits
      }
    });
  } catch (err) {
    console.error('写入积分变动记录接口报错:', err);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: { code: 'INTERNAL_ERROR' } 
    });
  }
});

// GET /api/credits/transactions/admin/:userId - 管理员获取指定用户的积分交易记录
router.get('/transactions/admin/:userId', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0, type = 'all', start_date, end_date } = req.query;
    
    // 构建查询
    let query = supabase
      .from('credit_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // 应用过滤条件
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    
    if (end_date) {
      // 添加一天，使得结束日期是包含的
      const endDateObj = new Date(end_date);
      endDateObj.setDate(endDateObj.getDate() + 1);
      query = query.lt('created_at', endDateObj.toISOString());
    }
    
    // 应用分页
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    // 执行查询
    const { data, error, count } = await query;
    
    if (error) {
      console.error('管理员获取用户积分交易记录失败:', error);
      return res.status(500).json({ 
        success: false, 
        message: '获取交易记录失败',
        error: { code: 'INTERNAL_ERROR' } 
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        total: count || 0,
        transactions: data || []
      }
    });
  } catch (err) {
    console.error('管理员获取用户积分交易记录接口报错:', err);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: { code: 'INTERNAL_ERROR' } 
    });
  }
});

// POST /api/credits/batch-transactions - 批量写入积分变动记录
router.post('/batch-transactions', verifyAuth, verifyAdmin, async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少有效的交易记录数组',
        error: { code: 'INVALID_PARAMETERS' } 
      });
    }
    
    // 验证每条记录的必要字段
    for (const transaction of transactions) {
      if (!transaction.user_id || transaction.amount === undefined || !transaction.type) {
        return res.status(400).json({ 
          success: false, 
          message: '交易记录缺少必要参数',
          error: { code: 'INVALID_PARAMETERS' } 
        });
      }
    }
    
    // 获取每个用户的当前积分余额
    const userIds = [...new Set(transactions.map(t => t.user_id))];
    const userCreditsMap = {};
    
    for (const userId of userIds) {
      const { data: userCredits, error: creditsError } = await supabase.rpc('get_user_credits', { user_id: userId });
      
      if (creditsError) {
        console.error(`获取用户 ${userId} 积分失败:`, creditsError);
        continue;
      }
      
      userCreditsMap[userId] = Array.isArray(userCredits) && userCredits.length ? userCredits[0].credits : 0;
    }
    
    // 准备插入数据
    const recordsToInsert = transactions.map(t => ({
      user_id: t.user_id,
      amount: t.amount,
      balance_after: userCreditsMap[t.user_id] || 0, // 使用查询到的当前余额
      type: t.type,
      source: t.source || null,
      description: t.description || null,
      metadata: t.metadata || null
    }));
    
    // 批量插入交易记录
    const { data, error } = await supabase
      .from('credit_transactions')
      .insert(recordsToInsert)
      .select('id');
    
    if (error) {
      console.error('批量写入积分变动记录失败:', error);
      return res.status(500).json({ 
        success: false, 
        message: '批量写入积分变动记录失败',
        error: { code: 'INTERNAL_ERROR' } 
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        inserted_count: data.length,
        transaction_ids: data.map(item => item.id)
      }
    });
  } catch (err) {
    console.error('批量写入积分变动记录接口报错:', err);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误',
      error: { code: 'INTERNAL_ERROR' } 
    });
  }
});

module.exports = router; 