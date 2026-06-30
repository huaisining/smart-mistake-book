# 智能错题本 - 完整配置指南

本指南将帮助您完成智能错题本系统的所有配置步骤。

## 目录
1. [环境要求](#1-环境要求)
2. [安装步骤](#2-安装步骤)
3. [数据库配置](#3-数据库配置)
4. [认证配置](#4-认证配置)
5. [AI服务配置](#5-ai服务配置)
6. [验证测试](#6-验证测试)
7. [故障排查](#7-故障排查)

---

## 1. 环境要求

### 必需软件

| 软件 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 18.17 | 20.x LTS | 运行时环境 |
| npm | 9.0 | 10.x | 包管理器 |
| Git | 2.40 | 最新 | 版本控制（可选） |

### 验证环境

```bash
# 检查 Node.js 版本
node -v
# 应输出: v18.17.0 或更高

# 检查 npm 版本
npm -v
# 应输出: 9.0.0 或更高
```

### 系统要求
- **操作系统**: Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- **内存**: 最少 2GB RAM
- **磁盘**: 最少 500MB 可用空间

---

## 2. 安装步骤

### 步骤 1: 安装项目依赖

```bash
# 进入项目目录
cd d:\trae_project\agnes

# 安装所有依赖
npm install
```

安装完成后，验证依赖是否正确安装：

```bash
# 检查关键依赖
npm list next react prisma @prisma/client next-auth
```

预期输出应显示所有包都已安装，无缺失或冲突。

### 步骤 2: 配置环境变量

```bash
# 复制环境变量模板
copy .env.example .env.local
```

编辑 `.env.local` 文件，配置以下参数：

```env
# ========== 数据库配置 ==========
# SQLite 数据库文件路径（开发环境）
DATABASE_URL="file:./dev.db"

# ========== NextAuth 认证配置 ==========
# 应用访问地址
NEXTAUTH_URL="http://localhost:3000"

# 认证密钥（必须修改！使用以下命令生成）
# 生成命令: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-key-here"

# ========== AI 服务配置 ==========
# OpenAI API 密钥（可选，用于AI分析功能）
OPENAI_API_KEY="sk-your-openai-api-key"

# OpenAI API 基础URL
# 国际版: https://api.openai.com/v1
# 硅基流动（推荐国内使用）: https://api.siliconflow.cn/v1
OPENAI_BASE_URL="https://api.siliconflow.cn/v1"

# AI 模型名称
AI_MODEL="Qwen/Qwen2.5-72B-Instruct"

# ========== 生产环境配置（可选）==========
# 如果使用 PostgreSQL
# DATABASE_URL="postgresql://user:password@localhost:5432/mistake_book"
```

### 生成安全的 NEXTAUTH_SECRET

**Windows (PowerShell):**
```powershell
# 方法1: 使用 OpenSSL（如果已安装）
openssl rand -base64 32

# 方法2: 使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法3: 使用在线工具
# 访问 https://generate-secret.vercel.app/32
```

**macOS/Linux:**
```bash
openssl rand -base64 32
```

将生成的密钥粘贴到 `.env.local` 文件的 `NEXTAUTH_SECRET` 字段。

---

## 3. 数据库配置

### 3.1 初始化 Prisma

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库并运行迁移
npx prisma db push
```

### 3.2 验证数据库

```bash
# 打开 Prisma Studio（可视化数据库管理器）
npx prisma studio
```

这将启动一个 Web 界面，地址为 `http://localhost:5555`，您可以在此查看和管理数据库。

### 3.3 数据库结构说明

系统包含以下核心数据表：

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| users | 用户信息 | id, email, password |
| notebooks | 错题本 | id, name, color |
| mistakes | 错题记录 | id, content, mastery_level |
| tags | 知识点标签 | id, name |
| mistake_tags | 错题-标签关联 | mistake_id, tag_id |
| review_sessions | 复习会话 | id, start_time |
| review_results | 复习结果 | mistake_id, rating |

### 3.4 创建初始管理员账户

```bash
# 使用 Prisma CLI 创建用户
npx prisma db execute --stdin
```

或在代码中添加初始化脚本（见下文）。

---

## 4. 认证配置

### 4.1 认证方式

系统支持两种认证方式：

1. **凭据认证** (Credentials) - 用户名/密码登录
2. **OAuth 认证** (可选) - GitHub/Google 登录

### 4.2 配置 OAuth（可选）

如需启用 GitHub 登录，在 `.env.local` 中添加：

```env
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

获取 GitHub OAuth 应用：
1. 访问 GitHub Settings → Developer settings → OAuth Apps
2. 点击 "New OAuth App"
3. 设置 Authorization callback URL 为: `http://localhost:3000/api/auth/callback/github`
4. 复制 Client ID 和 Client Secret

### 4.3 密码加密

系统使用 bcryptjs 进行密码加密，密钥轮次为 12，确保安全性和性能的平衡。

---

## 5. AI服务配置

### 5.1 配置选项

#### 选项 A: 使用 OpenAI（国际版）

```env
OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxx"
OPENAI_BASE_URL="https://api.openai.com/v1"
AI_MODEL="gpt-4o"
```

#### 选项 B: 使用硅基流动（推荐国内）

硅基流动提供多种开源模型，兼容 OpenAI API：

```env
OPENAI_API_KEY="sk-xxxxxxxxxxxxx"
OPENAI_BASE_URL="https://api.siliconflow.cn/v1"
AI_MODEL="Qwen/Qwen2.5-72B-Instruct"
```

注册地址: https://cloud.siliconflow.cn

#### 选项 C: 使用智谱AI

```env
OPENAI_API_KEY="zpk-xxxxxxxxxxxxx"
OPENAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
AI_MODEL="glm-4-plus"
```

注册地址: https://open.bigmodel.cn

#### 选项 D: 暂不配置（基础功能可用）

如果不配置 AI API Key，系统仍可正常使用，只是无法使用：
- AI 题目分析
- 自动解析生成
- 智能标签提取
- 练习题生成

### 5.2 测试 AI 配置

```bash
# 运行 AI 服务测试
npm test -- tests/ai-service.test.ts
```

---

## 6. 验证测试

### 6.1 完整验证脚本

创建 `verify-setup.js` 文件：

```javascript
const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证智能错题本配置...\n');

let allPassed = true;

// 1. 检查 Node.js 版本
console.log('1️⃣  检查 Node.js 版本...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1));
if (majorVersion >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} 满足要求 (>= 18.17)\n`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} 不满足要求 (需要 >= 18.17)\n`);
  allPassed = false;
}

// 2. 检查 .env.local
console.log('2️⃣  检查环境变量配置...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSecret = envContent.includes('NEXTAUTH_SECRET=') && envContent.split('NEXTAUTH_SECRET=')[1].split('\n')[0].length > 10;
  const hasDbUrl = envContent.includes('DATABASE_URL=');
  
  if (hasSecret && hasDbUrl) {
    console.log('   ✅ 环境变量配置完整\n');
  } else {
    if (!hasSecret) {
      console.log('   ⚠️  缺少或无效的 NEXTAUTH_SECRET\n');
      allPassed = false;
    }
    if (!hasDbUrl) {
      console.log('   ⚠️  缺少 DATABASE_URL\n');
      allPassed = false;
    }
  }
} else {
  console.log('   ❌ .env.local 文件不存在\n');
  allPassed = false;
}

// 3. 检查依赖
console.log('3️⃣  检查项目依赖...');
const requiredPackages = [
  'next', 'react', 'react-dom', 'prisma', '@prisma/client',
  'next-auth', 'bcryptjs', 'recharts'
];
const missingPackages = [];

for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
  } catch {
    missingPackages.push(pkg);
  }
}

if (missingPackages.length === 0) {
  console.log('   ✅ 所有依赖已安装\n');
} else {
  console.log(`   ❌ 缺少依赖: ${missingPackages.join(', ')}\n`);
  allPassed = false;
}

// 4. 检查 Prisma Schema
console.log('4️⃣  检查数据库配置...');
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('   ✅ Prisma Schema 文件存在\n');
} else {
  console.log('   ❌ Prisma Schema 文件不存在\n');
  allPassed = false;
}

// 5. 总结
console.log('='.repeat(50));
if (allPassed) {
  console.log('✅ 所有验证通过！系统配置完成。\n');
  console.log('下一步:');
  console.log('  1. 运行数据库迁移: npx prisma db push');
  console.log('  2. 启动开发服务器: npm run dev');
  console.log('  3. 访问: http://localhost:3000');
} else {
  console.log('❌ 部分验证未通过，请根据上述提示修复问题。\n');
}
console.log('='.repeat(50));
```

运行验证：

```bash
node verify-setup.js
```

### 6.2 单元测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- tests/spaced-repetition.test.ts
npm test -- tests/ai-service.test.ts

# 监听模式（开发时使用）
npm run test:watch
```

### 6.3 功能测试清单

| 测试项 | 操作步骤 | 预期结果 | 状态 |
|--------|---------|---------|------|
| 应用启动 | `npm run dev` | 无报错，端口3000可访问 | ☐ |
| 首页加载 | 访问 `/` | 显示landing page | ☐ |
| 用户注册 | 访问 `/login` → 注册 | 成功创建账户 | ☐ |
| 用户登录 | 输入账号密码登录 | 跳转到仪表盘 | ☐ |
| 创建错题本 | 仪表盘 → 新建错题本 | 成功创建 | ☐ |
| 添加错题 | 访问 `/add` → 填写表单 | 错题保存成功 | ☐ |
| 查看错题 | 访问 `/mistakes` | 显示错题列表 | ☐ |
| 错题详情 | 点击错题 → 查看详情 | 显示完整信息 | ☐ |
| 复习功能 | 访问 `/review` | 进入复习模式 | ☐ |
| AI分析 | 点击"AI分析"按钮 | 返回分析结果（需配置API） | ☐ |
| 数据统计 | 查看仪表盘图表 | 数据显示正常 | ☐ |

---

## 7. 故障排查

### 问题 1: npm install 失败

**症状**: 安装依赖时报错

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题 2: Prisma 数据库错误

**症状**: `npx prisma db push` 报错

**解决方案**:
```bash
# 删除现有数据库
rm prisma/dev.db

# 重新初始化
npx prisma generate
npx prisma db push
```

### 问题 3: 端口被占用

**症状**: 启动时提示 "Port 3000 is already in use"

**解决方案**:
```bash
# Windows: 查找占用端口的进程
netstat -ano | findstr :3000

# 修改端口启动
npm run dev -- -p 3001

# 或在 next.config.js 中设置
# 环境变量: PORT=3001 npm run dev
```

### 问题 4: 认证失败

**症状**: 登录后无法跳转或报错

**解决方案**:
1. 确认 `.env.local` 中 `NEXTAUTH_SECRET` 已正确配置
2. 确认 `NEXTAUTH_URL` 与实际访问地址一致
3. 清除浏览器缓存和 Cookie

### 问题 5: AI 分析失败

**症状**: 点击"AI分析"按钮报错

**解决方案**:
1. 确认 `OPENAI_API_KEY` 已正确配置
2. 检查 API Key 是否有效
3. 确认网络连接正常（如使用国内代理）
4. 查看服务器控制台错误日志

---

## 快速启动命令

```bash
# 一键配置和启动
npm install && \
npx prisma generate && \
npx prisma db push && \
npm run dev
```

---

## 生产环境部署

### 使用 Docker（推荐）

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:/app/prisma/dev.db
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - db-data:/app/prisma

volumes:
  db-data:
```

### 使用 Vercel 部署

1. 推送代码到 GitHub
2. 访问 vercel.com 导入项目
3. 配置环境变量
4. 点击 Deploy

---

## 联系与支持

如有问题，请查看:
- 项目文档: README.md
- 数据库结构: prisma/schema.prisma
- API 文档: src/app/api/ 目录
