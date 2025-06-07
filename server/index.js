const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use(express.static(path.join(__dirname, '../dist')));

// 所有路由请求转发到前端
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器已启动，运行在端口 ${PORT}`);
  console.log(`网站可通过 http://localhost:${PORT} 访问`);
  console.log(`服务器监听在所有网络接口上 (0.0.0.0:${PORT})`);
}); 