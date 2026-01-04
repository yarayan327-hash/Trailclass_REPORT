# Trailclass Report - Vercel 部署完整指南

## 🔧 当前项目配置

- **框架**: Next.js 14.2.3
- **构建命令**: `npm run build`
- **输出目录**: `.next` (自动生成)
- **启动命令**: `npm start`
- **Node.js 版本**: 18.x 或 20.x

## 📋 Vercel 项目配置步骤

### 第一步：删除现有的 Vercel 项目

1. 访问 https://vercel.com/dashboard
2. 找到 `trailclass-report` 项目
3. 点击 **Settings** → 滚动到底部
4. 点击 **Delete Project** (红色按钮)
5. 确认删除

### 第二步：创建新的 Vercel 项目

1. 点击 **Add New...** → **Project**
2. 选择 GitHub 仓库：`yarayan327-hash/Trailclass_REPORT`
3. **重要配置**：

   **Framework Preset**: Next.js (自动检测)
   
   **Root Directory**: 留空 (不要填写任何内容)
   
   **Build Command**: `npm run build`
   
   **Output Directory**: `.next`
   
   **Install Command**: `npm install`

### 第三步：配置环境变量

在 **Settings** → **Environment Variables** 中添加：

```
DATABASE_URL = postgres://4036bfdce3c45294165329bdfc0ecffb92d52308f268e25732eef6eb90edc088:sk_BW8cklBghYYwdmPoW8pkA@db.prisma.io:5432/postgres?sslmode=require
```

### 第四步：部署

1. 点击 **Deploy** 按钮
2. 等待 2-3 分钟构建完成
3. 构建成功后，访问提供的 URL

## ✅ 验证部署成功

部署成功后，你应该看到：
- 首页显示登录表单 (Instructor Login)
- 使用 Teacher ID: `123456` 可以登录
- 登录后跳转到 `/teacher/schedule` 显示课程列表

## 🐛 故障排除

### 如果还是 404

1. **检查构建日志**
   - 进入 Deployments 标签
   - 点击最新的部署记录
   - 查看是否有错误信息

2. **检查环境变量**
   - Settings → Environment Variables
   - 确认 `DATABASE_URL` 已添加

3. **检查分支**
   - Settings → Git
   - 确认 Production Branch 是 `main`

4. **清除浏览器缓存**
   - 按 Cmd+Shift+R (Mac) 或 Ctrl+Shift+R (Windows)
   - 或使用无痕模式访问

## 📊 项目结构

```
Trailclass_REPORT/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 首页 (登录)
│   ├── admin/             # 管理员页面
│   ├── teacher/           # 教师页面
│   └── api/               # API 路由
├── prisma/                # 数据库配置
│   ├── schema.prisma
│   └── seed.ts
├── public/                # 静态资源
├── package.json
├── next.config.js
└── vercel.json           # Vercel 配置
```

## 🎯 关键文件说明

- `vercel.json`: 明确告诉 Vercel 这是 Next.js 项目
- `next.config.js`: Next.js 配置（跳过 TypeScript 类型检查）
- `package.json`: 包含所有依赖和构建脚本
- `.env`: 本地环境变量（不要提交到 Git）
