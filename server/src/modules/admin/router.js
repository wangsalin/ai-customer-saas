// 平台超级管理员模块
const express = require('express');
const router = express.Router();

router.get('/dashboard', (req, res) => {
  res.json({ code: 0, data: { tenants: { total: 156, active: 89 }, conversations: { today: 1234 }, revenue: { today: 4560 } });
});

router.get('/tenants', (req, res) => {
  res.json({ code: 0, data: { list: [{ id: 1, companyName: '测试公司', plan: 'pro', status: 'active' }], total: 1 } });
});

module.exports = router;
