const axios = require('axios');

const LLM_CONFIG = {
  provider: process.env.LLM_PROVIDER || 'qwen',
  qwen: {
    apiKey: process.env.QWEN_API_KEY,
    endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    endpoint: 'https://api.openai.com/v1/chat/completions'
  }
};

async function chatWithLLM(message, history = []) {
  const provider = LLM_CONFIG.provider;
  
  const messages = [
    { role: 'system', content: '你是一个专业的AI客服，请用友好的态度回答用户的问题。' },
    ...history.slice(-10), // 只保留最近10条
    { role: 'user', content: message }
  ];
  
  try {
    if (provider === 'qwen') {
      return await qwenChat(messages);
    } else if (provider === 'openai') {
      return await openaiChat(messages);
    } else {
      return '抱歉，暂时无法回答您的问题，请稍后重试。';
    }
  } catch (error) {
    console.error('LLM Error:', error.message);
    return '抱歉，服务暂时繁忙，请联系人工客服。';
  }
}

async function qwenChat(messages) {
  const { apiKey, endpoint } = LLM_CONFIG.qwen;
  
  if (!apiKey) {
    return 'AI 服务未配置，请联系管理员。';
  }
  
  const response = await axios.post(endpoint, {
    model: 'qwen-turbo',
    input: { messages },
    parameters: {
      temperature: 0.7,
      max_tokens: 2000,
      result_format: 'message'
    }
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.output.choices[0].message.content;
}

async function openaiChat(messages) {
  const { apiKey, endpoint } = LLM_CONFIG.openai;
  
  if (!apiKey) {
    return 'AI 服务未配置，请联系管理员。';
  }
  
  const response = await axios.post(endpoint, {
    model: 'gpt-3.5-turbo',
    messages
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
}

module.exports = { chatWithLLM };
