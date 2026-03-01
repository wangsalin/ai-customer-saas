<template>
  <div class="dashboard">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">
        <h2>🤖 智聊AI</h2>
      </div>
      <el-menu :default-active="activeMenu" router>
        <el-menu-item index="/">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/knowledge">
          <el-icon><Collection /></el-icon>
          <span>知识库</span>
        </el-menu-item>
        <el-menu-item index="/chat">
          <el-icon><ChatDotRound /></el-icon>
          <span>对话管理</span>
        </el-menu-item>
        <el-menu-item index="/billing">
          <el-icon><Coin /></el-icon>
          <span>套餐管理</span>
        </el-menu-item>
        <el-menu-item index="/tenant">
          <el-icon><Setting /></el-icon>
          <span>企业设置</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 主内容 -->
    <main class="main-content">
      <!-- 顶部 -->
      <header class="header">
        <div class="title">仪表盘</div>
        <div class="user-info">
          <el-avatar :size="36">{{ userName }}</el-avatar>
        </div>
      </header>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card glass">
          <div class="stat-icon" style="background: #007AFF;">
            <ChatDotRound />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.today.conversations }}</div>
            <div class="stat-label">今日对话</div>
          </div>
        </div>
        
        <div class="stat-card glass">
          <div class="stat-icon" style="background: #34C759;">
            <Service />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.today.aiAnswered }}</div>
            <div class="stat-label">AI回复</div>
          </div>
        </div>
        
        <div class="stat-card glass">
          <div class="stat-icon" style="background: #FF9500;">
            <Star />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.today.avgRating }}</div>
            <div class="stat-label">满意度</div>
          </div>
        </div>
        
        <div class="stat-card glass">
          <div class="stat-icon" style="background: #FF3B30;">
            <Phone />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.today.transferRate }}%</div>
            <div class="stat-label">转人工率</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-grid">
        <div class="chart-card glass">
          <h3>近7日趋势</h3>
          <div class="chart-placeholder">
            <el-icon :size="48" color="#ccc"><TrendCharts /></el-icon>
            <p>图表组件区域</p>
          </div>
        </div>
        
        <div class="chart-card glass">
          <h3>热点问题</h3>
          <div class="hot-list">
            <div v-for="(item, index) in stats.hotQuestions" :key="index" class="hot-item">
              <span class="rank">{{ index + 1 }}</span>
              <span class="keyword">{{ item.keyword }}</span>
              <span class="count">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DataAnalysis, Collection, ChatDotRound, Coin, Setting, Service, Star, Phone, TrendCharts } from '@element-plus/icons-vue'
import { getDashboard } from '@/api'

const router = useRouter()
const activeMenu = ref('/')
const stats = ref({
  today: { conversations: 0, aiAnswered: 0, avgRating: 0, transferRate: 0 },
  hotQuestions: []
})

const userName = computed(() => {
  const tenant = JSON.parse(localStorage.getItem('tenant') || '{}')
  return tenant.companyName?.charAt(0) || 'A'
})

onMounted(async () => {
  try {
    const { data } = await getDashboard()
    stats.value = data
  } catch (error) {
    // 使用模拟数据
    stats.value = {
      today: { conversations: 156, aiAnswered: 142, avgRating: 4.6, transferRate: 8.9 },
      hotQuestions: [
        { keyword: '如何退货', count: 156 },
        { keyword: '物流查询', count: 132 },
        { keyword: '产品质量', count: 98 }
      ]
    }
  }
})
</script>

<style scoped>
.dashboard {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 240px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  padding: 20px 0;
}

.logo {
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.logo h2 {
  font-size: 20px;
  color: #1d1d1f;
}

.main-content {
  flex: 1;
  padding: 24px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
}

.stat-label {
  font-size: 14px;
  color: #86868b;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.chart-card.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
}

.chart-card h3 {
  margin-bottom: 16px;
  color: #1d1d1f;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #86868b;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hot-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rank {
  width: 24px;
  height: 24px;
  background: #007AFF;
  color: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.keyword {
  flex: 1;
  color: #1d1d1f;
}

.count {
  color: #86868b;
  font-size: 14px;
}
</style>
