<template>
  <div class="billing-page">
    <div class="page-header">
      <h2>套餐管理</h2>
    </div>

    <!-- 当前套餐 -->
    <div class="current-plan glass">
      <div class="plan-info">
        <div class="plan-name">{{ currentPlan.name }}</div>
        <div class="plan-price">
          <span class="price">¥{{ currentPlan.price }}</span>
          <span class="unit">/月</span>
        </div>
        <div class="plan-features">
          <div v-for="feature in currentPlan.features" :key="feature" class="feature">
            <el-icon><Check /></el-icon>
            {{ feature }}
          </div>
        </div>
      </div>
      <div class="usage-section">
        <h4>本月用量</h4>
        <div class="usage-item">
          <span>对话次数</span>
          <el-progress :percentage="usagePercent(chats)" :status="usageStatus(chats)">
            {{ usage.used }}/{{ currentPlan.limits.chats === -1 ? '∞' : currentPlan.limits.chats }}
          </el-progress>
        </div>
        <div class="usage-item">
          <span>渠道数量</span>
          <el-progress :percentage="usagePercent(channels)" :status="usageStatus(channels)">
            {{ usage.channels.used }}/{{ currentPlan.limits.channels === -1 ? '∞' : currentPlan.limits.channels }}
          </el-progress>
        </div>
        <div class="usage-item">
          <span>团队成员</span>
          <el-progress :percentage="usagePercent(users)" :status="usageStatus(users)">
            {{ usage.users.used }}/{{ currentPlan.limits.users === -1 ? '∞' : currentPlan.limits.users }}
          </el-progress>
        </div>
      </div>
      <div class="plan-actions">
        <el-button type="primary" @click="showUpgradeDialog = true">
          升级套餐
        </el-button>
      </div>
    </div>

    <!-- 套餐列表 -->
    <div class="plans-grid">
      <div 
        v-for="plan in plans" 
        :key="plan.key" 
        :class="['plan-card', 'glass', { active: plan.key === currentPlan.key }]"
      >
        <div class="plan-header">
          <div class="plan-name">{{ plan.name }}</div>
          <div class="plan-price">
            <span class="price">¥{{ plan.price }}</span>
            <span class="unit" v-if="plan.price > 0">/月</span>
            <span class="unit" v-else>免费</span>
          </div>
        </div>
        <div class="plan-features">
          <div v-for="feature in plan.features" :key="feature" class="feature">
            <el-icon><Check /></el-icon>
            {{ feature }}
          </div>
        </div>
        <div class="plan-action">
          <el-button 
            v-if="plan.key === currentPlan.plan" 
            disabled
          >
            当前套餐
          </el-button>
          <el-button 
            v-else-if="isUpgrade(plan.key)"
            type="primary"
            @click="handleUpgrade(plan.key)"
          >
            升级
          </el-button>
          <el-button 
            v-else-if="isDowngrade(plan.key)"
            @click="handleDowngrade(plan.key)"
          >
            降级
          </el-button>
        </div>
      </div>
    </div>

    <!-- 升级弹窗 -->
    <el-dialog v-model="showUpgradeDialog" title="升级套餐" width="500px">
      <div class="upgrade-info">
        <p>当前套餐：<strong>{{ currentPlan.name }}</strong></p>
        <p>升级到：<strong>{{ selectedPlan?.name }}</strong></p>
        <p class="price-diff">
          差价：<span class="price">¥{{ selectedPlan?.price - currentPlan.price }}/月</span>
        </p>
      </div>
      <div class="payment-methods">
        <h4>选择支付方式</h4>
        <el-radio-group v-model="paymentMethod">
          <el-radio label="alipay">
            <img src="/alipay.png" alt="支付宝" class="pay-icon" />
            支付宝
          </el-radio>
          <el-radio label="wechat">
            <img src="/wechat.png" alt="微信" class="pay-icon" />
            微信支付
          </el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <el-button @click="showUpgradeDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmUpgrade" :loading="paying">
          立即支付
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPlan, getPlans, upgradePlan, getUsage } from '../../../api'

const loading = ref(false)
const paying = ref(false)
const showUpgradeDialog = ref(false)
const paymentMethod = ref('alipay')
const selectedPlanKey = ref(null)

const currentPlan = ref({
  plan: 'free',
  name: '免费版',
  price: 0,
  features: [],
  limits: { chats: 100, channels: 1, users: 3 }
})

const plans = ref([])
const usage = reactive({
  used: 0,
  channels: { used: 0 },
  users: { used: 0 }
})

