const express = require('express');
const router = express.Router();

// 套餐配置
const PLANS = {
  free: {
    name: '免费版',
    price: 0,
    features: ['100条对话/月', '1个渠道', '基础知识库', '基本统计'],
    limits: { chats: 100, channels: 1, users: 3 }
  },
  pro: {
    name: '专业版',
    price: 99,
    features: ['5000条对话/月', '3个渠道', '高级知识库', '完整统计', 'API接入'],
    limits: { chats: 5000, channels: 3, users: 10 }
  },
  enterprise: {
    name: '企业版',
    price: 299,
    features: ['无限对话', '10个渠道', '私有知识库', '专属客服', '定制开发'],
    limits: { chats: -1, channels: 10, users: -1 }
  }
};

// 模拟租户用量
const usageData = new Map();

// 获取当前套餐信息
router.get('/plan', (req, res) => {
  const tenantId = req.tenantId;
  
  // 模拟数据
  const plan = PLANS.free;
  const usage = {
    chats: 45,
    channels: 1,
    users: 2,
    storage: 128 // MB
  };
  
  res.json({ code: 0, data: { plan, usage } });
});

// 获取套餐列表
router.get('/plans', (req, res) => {
  res.json({ code: 0, data: PLANS });
});

// 升级套餐
router.post('/upgrade', (req, res) => {
  const { plan } = req.body;
  
  if (!PLANS[plan]) {
    return res.status(400).json({ error: '套餐不存在' });
  }
  
  // 这里应该集成支付
  // 支付成功后更新套餐
  
  res.json({ 
    code: 0, 
    data: { 
      success: true, 
      message: `已升级到 ${PLANS[plan].name}` 
    } 
  });
});

// 获取用量详情
router.get('/usage', (req, res) => {
  const tenantId = req.tenantId;
  
  // 模拟数据
  const usage = {
    chats: { used: 45, limit: 100 },
    channels: { used: 1, limit: 1 },
    users: { used: 2, limit: 3 },
    storage: { used: 128, limit: 500 } // MB
  };
  
  res.json({ code: 0, data: usage });
});

module.exports = router;
