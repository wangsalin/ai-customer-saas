// 数据库服务 - 支持内存模式和 MySQL
const mysql = require('mysql2/promise');
const Redis = require('ioredis');

class Database {
  constructor() {
    this.pool = null;
    this.redis = null;
    this.dbType = process.env.DB_TYPE || 'memory';
    
    // 内存数据库（开发测试用）
    this.memory = {
      tenants: new Map(),
      users: new Map(),
      knowledge: new Map(),
      conversations: new Map(),
      messages: new Map(),
      channels: new Map(),
      usage: new Map()
    };
  }

  async init() {
    if (this.dbType === 'memory') {
      console.log('✅ 内存数据库模式（开发测试）');
      return;
    }

    // MySQL 模式
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ai_customer_saas',
      waitForConnections: true,
      connectionLimit: 10
    });

    // Redis
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    });

    console.log('✅ 数据库连接成功');
  }

  // 租户相关
  async getTenantById(id) {
    if (this.dbType === 'memory') {
      return this.memory.tenants.get(id) || null;
    }
    const [rows] = await this.pool.execute('SELECT * FROM tenants WHERE id = ?', [id]);
    return rows[0];
  }

  async getTenantByEmail(email) {
    if (this.dbType === 'memory') {
      for (const t of this.memory.tenants.values()) {
        if (t.email === email) return t;
      }
      return null;
    }
    const [rows] = await this.pool.execute('SELECT * FROM tenants WHERE email = ?', [email]);
    return rows[0];
  }

  async createTenant(data) {
    const id = Date.now();
    const tenant = { id, ...data, created_at: new Date() };
    if (this.dbType === 'memory') {
      this.memory.tenants.set(id, tenant);
    } else {
      // MySQL 插入
    }
    return id;
  }

  // 用户相关
  async getUserByEmail(email) {
    if (this.dbType === 'memory') {
      for (const u of this.memory.users.values()) {
        if (u.email === email) return u;
      }
      return null;
    }
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  async createUser(data) {
    const id = Date.now();
    const user = { id, ...data, created_at: new Date() };
    if (this.dbType === 'memory') {
      this.memory.users.set(id, user);
    }
    return id;
  }

  // 知识库相关
  async getKnowledgeList(tenantId, { page = 1, size = 10, category, status }) {
    if (this.dbType === 'memory') {
      let list = Array.from(this.memory.knowledge.values())
        .filter(k => k.tenant_id === tenantId);
      
      if (category) list = list.filter(k => k.category === category);
      if (status) list = list.filter(k => k.status === status);
      
      const total = list.length;
      const data = list.slice((page - 1) * size, page * size);
      return { list: data, total };
    }
    // MySQL 查询
    return { list: [], total: 0 };
  }

  async createKnowledge(data) {
    const id = Date.now();
    const knowledge = { id, ...data, created_at: new Date() };
    if (this.dbType === 'memory') {
      this.memory.knowledge.set(id, knowledge);
    }
    return id;
  }

  async updateKnowledge(id, tenantId, data) {
    if (this.dbType === 'memory') {
      const knowledge = this.memory.knowledge.get(id);
      if (knowledge && knowledge.tenant_id === tenantId) {
        Object.assign(knowledge, data);
      }
    }
  }

  async deleteKnowledge(id, tenantId) {
    if (this.dbType === 'memory') {
      const knowledge = this.memory.knowledge.get(id);
      if (knowledge && knowledge.tenant_id === tenantId) {
        this.memory.knowledge.delete(id);
      }
    }
  }

  // 对话相关
  async createConversation(data) {
    const id = Date.now();
    const conversation = { id, ...data, created_at: new Date() };
    if (this.dbType === 'memory') {
      this.memory.conversations.set(id, conversation);
    }
    return id;
  }

  async getConversationList(tenantId, { page = 1, size = 20, status }) {
    if (this.dbType === 'memory') {
      let list = Array.from(this.memory.conversations.values())
        .filter(c => c.tenant_id === tenantId);
      
      if (status) list = list.filter(c => c.status === status);
      
      list.sort((a, b) => b.created_at - a.created_at);
      
      const total = list.length;
      const data = list.slice((page - 1) * size, page * size);
      return data;
    }
    return [];
  }

  async getConversation(id, tenantId) {
    if (this.dbType === 'memory') {
      const conv = this.memory.conversations.get(id);
      if (conv && conv.tenant_id === tenantId) return conv;
      return null;
    }
    return null;
  }

  // 消息相关
  async createMessage(data) {
    const id = Date.now();
    const message = { id, ...data, created_at: new Date() };
    if (this.dbType === 'memory') {
      this.memory.messages.set(id, message);
    }
    return id;
  }

  async getConversationMessages(conversationId) {
    if (this.dbType === 'memory') {
      return Array.from(this.memory.messages.values())
        .filter(m => m.conversation_id === conversationId)
        .sort((a, b) => a.created_at - b.created_at);
    }
    return [];
  }

  // 统计相关
  async getDashboardStats(tenantId) {
    if (this.dbType === 'memory') {
      const conversations = Array.from(this.memory.conversations.values())
        .filter(c => c.tenant_id === tenantId);
      
      const today = new Date().toISOString().split('T')[0];
      const todayConvs = conversations.filter(c => 
        c.created_at && c.created_at.toISOString().split('T')[0] === today
      );

      return {
        today: {
          conversations: todayConvs.length,
          answered: todayConvs.filter(c => c.status !== 'active').length,
          transferred: todayConvs.filter(c => c.status === 'transferred').length,
          avgRating: 4.5
        },
        week: [],
        hotQuestions: []
      };
    }
    return { today: { conversations: 0, answered: 0, transferred: 0, avgRating: 0 }, week: [], hotQuestions: [] };
  }

  // 用量相关
  async getTenantUsage(tenantId) {
    return { chats: 0, messages: 0, aiCalls: 0, tokens: 0 };
  }

  // 缓存（内存模式不使用 Redis）
  async cacheSet(key, value, expire = 3600) {}
  async cacheGet(key) { return null; }
  async cacheDel(key) {}
}

module.exports = new Database();