const selectedPlan = computed(() => {
  return plans.value.find(p => p.key === selectedPlanKey.value)
})

const usagePercent = (item) => {
  if (!item?.used || !item?.limit) return 0
  if (item.limit === -1) return 0
  return Math.min(100, Math.round((item.used / item.limit) * 100))
}

const usageStatus = (item) => {
  const percent = usagePercent(item)
  if (percent >= 90) return 'exception'
  if (percent >= 70) return 'warning'
  return ''
}

const isUpgrade = (key) => {
  const order = ['free', 'pro', 'enterprise']
  return order.indexOf(key) > order.indexOf(currentPlan.value.plan)
}

const isDowngrade = (key) => {
  const order = ['free', 'pro', 'enterprise']
  return order.indexOf(key) < order.indexOf(currentPlan.value.plan)
}

const handleUpgrade = (key) => {
  selectedPlanKey.value = key
  showUpgradeDialog.value = true
}

const handleDowngrade = (key) => {
  selectedPlanKey.value = key
  // 降级逻辑
}

const confirmUpgrade = async () => {
  if (!selectedPlanKey.value) return
  
  paying.value = true
  try {
    // 调用支付接口
    // 这里需要集成真实支付
    await upgradePlan({ plan: selectedPlanKey.value })
    ElMessage.success('升级成功')
    showUpgradeDialog.value = false
    loadData()
  } catch (error) {
    ElMessage.error(error.message || '升级失败')
  } finally {
    paying.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    const [planRes, plansRes, usageRes] = await Promise.all([
      getPlan(),
      getPlans(),
      getUsage()
    ])
    
    currentPlan.value = planRes.data.plan
    plans.value = Object.entries(plansRes.data).map(([key, val]) => ({
      key,
      ...val
    }))
    Object.assign(usage, usageRes.data)
  } catch (error) {
    // 使用模拟数据
    currentPlan.value = {
      plan: 'free',
      name: '免费版',
      price: 0,
      features: ['100条对话/月', '1个渠道', '基础知识库'],
      limits: { chats: 100, channels: 1, users: 3 }
    }
    plans.value = [
      { key: 'free', name: '免费版', price: 0, features: ['100条对话/月', '1个渠道', '基础知识库'], limits: { chats: 100, channels: 1, users: 3 } },
      { key: 'pro', name: '专业版', price: 99, features: ['5000条对话/月', '3个渠道', '高级知识库'], limits: { chats: 5000, channels: 3, users: 10 } },
      { key: 'enterprise', name: '企业版', price: 299, features: ['无限对话', '10个渠道', '私有知识库'], limits: { chats: -1, channels: 10, users: -1 } }
    ]
    usage.used = 45
    usage.channels = { used: 1 }
    usage.users = { used: 2 }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.billing-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
}

.current-plan.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
}

.plan-info {
  text-align: center;
  margin-bottom: 32px;
}

.plan-name {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.plan-price {
  margin-bottom: 16px;
}

.plan-price .price {
  font-size: 36px;
  font-weight: 700;
  color: #007AFF;
}

.plan-price .unit {
  font-size: 14px;
  color: #86868b;
}

.plan-features {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #34C759;
  font-size: 14px;
}

.usage-section {
  border-top: 1px solid rgba(0,0,0,0.1);
  padding-top: 24px;
  margin-bottom: 24px;
}

.usage-section h4 {
  margin-bottom: 16px;
  color: #1d1d1f;
}

.usage-item {
  margin-bottom: 16px;
}

.usage-item span {
  display: block;
  margin-bottom: 8px;
  color: #86868b;
  font-size: 14px;
}

.plan-actions {
  text-align: center;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.plan-card.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  transition: transform 0.3s ease;
}

.plan-card.glass:hover {
  transform: translateY(-4px);
}

.plan-card.active {
  border: 2px solid #007AFF;
}

.plan-card .plan-name {
  font-size: 20px;
  margin-bottom: 16px;
}

.plan-card .plan-features {
  flex-direction: column;
  align-items: center;
  margin: 24px 0;
}

.plan-action {
  margin-top: 24px;
}

.upgrade-info {
  text-align: center;
  margin-bottom: 24px;
}

.upgrade-info p {
  margin-bottom: 8px;
  color: #86868b;
}

.price-diff .price {
  font-size: 24px;
  font-weight: 600;
  color: #FF9500;
}

.payment-methods h4 {
  margin-bottom: 16px;
}

.pay-icon {
  width: 24px;
  height: 24px;
  vertical-align: middle;
  margin-right: 8px;
}
</style>
