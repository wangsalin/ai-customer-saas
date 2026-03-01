<template>
  <div class="admin-page">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="logo">
        <h2>🎛️ 平台管理</h2>
      </div>
      <el-menu :default-active="activeMenu" router>
        <el-menu-item index="/admin">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/tenants">
          <el-icon><OfficeBuilding /></el-icon>
          <span>租户管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/orders">
          <el-icon><Ticket /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/config">
          <el-icon><Setting /></el-icon>
          <span>系统配置</span>
        </el-menu-item>
        <el-menu-item index="/admin/logs">
          <el-icon><Document /></el-icon>
          <span>操作日志</span>
        </el-menu-item>
      </el-menu>
    </aside>

    <!-- 主内容 -->
    <main class="main-content">
      <!-- 顶部 -->
      <header class="header">
        <div class="title">平台仪表盘</div>
        <div class="user-info">
          <el-avatar :size="36">管</el-avatar>
        </div>
      </header>

      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card glass">
          <div class="stat-icon" style="background: #007AFF;">
            <OfficeBuilding />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.tenants.total }}</div>
            <div class="stat-label">总租户数</div>
          </div>
        </div>
        
        <div class="stat-card glass">
          <div class="stat-icon" style="background: #34C759;">
            <UserFilled />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.tenants.active }}</div>
            <div class="stat-label">活跃租户</div>
          </div>
        </div>
        
        <div class="stat-card glass">
          <div class="stat-icon" style="background: #FF9500;">
            <ChatDotRound />
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.conversations.today }}</div>
            <div class="stat-label">今日对话</div>
          </div>
        </div>
        
        <div class="stat-card glass">
          <div class="stat-icon" style="background: #FF3B30;">
            <Coin />
          </div>
          <div class="stat-content">
            <div class="stat-value">¥{{ stats.revenue.today }}</div>
            <div class="stat-label">今日收入</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-grid">
        <div class="chart-card glass">
          <h3>租户增长趋势</h3>
          <div class="chart-placeholder">
            <el-icon :size="48" color="#ccc"><TrendCharts /></el-icon>
          </div>
        </div>
        
        <div class="chart-card glass">
          <h3>收入趋势</h3>
          <div class="chart-placeholder">
            <el-icon :size="48" color="#ccc"><TrendCharts /></el-icon>
          </div>
        </div>
      </div>

      <!-- 租户列表预览 -->
      <div class="recent-card glass">
        <div class="card-header">
          <h3>最近入驻租户</h3>
          <el-button type="primary" link @click="$router.push('/admin/tenants')">
            查看全部
          </el-button>
        </div>
        <el-table :data="recentTenants">
          <el-table-column prop="companyName" label="公司名称" />
          <el-table-column prop="plan" label="套餐">
            <template #default="{ row }">
              <el-tag :type="row.plan === 'enterprise' ? 'success' : row.plan === 'pro' ? 'warning' : 'info'">
                {{ row.plan }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
                {{ row.status === 'active' ? '活跃' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="注册时间" />
        </el-table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { DataAnalysis, OfficeBuilding, Ticket, Setting, Document, UserFilled, ChatDotRound, Coin, TrendCharts } from '@element-plus/icons-vue'

const activeMenu = ref('/admin')

const stats = reactive({
  tenants: { total: 0, active: 0 },
  conversations: { today: 0 },
  revenue: { today: 0 }
})

const recentTenants = ref([])

onMounted(() => {
  // 模拟数据
  stats.tenants = { total: 156, active: 89 }
  stats.conversations = { today: 1234 }
  stats.revenue = { today: 4560 }
  recentTenants.value = [
    { companyName: '测试公司A', plan: 'pro', status: 'active', createdAt: '2026-03-01' },
    { companyName: '电商公司B', plan: 'enterprise', status: 'active', createdAt: '2026-02-28' },
    { companyName: '教育机构C', plan: 'free', status: 'active', createdAt: '2026-02-25' }
  ]
})
</script>

<style scoped>
.admin-page {
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
  font-size: 18px;
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
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
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
  align-items: center;
  justify-content: center;
}

.recent-card.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  color: #1d1d1f;
}
</style>
