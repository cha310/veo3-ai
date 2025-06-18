const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const http = require('http');
const { initWebSocketServer } = require('./websocket');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

// 创建HTTP服务器，用于同时支持Express和WebSocket
const server = http.createServer(app);

// 确保日志目录存在
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log('已创建日志目录:', logDir);
}

// 详细的CORS配置
const corsOptions = {
  origin: function(origin, callback) {
    // 允许所有来源，包括没有origin的请求
    console.log('CORS请求来源:', origin || '同源请求');
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Access-Control-Allow-Origin', 'Origin', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: false,
  maxAge: 86400 // 预检请求缓存24小时
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 请求记录中间件
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  };
  
  console.log(`${timestamp} - ${req.method} ${req.url}`);
  
  // 保存请求详细信息到日志
  if (req.method !== 'OPTIONS') {
    const requestLogPath = path.join(logDir, 'requests.log');
    fs.appendFile(
      requestLogPath, 
      JSON.stringify(logData) + '\n',
      (err) => {
        if (err) console.error('写入请求日志失败:', err);
      }
    );
  }
  
  next();
});

// 导入路由
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const creditRoutes = require('./routes/credits');

// 静态文件
const distPath = path.join(__dirname, '../dist');
console.log('静态文件路径：', distPath);
app.use(express.static(distPath));

// 注册API路由
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/credits', creditRoutes);

// 添加健康检查端点
app.get('/health', (req, res) => {
  res.status(200).send('服务器正常运行');
});

// 404处理
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false, 
      message: '请求的API端点不存在' 
    });
  }
  next();
});

// 所有路由请求转发到前端
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist', 'index.html');
  console.log('请求路径:', req.path);
  console.log('提供文件:', indexPath);
  res.sendFile(indexPath);
});

// 初始化WebSocket服务
const wss = initWebSocketServer(server);

// 启动HTTP服务器
server.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器已启动，运行在端口 ${PORT}`);
  console.log(`网站可通过 http://localhost:${PORT} 访问`);
  console.log(`WebSocket服务可通过 ws://localhost:${PORT} 访问`);
  console.log(`服务器监听在所有网络接口上 (0.0.0.0:${PORT})`);
  console.log(`管理员密码: ${process.env.ADMIN_PASSWORD || 'veoai-admin-2024'}`);
}); 