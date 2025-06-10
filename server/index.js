const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

// 详细的CORS配置
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:9000', 'https://www.veo3-ai.net'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true,
  optionsSuccessStatus: 200
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 导入路由
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// 静态文件
const distPath = path.join(__dirname, '../dist');
console.log('静态文件路径：', distPath);
app.use(express.static(distPath));

// 注册API路由
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// 打印所有请求的日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 添加健康检查端点
app.get('/health', (req, res) => {
  res.status(200).send('服务器正常运行');
});

// 所有路由请求转发到前端
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist', 'index.html');
  console.log('请求路径:', req.path);
  console.log('提供文件:', indexPath);
  res.sendFile(indexPath);
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器已启动，运行在端口 ${PORT}`);
  console.log(`网站可通过 http://localhost:${PORT} 访问`);
  console.log(`服务器监听在所有网络接口上 (0.0.0.0:${PORT})`);
  console.log(`管理员密码: ${process.env.ADMIN_PASSWORD || 'veoai-admin-2024'}`);
}); 