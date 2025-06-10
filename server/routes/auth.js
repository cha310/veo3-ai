const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 日志文件路径
const LOG_FILE_PATH = path.join(__dirname, '../logs/login_logs.json');

// 管理员身份验证中间件
const adminAuth = (req, res, next) => {
  try {
    const adminPassword = req.query.password;
    // 管理员密码应该存储在环境变量中
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'veoai-admin-2024';
    
    if (!adminPassword) {
      return res.status(401).json({ 
        success: false, 
        message: '未提供管理员密码' 
      });
    }
    
    if (adminPassword !== ADMIN_PASSWORD) {
      console.log('管理员密码验证失败，提供的密码:', adminPassword);
      return res.status(401).json({ 
        success: false, 
        message: '管理员密码错误' 
      });
    }
    
    // 验证通过
    next();
  } catch (error) {
    console.error('管理员验证错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '管理员验证过程中发生错误' 
    });
  }
};

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
    res.status(200).json({ success: true, logs });
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
