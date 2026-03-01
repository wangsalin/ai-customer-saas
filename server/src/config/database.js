const mysql = require('mysql2/promise');
const Redis = require('ioredis');

class Database {
  constructor() {
    this.pool = null;
    this.redis = null;
  }

  async init() {
    // MySQL 连接池
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ai_customer_saas',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: 0
    });

    // 测试连接
    try {
      const connection = await this.pool.getConnection();
      console.log('✅ MySQL 连接成功');
      connection.release();
    } catch (error) {
      console.error('❌ MySQL 连接失败:', error.message);
    }

    try {
      await this.redis.ping();
      console.log('✅ Redis 连接成功');
    } catch (error) {
      console.error('❌ Redis 连接失败:', error.message);
    }
  }

  // 租户相关
  async getTenantById(id) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM tenants WHERE id = ?', [id]
    );
    return rows[0];
  }

  async getTenantByEmail(email) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM tenants WHERE email = ?', [email]
    );
    return rows[0];
  }

  async createTenant(data) {
    const [result] = await this.pool.execute(
      `INSERT INTO tenants (company_name, email, industry, plan) VALUES (?, ?, ?, ?)`,
      [data.companyName, data.email, data.industry, 'free']
    );
    return result.insertId;
  }

  async updateTenant(id, data) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = ?`);
      values.push(value);
    }
    
    values.push(id);
    await this.pool.execute(
      `UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  // 用户相关
  async getUserById(id) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM users WHERE id = ?', [id]
    );
    return rows[0];
  }

  async getUserByEmail(email) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    return rows[0];
  }

  async createUser(data) {
    const [result] = await this.pool.execute(
      `INSERT INTO users (tenant_id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)`,
      [data.tenantId, data.email, data.passwordHash, data.name, data.role || 'viewer']
    );
    return result.insertId;
  }

  async getTenantUsers(tenantId) {
    const [rows] = await this.pool.execute(
      'SELECT id, email, name, role, status, last_login FROM users WHERE tenant_id = ?',
      [tenantId]
    );
    return rows;
  }

  // 知识库相关
  async getKnowledgeList(tenantId, { page = 1, size = 10, category, status }) {
    let sql = 'SELECT * FROM knowledge WHERE tenant_id = ?';
    const params = [tenantId];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(size), (parseInt(page) - 1) * parseInt(size));

    const [rows] = await this.pool.execute(sql, params);
    
    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM knowledge WHERE tenant_id = ?';
    const countParams = [tenantId];
    if (category) {
      countSql += ' AND category = ?';
      countParams.push(category);
    }
    if (status) {
      countSql += ' AND status = ?';
      countParams.push(status);
    }
    const [countResult] = await this.pool.execute(countSql, countParams);

    return { list: rows, total: countResult[0].total };
  }

  async createKnowledge(data) {
    const [result] = await this.pool.execute(
      `INSERT INTO knowledge (tenant_id, title, content, category, tags, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.tenantId, data.title, data.content, data.category || 'general', 
       data.tags, data.status || 'draft', data.createdBy]
    );
    return result.insertId;
  }

  async updateKnowledge(id, tenantId, data) {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(data)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = ?`);
      values.push(value);
    }

    values.push(id, tenantId);
    await this.pool.execute(
      `UPDATE knowledge SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`,
      values
    );
  }

  async deleteKnowledge(id, tenantId) {
    await this.pool.execute(
      'DELETE FROM knowledge WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );
  }

  // 对话相关
  async createConversation(data) {
    const [result] = await this.pool.execute(
      `INSERT INTO conversations (tenant_id, user_id, channel, channel_user_id, channel_user_name) 
       VALUES (?, ?, ?, ?, ?)`,
      [data.tenantId, data.userId, data.channel, data.channelUserId, data.channelUserName]
    );
    return result.insertId;
  }

  async getConversation(id, tenantId) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM conversations WHERE id = ? AND tenant_id = ?',
      [id, tenantId]
    );
    return rows[0];
  }

  async getConversationList(tenantId, { page = 1, size = 20, status }) {
    let sql = 'SELECT * FROM conversations WHERE tenant_id = ?';
    const params = [tenantId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY started_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(size), (parseInt(page) - 1) * parseInt(size));

    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  async updateConversationStatus(id, tenantId, status) {
    const updateFields = { status };
    if (status === 'answered') {
      updateFields.answeredAt = new Date();
    } else if (status === 'transferred') {
      updateFields.transferredAt = new Date();
    } else if (status === ' updateFields.closedclosed') {
     At = new Date();
    }

    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(updateFields)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id, tenantId);

    await this.pool.execute(
      `UPDATE conversations SET ${fields.join(', ')} WHERE id = ? AND tenant_id = ?`,
      values
    );
  }

  // 消息相关
  async createMessage(data) {
    const [result] = await this.pool.execute(
      `INSERT INTO messages (conversation_id, role, content, source, model, tokens) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.conversationId, data.role, data.content, data.source, data.model, data.tokens]
    );
    return result.insertId;
  }

  async getConversationMessages(conversationId) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );
    return rows;
  }

  // 统计相关
  async getDashboardStats(tenantId) {
    const today = new Date().toISOString().split('T')[0];
    
    // 今日数据
    const [todayStats] = await this.pool.execute(
      `SELECT 
        COUNT(*) as conversations,
        SUM(CASE WHEN status != 'active' THEN 1 ELSE 0 END) as answered,
        SUM(CASE WHEN status = 'transferred' THEN 1 ELSE 0 END) as transferred,
        AVG(CASE WHEN rating THEN rating ELSE NULL END) as avgRating
       FROM conversations 
       WHERE tenant_id = ? AND DATE(started_at) = ?`,
      [tenantId, today]
    );

    // 本周数据
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [weekStats] = await this.pool.execute(
      `SELECT DATE(started_at) as date, COUNT(*) as count
       FROM conversations
       WHERE tenant_id = ? AND DATE(started_at) >= ?
       GROUP BY DATE(started_at)
       ORDER BY date`,
      [tenantId, weekAgo]
    );

    // 热点问题
    const [hotQuestions] = await this.pool.execute(
      `SELECT content as keyword, COUNT(*) as count
       FROM messages
       WHERE role = 'user' AND conversation_id IN (
         SELECT id FROM conversations WHERE tenant_id = ?
       )
       GROUP BY content
       ORDER BY count DESC
       LIMIT 10`,
      [tenantId]
    );

    return {
      today: todayStats[0] || { conversations: 0, answered: 0, transferred: 0, avgRating: 0 },
      week: weekStats,
      hotQuestions
    };
  }

  // 用量相关
  async getTenantUsage(tenantId) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM usage_stats WHERE tenant_id = ? AND stat_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)',
      [tenantId]
    );
    
    const usage = { chats: 0, messages: 0, aiCalls: 0, tokens: 0 };
    for (const row of rows) {
      usage.chats += row.chats;
      usage.messages += row.messages;
      usage.aiCalls += row.ai_calls;
      usage.tokens += row.tokens;
    }
    return usage;
  }

  async incrementUsage(tenantId, { chats = 0, messages = 0, aiCalls = 0, tokens = 0 }) {
    const today = new Date().toISOString().split('T')[0];
    
    await this.pool.execute(
      `INSERT INTO usage_stats (tenant_id, stat_date, chats, messages, ai_calls, tokens)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       chats = chats + ?, messages = messages + ?, ai_calls = ai_calls + ?, tokens = tokens + ?`,
      [tenantId, today, chats, messages, aiCalls, tokens, chats, messages, aiCalls, tokens]
    );
  }

  // 渠道相关
  async getTenantChannels(tenantId) {
    const [rows] = await this.pool.execute(
      'SELECT * FROM channels WHERE tenant_id = ? AND status = 1',
      [tenantId]
    );
    return rows;
  }

  async createChannel(data) {
    const [result] = await this.pool.execute(
      `INSERT INTO channels (tenant_id, name, type, config) VALUES (?, ?, ?, ?)`,
      [data.tenantId, data.name, data.type, JSON.stringify(data.config)]
    );
    return result.insertId;
  }

  // 日志相关
  async createLog(data) {
    await this.pool.execute(
      `INSERT INTO operation_logs (tenant_id, user_id, action, module, content, ip, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.tenantId, data.userId, data.action, data.module, data.content, data.ip, data.userAgent]
    );
  }

  // Redis 缓存
  async cacheSet(key, value, expire = 3600) {
    await this.redis.setex(key, expire, JSON.stringify(value));
  }

  async cacheGet(key) {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async cacheDel(key) {
    await this.redis.del(key);
  }
}

module.exports = new Database();
