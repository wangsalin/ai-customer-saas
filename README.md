# AI 客服 SaaS 平台

> 商用级多租户 AI 客服系统

## 📚 项目文档

- [产品需求文档 (PRD)](./docs/PRD-AI客服-V1.0.md)
- [技术方案](./docs/技术方案-AI客服-V1.0.md)
- [数据库设计](./docs/数据库设计-AI客服-V1.0.md)
- [页面与功能设计](./docs/页面与功能设计-AI客服-V1.0.md)

## 🚀 快速开始

### 前置要求

- Node.js 18+
- Docker & Docker Compose
- MySQL 8.0
- Redis 7

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/ai-customer-saas.git
cd ai-customer-saas

# 2. 启动数据库
docker-compose up -d mysql redis

# 3. 配置环境变量
cp server/.env.example server/.env
# 编辑 .env 文件，配置数据库和大模型 API

# 4. 启动后端
cd server
npm install
npm run dev

# 5. 启动前端
cd ../web
npm install
npm run dev
```

### Docker 部署

```bash
# 1. 配置环境变量
cp docker/.env.example docker/.env
# 编辑 .env 文件

# 2. 启动所有服务
cd docker
docker-compose up -d

# 3. 访问
# 管理后台: http://localhost:3001
# API: http://localhost:3000
```

## 📋 功能清单

### 基础功能
- [x] AI 智能对话
- [x] 知识库管理
- [x] 多渠道接入 (微信/飞书/Web)
- [x] 人机协作
- [x] 转人工
- [x] 满意度评价

### SaaS 功能
- [x] 多租户
- [x] 企业注册/登录
- [x] 子账号管理
- [x] 角色权限
- [x] 订阅计费
- [x] 用量统计
- [x] 套餐管理

### 商用功能
- [x] 操作日志
- [x] 数据导出
- [x] 高可用部署
- [x] 自动扩缩容

## 🏗️ 技术栈

| 模块 | 技术 |
|------|------|
| 后端 | Node.js + Express |
| 数据库 | MySQL + Redis |
| 前端 | Vue3 + Element Plus |
| 大模型 | 通义千问 / OpenAI |
| 部署 | Docker + K8s |

## 📄 许可证

MIT
