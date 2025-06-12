# Supabase 认证配置指南

为确保Veo3 AI应用中的认证系统正常工作，请按照以下步骤配置您的Supabase项目。

## 1. 基本配置

1. 登录Supabase控制台：https://app.supabase.io
2. 进入您的项目 > 项目设置 > API
3. 确保以下设置正确：
   - 站点URL：设置为`https://www.veo3-ai.net`（生产环境）或`http://localhost:5173`（开发环境）
   - 重定向URL：添加`https://www.veo3-ai.net/`和`http://localhost:5173/`
   - 允许的URL：添加`https://www.veo3-ai.net`和`http://localhost:5173`

## 2. CORS 配置

1. 进入项目设置 > API > CORS (Cross-Origin Resource Sharing)
2. 在"允许的来源"中添加：
   - `https://www.veo3-ai.net`
   - `http://localhost:5173`
   - `http://localhost:3000`
3. 勾选"启用带有凭证的请求"选项

## 3. OAuth 提供商配置（Google）

1. 进入认证 > 提供商
2. 启用Google提供商
3. 配置Google客户端ID和密钥：
   - 客户端ID：`1049691614917-7ncrqa4qmmg4oiamn8i1dfbrvphicoju.apps.googleusercontent.com`
   - 客户端密钥：（请使用您的密钥，保持安全）
   - 重定向URL：使用Supabase提供的URL（通常为`https://xxx.supabase.co/auth/v1/callback`）

## 4. 数据库设置

确保数据库中存在以下表：

### 用户表 (users)

```sql
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique,
  name text,
  avatar_url text,
  provider text,
  credits integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 启用行级安全
alter table public.users enable row level security;

-- 创建安全策略：用户只能访问自己的数据
create policy "用户可以查看自己的资料" on public.users
  for select using (auth.uid() = id);

create policy "用户可以插入自己的数据" on public.users
  for insert with check (auth.uid() = id);

create policy "用户可以更新自己的数据" on public.users
  for update using (auth.uid() = id);
```

## 5. 触发器（可选）

创建触发器，在用户注册时自动创建用户记录：

```sql
-- 创建触发器函数
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar_url, provider)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'provider', 'email')
  );
  return new;
end;
$$ language plpgsql security definer;

-- 创建触发器
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 6. 环境变量设置

确保在应用的环境文件(`.env.local`或`.env.production`)中设置以下变量：

```
VITE_SUPABASE_URL=https://fijmggqhxqjszrnaqnio.supabase.co
VITE_SUPABASE_ANON_KEY=你的匿名密钥
VITE_SITE_URL=https://www.veo3-ai.net (生产) 或 http://localhost:5173 (开发)
VITE_GOOGLE_CLIENT_ID=1049691614917-7ncrqa4qmmg4oiamn8i1dfbrvphicoju.apps.googleusercontent.com
```

## 7. 认证设置

1. 进入认证 > 设置
2. 配置Email提供商：
   - 启用确认邮件
   - 设置确认URL为`https://www.veo3-ai.net/login`或`http://localhost:5173/login`
3. 会话设置：
   - 会话超时：使用默认值或根据需要调整（建议1209600秒，即14天）
   - 单点登录：根据需要启用/禁用

## 8. 故障排查提示

如果遇到认证问题，请检查：

1. 浏览器控制台是否有错误信息
2. Supabase项目设置中的URL配置是否正确
3. CORS设置是否正确
4. OAuth提供商配置是否正确
5. 确保使用的是正确的环境变量

## 9. 测试认证流程

1. 访问应用的登录页面
2. 尝试使用Google登录
3. 检查重定向是否正确
4. 验证用户信息是否正确显示在导航栏
5. 测试登出功能

如有问题，请参考Supabase官方文档：https://supabase.com/docs/guides/auth 