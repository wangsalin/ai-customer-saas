// 完整对话服务 - 支持 AI 对话
const express = require('express');
const router = express.Router();
const { chatWithLLM } = require('../../utils/llm');

// 模拟数据库
const conversations = new Map();
const messages = new Map();

// 创建对话/发送消息
router.post('/', async (req, res) => {
  try {
    const { message, conversationId, channel = 'web' } = req.body;
    const userId = req.userId || 'anonymous';
    const tenantId = req.tenantId || 'default';
    
    let conversation;
    
    // 获取或创建对话
    if (conversationId) {
      conversation = conversations.get(conversationId);
      if (!conversation || conversation.tenantId !== tenantId) {
        return res.status(404).json({ error: '对话不存在' });
      }
    } else {
      conversationId = `conv_${Date.now()}`;
      conversation = {
        id: conversationId,
        tenantId,
        userId,
        channel,
        status: 'active',
        startedAt: new Date()
      };
      conversations.set(conversationId, conversation);
    }
    
    // 保存用户消息
    const userMsgId = `msg_${Date.now()}`;
    messages.set(userMsgId, {
      id: userMsgId,
      conversationId,
      role: 'user',
      content: message,
      source: 'human',
      createdAt: new Date()
    });
    
    // 获取历史对话
    const history = getConversationHistory(conversationId);
    
    // 调用大模型
    const reply = await chatWithLLM(message, history);
    
    // 保存 AI 回复
    const aiMsgId = `msg_${Date.now()}_ai`;
    messages.set(aiMsgId, {
      id: aiMsgId,
      conversationId,
      role: 'assistant',
      content: reply,
      source: 'ai',
      createdAt: new Date()
    });
    
    // 检查是否需要转人工
    const shouldTransfer = checkShouldTransfer(message, reply);
    if (shouldTransfer) {
      conversation.status = 'need_transfer';
    }
    
    res.json({
      code: 0,
      data: {
        reply,
        conversationId,
        needTransfer: shouldTransfer
      }
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'AI 回复失败' });
  }
});

// 获取对话列表
router.get('/list', (req, res) => {
  const { page = 1, size = 20, status } = req.query;
  const tenantId = req.tenantId || 'default';
  
  let list = Array.from(conversations.values())
    .filter(c => c.tenantId === tenantId);
  
  if (status) {
    list = list.filter(c => c.status === status);
  }
  
  list.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  
  const total = list.length;
  const data = list.slice((page - 1) * size, page * size);
  
  res.json({ code: 0, data: { list: data, total } });
});

// 获取对话详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const tenantId = req.tenantId || 'default';
  
  const conversation = conversations.get(id);
  if (!conversation || conversation.tenantId !== tenantId) {
    return res.status(404).json({ error: '对话不存在' });
  }
  
  const conversationMessages = Array.from(messages.values())
    .filter(m => m.conversationId === id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  res.json({ code: 0, data: { conversation, messages: conversationMessages } });
});

// 转人工
router.post('/transfer', (req, res) => {
  const { conversationId, reason } = req.body;
  const tenantId = req.tenantId || 'default';
  
  const conversation = conversations.get(conversationId);
  if (!conversation || conversation.tenantId !== tenantId) {
    return res.status(404).json({ error: '对话不存在' });
  }
  
  conversation.status = 'transferred';
  conversation.transferredAt = new Date();
  conversation.transferReason = reason;
  
  res.json({ code: 0, data: { success: true } });
});

// 评价
router.post('/rating', (req, res) => {
  const { conversationId, rating, comment } = req.body;
  const tenantId = req.tenantId || 'default';
  
  const conversation = conversations.get(conversationId);
  if (!conversation || conversation.tenantId !== tenantId) {
    return res.status(404).json({ error: '对话不存在' });
  }
  
  conversation.rating = rating;
  conversation.comment = comment;
  conversation.ratedAt = new Date();
  
  // 低分自动转人工
  if (rating <= 2) {
    conversation.status = 'need_transfer';
  }
  
  res.json({ code: 0, data: { success: true } });
});

// 辅助函数
function getConversationHistory(conversationId) {
  return Array.from(messages.values())
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(m => ({ role: m.role, content: m.content }));
}

function checkShouldTransfer(message, reply) {
  const triggers = ['投诉', '退款', '退货', '人工', '经理', '不满意', '赔偿', '太差', '投诉'];
  return triggers.some(t => message.includes(t));
}

module.exports = router;
