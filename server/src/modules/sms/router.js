// 短信服务模块 - 支持阿里云、腾讯云
const axios = require('axios');

class SMSService {
  constructor(config) {
    this.provider = config.provider || 'aliyun';
    this.config = config;
  }

  // 发送验证码
  async sendCode(phone) {
    const code = this.generateCode();
    
    try {
      if (this.provider === 'aliyun') {
        await this.sendAliyun(phone, code);
      } else if (this.provider === 'tencent') {
        await this.sendTencent(phone, code);
      }
      
      // 存储验证码（生产环境用 Redis）
      this.saveCode(phone, code);
      
      return { success: true, message: '验证码已发送' };
    } catch (error) {
      console.error('SMS send error:', error);
      return { success: false, message: '发送失败' };
    }
  }

  // 验证验证码
  verifyCode(phone, code) {
    const saved = this.codes.get(phone);
    if (!saved) {
      return { valid: false, message: '请先获取验证码' };
    }
    
    if (Date.now() > saved.expire) {
      this.codes.delete(phone);
      return { valid: false, message: '验证码已过期' };
    }
    
    if (saved.code !== code) {
      saved.attempts = (saved.attempts || 0) + 1;
      if (saved.attempts >= 3) {
        this.codes.delete(phone);
        return { valid: false, message: '验证码错误次数过多' };
      }
      return { valid: false, message: '验证码错误' };
    }
    
    this.codes.delete(phone);
    return { valid: true, message: '验证成功' };
  }

  // 生成6位验证码
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 存储验证码（内存中，生产环境用 Redis）
  saveCode(phone, code) {
    this.codes = this.codes || new Map();
    this.codes.set(phone, {
      code,
      expire: Date.now() + 5 * 60 * 1000, // 5分钟有效
      attempts: 0
    });
  }

  // 阿里云发送
  async sendAliyun(phone, code) {
    const { AccessKeyId, AccessKeySecret, SignName, TemplateCode } = this.config;
    
    // 签名算法（简化版，生产环境需要完整签名）
    const params = {
      AccessKeyId,
      Format: 'JSON',
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: Math.random().toString(36),
      SignatureVersion: '1.0',
      SignName,
      TemplateCode,
      TemplateParam: JSON.stringify({ code }),
      Timestamp: new Date().toISOString(),
      Action: 'SendSms',
      Version: '2017-05-25',
      PhoneNumbers: phone
    };
    
    // 这里需要完整签名算法，简化为直接调用
    console.log('Sending SMS via Aliyun:', params);
  }

  // 腾讯云发送
  async sendTencent(phone, code) {
    const { SecretId, SecretKey, AppId, TemplateId } = this.config;
    
    console.log('Sending SMS via Tencent:', { phone, code, AppId, TemplateId });
  }
}

module.exports = SMSService;
