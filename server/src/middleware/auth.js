const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authMiddleware = async (req, res, next) => {
  try {
    // 租户中间件已经验证了 Token
    // 这里可以添加额外的权限检查
    if (!req.tenantId) {
      return res.status(403).json({ error: '租户信息缺失' });
    }

    next();
  } catch (error) {
    return res.status(403).json({ error: '认证失败' });
  }
};

// 生成 Token
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = { authMiddleware, generateToken, JWT_SECRET };
