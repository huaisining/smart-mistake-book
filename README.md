# 智能错题本 - Smart Mistake Book

一个基于AI的智能错题管理系统，整合了多个优秀开源项目的核心功能。

## 🎯 项目概述

本项目融合了以下开源项目的核心功能：

- **[wttwins/wrong-notebook](https://github.com/wttwins/wrong-notebook)** - AI智能分析、多错题本管理、智能标签
- **[ankitects/anki](https://github.com/ankitects/anki)** - 间隔重复算法(SM-2)、跨平台同步
- **[XZS考试系统](https://gitcode.com/gh_mirrors/xzs/xzs)** - 全自动错题收集、多维度分类
- **[ErrLog](https://devpost.com/software/errlog)** - 错误分类、热力图、复习会话

## ✨ 核心功能

### 1. 智能题目录入
- 支持文本输入、图片上传
- AI自动识别题目内容
- 自动生成解析和知识点标签

### 2. 错题分类管理
- 按科目创建多个错题本
- 智能标签系统（自动+自定义）
- 多维度筛选（掌握状态、时间、类型）

### 3. 间隔重复复习
- 基于SM-2算法（Anki同款）
- 四级评分：完全忘了/有些困难/基本掌握/完全掌握
- 智能复习提醒

### 4. 数据统计可视化
- 学习进度仪表盘
- 错题类型分布
- 学习趋势图表
- 掌握度分析

### 5. AI辅助功能
- 题目解析生成
- 知识点自动提取
- 相似练习题生成

## 🛠️ 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite (开发) / PostgreSQL (生产) - Prisma ORM
- **认证**: NextAuth.js
- **AI集成**: OpenAI兼容API
- **图表**: Recharts
- **测试**: Jest + React Testing Library

## 📦 安装与运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd mistake-book
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env.local
```

编辑 `.env.local`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
OPENAI_API_KEY="your-api-key"
OPENAI_BASE_URL="https://api.openai.com/v1"
```

### 4. 初始化数据库
```bash
npx prisma generate
npx prisma db push
```

### 5. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 🧪 测试

### 运行单元测试
```bash
npm test
```

### 运行集成测试
```bash
npm run test:e2e
```

## 📁 项目结构

```
mistake-book/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # 认证相关
│   │   │   ├── mistakes/      # 错题管理
│   │   │   ├── notebooks/     # 错题本管理
│   │   │   ├── review/        # 复习记录
│   │   │   └── stats/         # 统计数据
│   │   ├── dashboard/         # 仪表盘页面
│   │   ├── mistakes/          # 错题列表页面
│   │   ├── review/            # 复习页面
│   │   ├── add/               # 添加错题页面
│   │   └── login/             # 登录页面
│   ├── components/            # React组件
│   ├── lib/                   # 工具函数
│   │   ├── prisma.ts         # 数据库连接
│   │   ├── ai-service.ts     # AI分析服务
│   │   └── spaced-repetition.ts  # 间隔重复算法
│   └── types/                 # TypeScript类型定义
├── prisma/
│   └── schema.prisma          # 数据库Schema
├── tests/                     # 测试文件
└── package.json
```

## 🔑 主要API端点

| 方法 | 端点 | 描述 |
|-----|------|------|
| GET | `/api/mistakes` | 获取错题列表 |
| POST | `/api/mistakes` | 创建新错题 |
| GET | `/api/mistakes/:id` | 获取错题详情 |
| PUT | `/api/mistakes/:id` | 更新错题 |
| DELETE | `/api/mistakes/:id` | 删除错题 |
| POST | `/api/review` | 记录复习结果 |
| GET | `/api/stats` | 获取统计数据 |
| GET | `/api/notebooks` | 获取错题本列表 |
| POST | `/api/notebooks` | 创建错题本 |
| POST | `/api/analyze` | AI分析题目 |

## 📊 数据模型

### User (用户)
- 基本信息、认证数据

### Notebook (错题本)
- 按科目分类的容器

### Mistake (错题)
- 题目内容、答案、解析
- 掌握程度 (0-5)
- 复习间隔、难度评分
- SM-2算法参数

### Tag (标签)
- 知识点标签

### ReviewSession / ReviewResult (复习记录)
- 复习会话和结果

## 🎓 间隔重复算法

本项目实现了经典的SM-2算法：

1. **Again** - 完全忘记，重置复习间隔
2. **Hard** - 有些困难，小幅增加间隔
3. **Good** - 基本掌握，正常增加间隔
4. **Easy** - 完全掌握，大幅增加间隔

算法会根据用户的评分自动调整下次复习时间，确保在即将遗忘时进行复习。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

感谢以下开源项目：
- [Anki](https://github.com/ankitects/anki) - 间隔重复算法参考
- [wrong-notebook](https://github.com/wttwins/wrong-notebook) - AI错题管理灵感
- [ErrLog](https://devpost.com/software/errlog) - 错误分类设计参考
- [XZS考试系统](https://gitcode.com/gh_mirrors/xzs/xzs) - 错题收集机制参考
