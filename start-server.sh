#!/bin/bash

# 显示当前工作目录
echo "当前工作目录: $(pwd)"

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
  echo "错误: dist目录不存在，请先运行 'npm run build'"
  exit 1
fi

# 检查dist/index.html文件是否存在
if [ ! -f "dist/index.html" ]; then
  echo "错误: dist/index.html 不存在，构建可能有问题"
  exit 1
fi

# 显示dist目录内容
echo "dist目录内容:"
ls -la dist

# 启动服务器
echo "正在启动服务器..."
cd server && node index.js 