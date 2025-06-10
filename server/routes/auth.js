const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 日志文件路径
const LOG_FILE_PATH = path.join(__dirname, '../logs/login_logs.json');

// 确保日志目录存在
const ensureLogDirectoryExists = () => {
  const logDir = path.dirname(LOG_FILE_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // 确保日志文件存在
  if (!fs.existsSync(LOG_FILE_PATH)) {
    fs.writeFileSync(LOG_FILE_PATH, JSON.stringify([]));
  }
};

// 记录用户登录信息
router.post('/log-login', (req, res) => {
  try {
    console.log('收到登录日志请求:', req.body);
    console.log('请求头:', req.headers);
    
    ensureLogDirectoryExists();
    
    const { email, name, picture, userAgent, ipAddress } = req.body;
    
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
    res.status(500).json({ success: false, error: '记录登录信息失败' });
  }
});

// 管理员获取所有登录记录
// 这里应该添加适当的认证中间件来保护这个端点
router.get('/login-logs', (req, res) => {
  try {
    console.log('收到管理员日志查询请求');
    console.log('查询参数:', req.query);
    console.log('请求头:', req.headers);
    
    ensureLogDirectoryExists();
    
    // 这里可以添加管理员身份验证逻辑
    // 简单的密码验证 (实际应用中应使用更安全的方法)
    const adminPassword = req.query.password;
    
    // 管理员密码应该存储在环境变量中
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'veoai-admin-2024';
    
    console.log('环境变量中的管理员密码:', process.env.ADMIN_PASSWORD);
    console.log('使用的管理员密码:', ADMIN_PASSWORD);
    
    if (adminPassword !== ADMIN_PASSWORD) {
      console.log('密码不匹配，拒绝访问');
      return res.status(401).json({ success: false, message: '未授权访问' });
    }
    
    // 读取日志文件
    const logData = fs.readFileSync(LOG_FILE_PATH, 'utf8');
    const logs = JSON.parse(logData);
    
    console.log('认证成功，返回日志条目数:', logs.length);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error('获取登录日志错误:', error);
    res.status(500).json({ success: false, error: '获取登录日志失败' });
  }
});

module.exports = router;
