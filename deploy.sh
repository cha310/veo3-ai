#!/bin/bash

# 显示当前时间
echo "开始部署: $(date)"

# 显示当前工作目录
echo "当前工作目录: $(pwd)"

# 安装依赖
echo "安装前端依赖..."
npm install

echo "安装服务器依赖..."
cd server && npm install && cd ..

# 构建前端
echo "构建前端..."
npm run build

# 确保dist目录存在
if [ ! -d "dist" ]; then
  echo "错误: 构建失败，dist目录不存在"
  exit 1
fi

# 部署服务器
echo "部署服务器..."
pm2 stop veo3-server || true
pm2 delete veo3-server || true
pm2 start server/index.js --name veo3-server

echo "部署完成: $(date)"
echo "可以通过以下命令查看日志:"
echo "pm2 logs veo3-server" 