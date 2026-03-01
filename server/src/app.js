require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 路由
const tenantRouter = require('./modules/tenant/router');
const knowledgeRouter = require('./modules/knowledge/router');
const chatRouter = require('./modules/chat/router');
const statsRouter = require('./modules/stats/router');
const billingRouter = require('./modules/billing/router');

// 中间件
const { tenantMiddleware } = require('./middleware/tenant');
const { authMiddleware } = require('./middleware/auth');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 租户路由（注册、登录）
app.use('/api/tenant', tenantRouter);

// 需要租户上下文的路由
app.use('/api/knowledge', tenantMiddleware, authMiddleware, knowledgeRouter);
app.use('/api/chat', tenantMiddleware, authMiddleware, chatRouter);
app.use('/api/stats', tenantMiddleware, authMiddleware, statsRouter);
app.use('/api/billing', tenantMiddleware, authMiddleware, billingRouter);

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器错误' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 AI 客服 SaaS API 服务运行在端口 ${PORT}`);
});

module.exports = app;
