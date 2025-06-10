const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// 测试端点
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: '管理员API测试成功',
    timestamp: new Date().toISOString()
  });
});

// 获取服务器状态
router.get('/status', (req, res) => {
  // 这里应该添加管理员身份验证逻辑
  const adminPassword = req.query.password;
  
  // 管理员密码应该存储在环境变量中
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'veoai-admin-2024';
  
  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, message: '未授权访问' });
  }
  
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
});

module.exports = router;
