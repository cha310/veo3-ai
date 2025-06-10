const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const adminConfig = require('../config/admin');

// 日志文件路径
const LOG_FILE_PATH = path.join(__dirname, '../logs/login_logs.json');
const ADMIN_LOG_PATH = path.join(__dirname, '../logs/admin_logs.json');

// 管理员身份验证中间件
const adminAuth = (req, res, next) => {
  try {
    // 检查是否提供了令牌
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken;
    
    if (token) {
      // 验证令牌
      const admin = adminConfig.validateAuthToken(token);
      if (admin) {
        // 将管理员信息附加到请求对象
        req.admin = admin;
        return next();
      }
    }
    
    // 检查是否提供了用户名和密码
    const { username, password } = req.body;
    const queryPassword = req.query.password;
    
    // 兼容旧方式：只提供密码
    if (queryPassword && !username) {
      // 旧的验证方式，仅检查密码是否匹配默认密码
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'veoai-admin-2024';
      if (queryPassword === ADMIN_PASSWORD) {
        req.admin = {
          id: '1',
          username: 'admin',
          displayName: '系统管理员',
          role: 'super_admin'
        };
        return next();
      }
      
      console.log('管理员密码验证失败，提供的密码:', queryPassword);
      return res.status(401).json({ 
        success: false, 
        message: '管理员密码错误' 
      });
    }
    
    // 新的验证方式，检查用户名和密码
    if (username && password) {
      const admin = adminConfig.validateAdmin(username, password);
      if (admin) {
        // 将管理员信息附加到请求对象
        req.admin = admin;
        
        // 创建身份验证令牌
        const token = adminConfig.createAuthToken(admin);
        
        // 记录管理员登录
        logAdminLogin(admin, req);
        
        // 在响应中设置令牌
        res.cookie('adminToken', token, { 
          httpOnly: true, 
          secure: process.env.NODE_ENV === 'production',
          maxAge: adminConfig.getAdminConfig().security.tokenExpiresIn * 60 * 60 * 1000
        });
        
        return next();
      }
    }
    
    // 未提供有效的身份验证信息
    return res.status(401).json({ 
      success: false, 
      message: '未提供有效的管理员身份验证信息' 
    });
  } catch (error) {
    console.error('管理员验证错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '管理员验证过程中发生错误' 
    });
  }
};

// 记录管理员登录信息
function logAdminLogin(admin, req) {
  if (!adminConfig.getAdminConfig().audit.enableLoginLog) {
    return;
  }
  
  try {
    // 确保日志目录存在
    const logDir = path.dirname(ADMIN_LOG_PATH);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // 读取现有日志
    let logs = [];
    if (fs.existsSync(ADMIN_LOG_PATH)) {
      try {
        const logData = fs.readFileSync(ADMIN_LOG_PATH, 'utf8');
        logs = JSON.parse(logData);
      } catch (error) {
        console.error('读取管理员日志文件错误:', error);
      }
    }
    
    // 创建新的日志条目
    const newLog = {
      id: uuidv4(),
      adminId: admin.id,
      username: admin.username,
      displayName: admin.displayName,
      action: 'login',
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || '未知',
      ipAddress: req.ip || req.connection.remoteAddress || '未知',
    };
    
    // 添加新日志
    logs.push(newLog);
    
    // 写入日志文件
    fs.writeFileSync(ADMIN_LOG_PATH, JSON.stringify(logs, null, 2));
    
    console.log('管理员登录日志已记录:', admin.username);
  } catch (error) {
    console.error('记录管理员登录信息错误:', error);
  }
}

// 确保日志目录和文件存在
const ensureLogDirectoryExists = () => {
  try {
    const logDir = path.dirname(LOG_FILE_PATH);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
      console.log('已创建日志目录:', logDir);
    }
    
    // 确保日志文件存在
    if (!fs.existsSync(LOG_FILE_PATH)) {
      fs.writeFileSync(LOG_FILE_PATH, JSON.stringify([]));
      console.log('已创建日志文件:', LOG_FILE_PATH);
    }
  } catch (error) {
    console.error('创建日志目录或文件失败:', error);
    throw new Error('无法创建日志目录或文件');
  }
};

// 管理员登录端点
router.post('/admin-login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请提供用户名和密码'
      });
    }
    
    const admin = adminConfig.validateAdmin(username, password);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }
    
    // 创建身份验证令牌
    const token = adminConfig.createAuthToken(admin);
    
    // 记录管理员登录
    logAdminLogin(admin, req);
    
    // 在响应中设置令牌
    res.cookie('adminToken', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: adminConfig.getAdminConfig().security.tokenExpiresIn * 60 * 60 * 1000
    });
    
    res.status(200).json({
      success: true,
      message: '登录成功',
      admin: {
        id: admin.id,
        username: admin.username,
        displayName: admin.displayName,
        role: admin.role
      },
      token
    });
  } catch (error) {
    console.error('管理员登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录过程中发生错误',
      error: error.message
    });
  }
});

// 记录用户登录信息
router.post('/log-login', (req, res) => {
  try {
    console.log('收到登录日志请求:', req.body);
    
    ensureLogDirectoryExists();
    
    const { email, name, picture, userAgent, ipAddress } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: '邮箱是必须的' 
      });
    }
    
    // 读取现有日志
    let logs = [];
    try {
      const logData = fs.readFileSync(LOG_FILE_PATH, 'utf8');
      logs = JSON.parse(logData);
    } catch (error) {
      console.error('读取日志文件错误:', error);
      // 如果读取出错，创建新的日志数组
      logs = [];
    }
    
    // 创建新的日志条目
    const newLog = {
      id: uuidv4(),
      email,
      name: name || '未提供',
      picture: picture || null,
      timestamp: new Date().toISOString(),
      userAgent: userAgent || req.headers['user-agent'] || '未知',
      ipAddress: ipAddress || req.ip || req.connection.remoteAddress || '未知',
    };
    
    console.log('创建新日志条目:', newLog);
    
    // 添加新日志
    logs.push(newLog);
    
    // 写入日志文件
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify(logs, null, 2));
    
    console.log('日志写入成功，当前日志条目数:', logs.length);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('记录登录信息错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '记录登录信息失败', 
      error: error.message 
    });
  }
});

// 管理员获取所有登录记录 (使用管理员验证中间件)
router.get('/login-logs', adminAuth, (req, res) => {
  try {
    console.log('收到管理员日志查询请求');
    console.log('认证管理员:', req.admin);
    
    ensureLogDirectoryExists();
    
    // 读取日志文件
    const logData = fs.readFileSync(LOG_FILE_PATH, 'utf8');
    let logs = [];
    
    try {
      logs = JSON.parse(logData);
    } catch (error) {
      console.error('解析日志文件错误:', error);
      return res.status(500).json({ 
        success: false, 
        message: '日志文件格式错误' 
      });
    }
    
    // 按时间倒序排序
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log('认证成功，返回日志条目数:', logs.length);
    res.status(200).json({ 
      success: true, 
      logs,
      admin: req.admin
    });
  } catch (error) {
    console.error('获取登录日志错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取登录日志失败',
      error: error.message
    });
  }
});

module.exports = router;
