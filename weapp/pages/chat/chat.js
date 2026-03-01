// pages/chat/chat.js
const app = getApp();

Page({
  data: {
    messages: [],
    inputValue: '',
    sending: false,
    userInfo: null
  },

  onLoad: function(options) {
    // 获取用户信息或生成临时ID
    const userId = wx.getStorageSync('userId') || 'user_' + Date.now();
    wx.setStorageSync('userId', userId);
    
    this.setData({ userId });
    
    // 加载历史消息
    this.loadHistory();
  },

  // 加载历史消息
  loadHistory: function() {
    const history = wx.getStorageSync('chat_history') || [];
    this.setData({ messages: history });
  },

  // 输入框变化
  onInput: function(e) {
    this.setData({ inputValue: e.detail.value });
  },

  // 发送消息
  sendMessage: async function() {
    const message = this.data.inputValue.trim();
    if (!message || this.data.sending) return;

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    const messages = [...this.data.messages, userMessage];
    this.setData({ 
      messages, 
      inputValue: '',
      sending: true 
    });

    // 保存历史
    this.saveHistory();

    // 滚动到底部
    this.scrollToBottom();

    try {
      // 调用 AI 对话 API
      const response = await wx.request({
        url: 'https://your-api.com/api/chat',
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          message: message,
          userId: this.data.userId,
          channel: 'weixin'
        }
      });

      // 添加 AI 回复
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data?.data?.reply || '抱歉，我现在比较忙，请稍后再试。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };

      this.setData({
        messages: [...this.data.messages, aiMessage],
        sending: false
      });

    } catch (error) {
      // 错误处理
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: '网络错误，请检查网络后重试。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };

      this.setData({
        messages: [...this.data.messages, errorMessage],
        sending: false
      });
    }

    // 保存历史并滚动
    this.saveHistory();
    this.scrollToBottom();
  },

  // 保存历史
  saveHistory: function() {
    wx.setStorageSync('chat_history', this.data.messages);
  },

  // 滚动到底部
  scrollToBottom: function() {
    wx.pageScrollTo({
      scrollTop: 99999,
      duration: 300
    });
  },

  // 预览图片
  previewImage: function(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      urls: [url]
    });
  }
});
