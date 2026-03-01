const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../middleware/auth');

// 模拟数据库
const tenants = new Map();
const users = new Map();

// 注册租户
router.post('/register', async (req, res) => {
  try {
    const { companyName, email, password, industry } = req.body;

    // 检查邮箱是否已存在
    const existingTenant = Array.from(tenants.values()).find(t => t.email === email);
    if (existingTenant) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }

    // 创建租户
    const tenantId = `tenant_${Date.now()}`;
    const tenant = {
      id: tenantId,
      companyName,
      email,
      industry,
      plan: 'free', // 默认免费版
      status: 'active',
      createdAt: new Date()
    };
    tenants.set(tenantId, tenant);

    // 创建管理员用户
    const userId = `user_${Date.now()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: userId,
      tenantId,
      email,
      passwordHash,
      role: 'admin',
      name: companyName
    };
    users.set(userId, user);

    // 生成 Token
    const token = generateToken({ tenantId, userId, role: 'admin' });

    res.json({
      code: 0,
      data: { token, tenant, user: { ...user, passwordHash: undefined } }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    const tenant = tenants.get(user.tenantId);
    if (!tenant || tenant.status !== 'active') {
      return res.status(403).json({ error: '账号已被禁用' });
    }

    const token = generateToken({ tenantId: user.tenantId, userId: user.id, role: user.role });

    res.json({
      code: 0,
      data: { token, tenant, user: { ...user, passwordHash: undefined } }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 获取当前租户信息
router.get('/info', (req, res) => {
  // 需要通过其他中间件获取 tenantId
  res.json({ code: 0, data: {} });
});

module.exports = router;
