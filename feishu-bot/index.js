// 飞书机器人服务
const axios = require('axios');

class FeishuBot {
  constructor(config) {
    this.appId = config.appId;
    this.appSecret = config.appSecret;
    this.token = null;
    this.tokenExpire = 0;
  }

  // 获取 tenant_access_token
  async getToken() {
    if (this.token && Date.now() < this.tokenExpire) {
      return this.token;
    }

    try {
      const response = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
          app_id: this.appId,
          app_secret: this.appSecret
        }
      );

      if (response.data.code === 0) {
        this.token = response.data.tenant_access_token;
        this.tokenExpire = Date.now() + response.data.expire * 1000 - 60000;
        return this.token;
      }
      throw new Error(response.data.msg);
    } catch (error) {
      console.error('Failed to get token:', error.message);
      throw error;
    }
  }

  // 发送消息
  async sendMessage(receiveId, message, msgType = 'text') {
    const token = await this.getToken();

    try {
      const response = await axios.post(
        'https://open.feishu.cn/open-apis/im/v1/messages',
        {
          receive_id: receiveId,
          msg_type: msgType,
          content: JSON.stringify({ text: message })
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error.message);
      throw error;
    }
  }

  // 回复消息
  async replyMessage(messageId, message, msgType = 'text') {
    const token = await this.getToken();

    try {
      const response = await axios.post(
        `https://open.feishu.cn/open-apis/im/v1/messages/${messageId}/reply`,
        {
          msg_type: msgType,
          content: JSON.stringify({ text: message })
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to reply message:', error.message);
      throw error;
    }
  }

  // 处理接收到的消息
  async handleMessage(event, chatWithLLM) {
    const { message_id, chat_id, sender_id, message } = event;
    
    // 提取消息内容
    let userMessage = '';
    if (message.msg_type === 'text') {
      userMessage = message.text;
    } else if (message.msg_type === 'image') {
      userMessage = '[图片消息]';
    }

    if (!userMessage) return;

    // 调用 AI 对话
    const reply = await chatWithLLM(userMessage, []);

    // 回复用户
    await this.replyMessage(message_id, reply);
  }

  // 创建群聊
  async createChat(name, userIds) {
    const token = await this.getToken();

    try {
      const response = await axios.post(
        'https://open.feishu.cn/open-apis/im/v1/chats',
        {
          name,
          user_id_list: userIds,
          chat_mode: '群聊',
          chat_type: 'private'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to create chat:', error.message);
      throw error;
    }
  }

  // 添加群成员
  async addChatMembers(chatId, userIds) {
    const token = await this.getToken();

    try {
      const response = await axios.post(
        `https://open.feishu.cn/open-apis/im/v1/chats/${chatId}/members`,
        {
          member_id_type: 'user_id',
          id_list: userIds
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to add members:', error.message);
      throw error;
    }
  }

  // 获取用户信息
  async getUserInfo(userId) {
    const token = await this.getToken();

    try {
      const response = await axios.get(
        `https://open.feishu.cn/open-apis/open-apis/v1/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error.message);
      throw error;
    }
  }
}

// 飞书 Webhook 事件处理
function createWebhookHandler(bot, chatWithLLM) {
  return async (req, res) => {
    // 验证签名（生产环境需要）
    
    const event = req.body;
    
    // 处理 URL 验证
    if (event.type === 'url_verification') {
      return res.json({ challenge: event.challenge });
    }

    // 处理消息事件
    if (event.type === 'im.message' && event.event.message) {
      const message = event.event.message;
      
      // 忽略机器人自己的消息
      if (message.sender_type === 'app') {
        return res.json({ code: 0 });
      }

      try {
        await bot.handleMessage(message, chatWithLLM);
      } catch (error) {
        console.error('Handle message error:', error);
      }
    }

    res.json({ code: 0 });
  };
}

module.exports = { FeishuBot, createWebhookHandler };
