<template>
  <div class="login-page">
    <div class="glass-card">
      <div class="logo">
        <div class="logo-icon">🤖</div>
        <h1>智聊AI</h1>
        <p>智能客服 SaaS 平台</p>
      </div>
      
      <!-- 登录方式切换 -->
      <div class="login-tabs">
        <div 
          :class="['tab', { active: loginType === 'password' }]"
          @click="loginType = 'password'"
        >
          密码登录
        </div>
        <div 
          :class="['tab', { active: loginType === 'sms' }]"
          @click="loginType = 'sms'"
        >
          短信登录
        </div>
      </div>
      
      <!-- 密码登录 -->
      <el-form v-if="loginType === 'password'" :model="form" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input 
            v-model="form.email" 
            placeholder="邮箱" 
            :prefix-icon="Message"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="密码" 
            :prefix-icon="Lock"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 短信登录 -->
      <el-form v-else :model="smsForm" @submit.prevent="handleSMSLogin">
        <el-form-item>
          <el-input 
            v-model="smsForm.phone" 
            placeholder="手机号" 
            :prefix-icon="Phone"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <div class="sms-code-input">
            <el-input 
              v-model="smsForm.code" 
              placeholder="验证码" 
              size="large"
            />
            <el-button 
              size="large" 
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="loading"
            class="login-btn"
            @click="handleSMSLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 第三方登录 -->
      <div class="third-party">
        <div class="divider">
          <span>其他登录方式</span>
        </div>
        <div class="third-party-btns">
          <div class="third-party-btn" @click="handleWechatLogin">
            💬 微信登录
          </div>
        </div>
      </div>
      
      <div class="footer">
        <a href="#">忘记密码？</a>
        <span>|</span>
        <a href="#">注册企业账号</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Lock, Phone } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { login } from '@/api'

const router = useRouter()
const loading = ref(false)
const loginType = ref('password')
const countdown = ref(0)

const form = reactive({
  email: '',
  password: ''
})

const smsForm = reactive({
  phone: '',
  code: ''
})

const handleLogin = async () => {
  if (!form.email || !form.password) {
    ElMessage.warning('请输入邮箱和密码')
    return
  }
  
  loading.value = true
  try {
    const { data } = await login(form)
    localStorage.setItem('token', data.token)
    localStorage.setItem('tenant', JSON.stringify(data.tenant))
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.response?.data?.error || '登录失败')
  } finally {
    loading.value = false
  }
}

const sendCode = async () => {
  if (!smsForm.phone) {
    ElMessage.warning('请输入手机号')
    return
  }
  
  // 模拟发送验证码
  ElMessage.success('验证码已发送')
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSMSLogin = async () => {
  if (!smsForm.phone || !smsForm.code) {
    ElMessage.warning('请输入手机号和验证码')
    return
  }
  
  loading.value = true
  try {
    // 模拟短信登录
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    ElMessage.error('登录失败')
  } finally {
    loading.value = false
  }
}

const handleWechatLogin = () => {
  ElMessage.info('微信登录开发中')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 48px;
  width: 100%;
  max-width: 420px;
}

.logo { text-align: center; margin-bottom: 32px; }
.logo-icon { font-size: 64px; margin-bottom: 8px; }
.logo h1 {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}
.logo p { color: #86868b; font-size: 14px; }

.login-tabs { display: flex; margin-bottom: 24px; border-bottom: 1px solid #eee; }
.tab { flex: 1; text-align: center; padding: 12px; cursor: pointer; color: #86868b; }
.tab.active { color: #007AFF; border-bottom: 2px solid #007AFF; font-weight: 600; }

.login-btn { width: 100%; height: 48px; font-size: 16px; font-weight: 600; background: linear-gradient(135deg, #007AFF 0%, #5856D6 100%); border: none; border-radius: 12px; }

.sms-code-input { display: flex; gap: 12px; }
.sms-code-input .el-input { flex: 1; }

.third-party { margin-top: 24px; }
.divider { display: flex; align-items: center; margin: 16px 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #eee; }
.divider span { padding: 0 16px; color: #86868b; font-size: 14px; }

.third-party-btns { display: flex; justify-content: center; gap: 16px; }
.third-party-btn { padding: 12px 24px; border-radius: 12px; background: #07C160; color: white; cursor: pointer; font-weight: 600; }

.footer { text-align: center; margin-top: 24px; color: #86868b; font-size: 14px; }
.footer a { color: #007AFF; text-decoration: none; }
.footer span { margin: 0 12px; }
</style>
