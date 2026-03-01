// 平台超级管理员模块
const express = require('express');
const router = express.Router();

// 模拟平台数据
const platformStats = {
  totalTenants: 156,
  activeTenants: 89,
  totalConversations: 45678,
  todayConversations: 1234,
  totalRevenue: 156780,
  todayRevenue: 4560
};

// 1. 平台仪表盘
router.get('/dashboard', (req, res) => {
  // 验证超级管理员
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ error: '权限不足' });
  }
  
  res.json({
    code: 0,
    data: {
      tenants: {
        total: 156,
        active: 89,
        newToday: 5,
        suspended: 12
      },
      conversations: {
        total: 45678,
        today: 1234,
        avgPerDay: 234
      },
      revenue: {
        total: 156780,
        today: 4560,
        monthly: 23450
      },
      system: {
        apiCalls: 234567,
        successRate: 99.8,
        avgResponseTime: 125 // ms
      }
    }
  });
});

// 2. 租户列表
router.get('/tenants', (req, res) => {
  const { page = 1, size = 20, status, keyword } = req.query;
  
  // 模拟租户数据
  const tenants = [
    { id: 1, companyName: '测试公司A', email: 'a@test.com', plan: 'pro', status: 'active', createdAt: '2026-01-15', conversations: 1234 },
    { id: 2, companyName: '电商公司B', email: 'b@test.com', plan: 'enterprise', status: 'active', createdAt: '2026-01-20', conversations: 5678 },
    { id: 3, companyName: '教育机构C', email: 'c@test.com', plan: 'free', status: 'suspended', createdAt: '2026-02-01', conversations: 45 },
    { id: 4, companyName: '医疗机构D', email: 'd@test.com', plan: 'pro', status: 'active', createdAt: '2026-02-10', conversations: 890 },
    { id: 5, companyName: '金融公司E', email: 'e@test.com', plan: 'enterprise', status: 'active', createdAt: '2026-02-15', conversations: 2345 }
  ];
  
  let filtered = tenants;
  if (status) filtered = filtered.filter(t => t.status === status);
  if (keyword) filtered = filtered.filter(t => 
    t.companyName.includes(keyword) || t.email.includes(keyword)
  );
  
  res.json({
    code: 0,
    data: {
      list: filtered,
      total: filtered.length,
      page: Number(page),
      size: Number(size)
    }
  });
});

// 3. 租户详情
router.get('/tenants/:id', (req, res) => {
  const { id } = req.params;
  
  const tenant = {
    id,
    companyName: '测试公司',
    email: 'test@company.com',
    industry: 'ecommerce',
    plan: 'pro',
    status: 'active',
    contact: '张三',
    phone: '13800138000',
    createdAt: '2026-01-15',
    stats: {
      totalConversations: 1234,
      totalUsers: 15,
      storage: 256, // MB
      apiCalls: 5678
    },
    subscription: {
      plan: 'pro',
      price: 99,
      startDate: '2026-01-15',
      endDate: '2026-02-15',
      autoRenew: true
    }
  };
  
  res.json({ code: 0, data: tenant });
});

// 4. 禁用/启用租户
router.post('/tenants/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // 更新数据库
  res.json({
    code: 0,
    data: { success: true, message: `租户已${status === 'active' ? '启用' : '禁用'}` }
  });
});

// 5. 订单列表
router.get('/orders', (req, res) => {
  const { page = 1, size = 20, status } = req.query;
  
  const orders = [
    { id: 1, tenantName: '测试公司A', plan: 'pro', amount: 99, status: 'paid', payMethod: 'alipay', createdAt: '2026-02-01' },
    { id: 2, tenantName: '电商公司B', plan: 'enterprise', amount: 299, status: 'paid', payMethod: 'wechat', createdAt: '2026-02-05' },
    { id: 3, tenantName: '教育机构C', plan: 'free', amount: 0, status: 'pending', payMethod: '-', createdAt: '2026-02-10' }
  ];
  
  res.json({
    code: 0,
    data: { list: orders, total: orders.length }
  });
});

// 6. 系统配置
router.get('/config', (req, res) => {
  const config = {
    site: {
      name: '智聊AI',
      logo: '/logo.png',
      domain: 'zhiliao.ai'
    },
    sms: {
      provider: 'aliyun',
      enabled: true
    },
    payment: {
      alipay: { enabled: true },
      wechat: { enabled: true }
    },
    features: {
      register: true,
      trial: true
    }
  };
  
  res.json({ code: 0, data: config });
});

// 7. 更新系统配置
router.put('/config', (req, res) => {
  const { config } = req.body;
  
  res.json({ code: 0, data: { success: true } });
});

// 8. 操作日志
router.get('/logs', (req, res) => {
  const { page = 1, size = 50 } = req.query;
  
  const logs = [
    { id: 1, action: '租户禁用', operator: 'admin', target: '测试公司A', ip: '10.0.0.1', createdAt: '2026-02-01 10:30:00' },
    { id: 2, action: '配置修改', operator: 'admin', target: '支付设置', ip: '10.0.0.1', createdAt: '2026-02-01 09:20:00' },
    { id: 3, action: '租户审核', operator: 'admin', target: '新公司C', ip: '10.0.0.2', createdAt: '2026-02-01 08:15:00' }
  ];
  
  res.json({ code: 0, data: { list: logs, total: logs.length } });
});

module.exports = router;
