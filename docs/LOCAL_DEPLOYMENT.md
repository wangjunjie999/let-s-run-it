# 本地部署指南

本指南帮助你将项目从 Lovable Cloud 迁移到自己的 Supabase 账号进行本地或自托管部署。

## 步骤概览

1. 导出代码到GitHub
2. 创建自己的Supabase项目
3. 执行数据库迁移脚本
4. 配置环境变量
5. 修改Supabase客户端配置
6. 本地运行

---

## 1. 导出代码到GitHub

1. 在Lovable中进入 **Settings → Connectors → GitHub**
2. 连接你的GitHub账号
3. 创建新仓库并推送代码
4. 克隆仓库到本地：
   ```bash
   git clone https://github.com/你的用户名/你的仓库.git
   cd 你的仓库
   ```

## 2. 创建Supabase项目

1. 访问 [supabase.com](https://supabase.com) 创建账号
2. 点击 **New Project** 创建新项目
3. 填写项目信息：
   - **Name**: 项目名称
   - **Database Password**: 设置数据库密码（请妥善保存）
   - **Region**: 选择离你最近的区域
4. 等待项目创建完成（约2分钟）
5. 进入项目后，在 **Settings → API** 中记录以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: 公开密钥（用于前端）
   - **service_role secret**: 服务端密钥（仅用于服务端，请勿暴露）

## 3. 执行数据库迁移

### 3.1 创建数据库结构

1. 在Supabase Dashboard中，点击左侧 **SQL Editor**
2. 点击 **New Query**
3. 复制 `docs/migration-schema.sql` 的全部内容
4. 粘贴到SQL编辑器中
5. 点击 **Run** 执行
6. 确认所有语句执行成功（无红色错误提示）

### 3.2 导入现有数据（可选）

如果你需要迁移现有数据：

1. 首先在新Supabase项目中注册一个用户（使用与原项目相同的邮箱）
2. 在 **Authentication → Users** 中找到新用户的 UUID
3. 打开 `docs/data-export.sql`
4. 将文件中所有的旧用户ID替换为新用户ID：
   ```sql
   -- 查找替换: f57464ee-06f9-4277-b2a1-cd0f1cd20d36 → 你的新用户ID
   ```
5. 在SQL Editor中执行修改后的SQL

### 3.3 配置Storage存储桶

迁移脚本已包含存储桶创建，但你需要手动上传图片：

1. 进入 **Storage** 页面
2. 确认以下存储桶已创建：
   - `hardware-images` - 硬件设备图片
   - `workstation-views` - 工位视图图片
   - `module-schematics` - 模块流程图
3. 如有需要，手动上传相关图片文件

## 4. 配置环境变量

### 4.1 创建环境文件

在项目根目录创建 `.env.local` 文件（注意：不是 `.env`）：

```env
# Supabase配置
VITE_SUPABASE_URL=https://你的项目ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=你的anon_public密钥

# 可选：项目ID（用于某些功能）
VITE_SUPABASE_PROJECT_ID=你的项目ID
```

### 4.2 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_SUPABASE_URL` | Supabase项目URL | `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | 公开的anon密钥 | `eyJhbGciOiJIUzI1...` |
| `VITE_SUPABASE_PROJECT_ID` | 项目ID（URL中的部分） | `abcdefgh` |

> ⚠️ **重要**: 
> - `.env.local` 文件不应提交到Git仓库
> - 确保 `.gitignore` 包含 `.env.local`
> - 不要在前端代码中使用 `service_role` 密钥

## 5. 修改Supabase客户端配置

修改 `src/integrations/supabase/client.ts` 文件：

```typescript
// 删除或注释掉原有的硬编码配置
// 使用环境变量读取配置

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// 从环境变量读取配置
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// 验证环境变量
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    '缺少Supabase配置。请确保在.env.local中设置了VITE_SUPABASE_URL和VITE_SUPABASE_PUBLISHABLE_KEY'
  );
}

// 创建Supabase客户端
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### 5.1 类型定义文件

`src/integrations/supabase/types.ts` 文件包含了数据库类型定义，**无需修改**。

如果你修改了数据库结构，可以使用Supabase CLI重新生成类型：

```bash
# 安装Supabase CLI
npm install -g supabase

# 登录
supabase login

# 生成类型（替换为你的项目ID）
supabase gen types typescript --project-id 你的项目ID > src/integrations/supabase/types.ts
```

## 6. 本地运行

```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

访问 `http://localhost:5173` 即可使用

### 6.1 验证配置

1. 打开浏览器开发者工具（F12）
2. 查看Console是否有错误
3. 尝试登录/注册功能
4. 检查数据是否正常加载

---

## 7. 生产部署

### 7.1 使用Vercel部署

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署（首次会引导配置）
vercel

# 设置环境变量
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_PUBLISHABLE_KEY

# 重新部署以应用环境变量
vercel --prod
```

### 7.2 使用Netlify部署

1. 构建项目：
   ```bash
   npm run build
   ```
2. 登录 [Netlify](https://netlify.com)
3. 拖拽 `dist` 文件夹到Netlify部署页面
4. 在 **Site settings → Environment variables** 中添加环境变量

### 7.3 使用Docker部署

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

创建 `nginx.conf`：

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

构建和运行：

```bash
docker build -t vision-system-app .
docker run -p 8080:80 vision-system-app
```

---

## 8. 常见问题

### Q: 登录后无法看到数据？
**A:** 检查以下几点：
1. RLS策略是否正确执行
2. `user_id` 字段是否与当前登录用户匹配
3. 在SQL Editor中运行：
   ```sql
   SELECT * FROM projects WHERE user_id = '你的用户ID';
   ```

### Q: 图片无法上传？
**A:** 确保：
1. Storage存储桶已创建
2. 存储桶策略（RLS）已配置
3. 用户已登录且有权限

### Q: 如何启用邮箱自动确认？
**A:** 在Supabase Dashboard → **Authentication → Email Templates → Settings** → 关闭 "Enable email confirmations"

### Q: 控制台报错"缺少Supabase配置"？
**A:** 确保：
1. `.env.local` 文件存在于项目根目录
2. 变量名正确（以 `VITE_` 开头）
3. 重启开发服务器

### Q: 如何重新生成数据库类型？
**A:** 使用Supabase CLI：
```bash
supabase gen types typescript --project-id 你的项目ID > src/integrations/supabase/types.ts
```

---

## 9. 文件清单

迁移时需要关注的关键文件：

| 文件 | 说明 |
|------|------|
| `docs/migration-schema.sql` | 数据库结构迁移脚本 |
| `docs/data-export.sql` | 数据导出SQL |
| `src/integrations/supabase/client.ts` | Supabase客户端配置 |
| `src/integrations/supabase/types.ts` | 数据库类型定义 |
| `.env.local` | 环境变量配置（需创建） |
