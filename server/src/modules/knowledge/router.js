const express = require('express');
const router = express.Router();

// 模拟数据库
const knowledgeBase = new Map();

// 获取知识库列表
router.get('/', (req, res) => {
  const { page = 1, size = 10, category } = req.query;
  
  let list = Array.from(knowledgeBase.values())
    .filter(k => k.tenantId === req.tenantId);
  
  if (category) {
    list = list.filter(k => k.category === category);
  }
  
  const total = list.length;
  const data = list.slice((page - 1) * size, page * size);
  
  res.json({ code: 0, data: { list, total, page: Number(page), size: Number(size) } });
});

// 创建知识
router.post('/', (req, res) => {
  const { title, content, category } = req.body;
  
  const id = `kb_${Date.now()}`;
  const knowledge = {
    id,
    tenantId: req.tenantId,
    title,
    content,
    category: category || 'general',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  knowledgeBase.set(id, knowledge);
  
  res.json({ code: 0, data: { id } });
});

// 更新知识
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, category, status } = req.body;
  
  const knowledge = knowledgeBase.get(id);
  if (!knowledge || knowledge.tenantId !== req.tenantId) {
    return res.status(404).json({ error: '知识不存在' });
  }
  
  knowledge.title = title || knowledge.title;
  knowledge.content = content || knowledge.content;
  knowledge.category = category || knowledge.category;
  knowledge.status = status || knowledge.status;
  knowledge.updatedAt = new Date();
  
  knowledgeBase.set(id, knowledge);
  
  res.json({ code: 0, data: { success: true } });
});

// 删除知识
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const knowledge = knowledgeBase.get(id);
  if (!knowledge || knowledge.tenantId !== req.tenantId) {
    return res.status(404).json({ error: '知识不存在' });
  }
  
  knowledgeBase.delete(id);
  
  res.json({ code: 0, data: { success: true } });
});

// 批量导入
router.post('/import', (req, res) => {
  const { items } = req.body; // [{title, content, category}]
  
  const results = [];
  for (const item of items) {
    const id = `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const knowledge = {
      id,
      tenantId: req.tenantId,
      title: item.title,
      content: item.content,
      category: item.category || 'general',
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    knowledgeBase.set(id, knowledge);
    results.push({ id, title: item.title });
  }
  
  res.json({ code: 0, data: { imported: results.length, results } });
});

module.exports = router;
