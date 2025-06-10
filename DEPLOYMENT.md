# Veo3-AI 网站部署指南

## 问题诊断

根据诊断，网站无法访问的可能原因：

1. **本地网络限制**：无法通过localhost访问服务器
2. **服务器配置问题**：远程服务器返回空响应
3. **构建问题**：静态文件未正确生成或提供

## 线上部署步骤

### 1. 准备环境

确保服务器上安装了以下软件：
- Node.js 16+
- npm 或 yarn
- PM2（用于进程管理）：`npm install -g pm2`
- Nginx（可选，用于反向代理）

### 2. 下载代码并安装依赖

```bash
# 克隆或上传代码到服务器
cd /path/to/veo3-ai

# 安装前端依赖
npm install

# 安装服务器依赖
cd server
npm install
cd ..
```

### 3. 构建前端

```bash
npm run build
```

确保生成了 `dist` 目录，并包含正确的文件。

### 4. 配置服务器

修改 `server/index.js` 文件，确保：
- 正确设置了端口（通常80或443需要root权限）
- 正确配置了静态文件路径

### 5. 使用PM2启动服务器

```bash
# 从项目根目录启动
pm2 start server/index.js --name veo3-server
```

### 6. 配置Nginx（推荐）

创建Nginx配置文件 `/etc/nginx/sites-available/veo3-ai.net`：

```nginx
server {
    listen 80;
    server_name veo3-ai.net www.veo3-ai.net;

    # 重定向HTTP到HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name veo3-ai.net www.veo3-ai.net;

    # SSL证书配置
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # 静态文件目录
    root /path/to/veo3-ai/dist;
    index index.html;
    
    # 日志
    access_log /var/log/nginx/veo3-ai.access.log;
    error_log /var/log/nginx/veo3-ai.error.log;
    
    # 代理API请求到Node.js服务器
    location /api {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 所有其他请求发送到index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置并重启Nginx：

```bash
ln -s /etc/nginx/sites-available/veo3-ai.net /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 7. 检查服务状态

```bash
pm2 status
pm2 logs veo3-server
```

## 网站无法访问的常见问题及解决方案

1. **端口被占用**：尝试使用不同的端口
   ```bash
   # 检查端口使用情况
   lsof -i :80
   lsof -i :443
   ```

2. **防火墙限制**：确保允许HTTP/HTTPS流量
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   
   # CentOS/RHEL
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --permanent --add-service=https
   sudo firewall-cmd --reload
   ```

3. **DNS问题**：确保域名解析正确
   ```bash
   # 检查DNS解析
   dig veo3-ai.net
   ```

4. **SSL证书问题**：确保证书有效且正确配置
   ```bash
   # 检查SSL证书
   openssl s_client -connect veo3-ai.net:443 -servername veo3-ai.net
   ```

5. **静态文件路径问题**：确保文件存在且有正确的权限
   ```bash
   # 检查静态文件
   ls -la /path/to/veo3-ai/dist
   ```

如果上述步骤仍无法解决问题，请检查服务器日志以获取更详细的错误信息：
```bash
tail -f /var/log/nginx/veo3-ai.error.log
pm2 logs veo3-server
``` 

## 管理员功能

### 用户登录记录

系统会自动记录用户登录信息，包括邮箱、名称、头像、登录时间、IP地址和浏览器信息。

管理员可以通过访问 `/admin-logs` 页面，输入管理员密码（默认为 `veoai-admin-2024`）来查看所有用户的登录记录。

如需修改管理员密码，请在服务器的环境变量中设置 `ADMIN_PASSWORD`。

### 日志数据存储

用户登录信息存储在 `server/logs/login_logs.json` 文件中。这些数据只能通过管理员面板访问，普通用户无法查看。

如果需要备份登录数据，可以直接复制该JSON文件。 