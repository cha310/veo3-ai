import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 显示请求信息
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 静态文件目录
const staticPath = path.join(__dirname, 'dist');
console.log(`提供静态文件，路径: ${staticPath}`);
app.use(express.static(staticPath));

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).send('静态服务器正常运行');
});

// 所有其他请求返回index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`静态文件服务器已启动，运行在端口 ${PORT}`);
  console.log(`访问 http://localhost:${PORT} 查看网站`);
}); 