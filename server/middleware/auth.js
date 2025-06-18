/**
 * 认证中间件
 */

const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取配置
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('[Auth Middleware] 未检测到 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 环境变量，认证中间件将无法正常工作。');
}

if (!JWT_SECRET) {
  console.warn('[Auth Middleware] 未检测到 JWT_SECRET 或 SUPABASE_JWT_SECRET 环境变量，JWT验证将无法正常工作。');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * 验证JWT令牌中间件
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
const authenticateToken = async (req, res, next) => {
  try {
    // 从请求头中获取Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: '未提供认证Token' });
    }
    
    // 验证JWT Token
    try {
      // 尝试使用JWT直接验证
      if (JWT_SECRET) {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.sub };
        return next();
      } else {
        // 回退到Supabase验证
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data?.user) {
          throw new Error('无效的Token');
        }
        req.user = { id: data.user.id };
        return next();
      }
    } catch (err) {
      console.error('[Auth Middleware] Token验证失败:', err.message);
      return res.status(403).json({ error: '无效的Token' });
    }
  } catch (err) {
    console.error('[Auth Middleware] 认证中间件错误:', err.message);
    return res.status(500).json({ error: '服务器内部错误' });
  }
};

module.exports = {
  authenticateToken
}; 