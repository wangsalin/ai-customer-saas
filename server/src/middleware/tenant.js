const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const tenantMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    req.tenantId = payload.tenantId;
    req.userId = payload.userId;
    req.role = payload.role;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token 无效' });
  }
};

module.exports = { tenantMiddleware };
