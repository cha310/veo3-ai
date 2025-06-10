const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

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

// 测试端点
router.get('/test', (req, res) => {
  try {
    console.log('收到管理员API测试请求');
    
    res.status(200).json({
      success: true,
      message: '管理员API测试成功',
      timestamp: new Date().toISOString()
    });
    console.log('管理员API测试响应已发送');
  } catch (error) {
    console.error('管理员API测试错误:', error);
    res.status(500).json({
      success: false,
      message: '管理员API测试失败',
      error: error.message
    });
  }
});

// 获取服务器状态 (使用管理员验证中间件)
router.get('/status', adminAuth, (req, res) => {
  try {
    console.log('收到服务器状态请求');
    
    // 获取服务器状态信息
    const status = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json({ success: true, status });
    console.log('服务器状态响应已发送');
  } catch (error) {
    console.error('获取服务器状态错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取服务器状态失败', 
      error: error.message 
    });
  }
});

module.exports = router;
