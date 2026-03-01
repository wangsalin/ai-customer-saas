<template>
  <div class="tenants-page">
    <div class="page-header">
      <h2>租户管理</h2>
      <div class="actions">
        <el-input v-model="keyword" placeholder="搜索公司/邮箱" style="width: 300px;" />
        <el-select v-model="filters.status" placeholder="状态" clearable>
          <el-option label="全部" value="" />
          <el-option label="活跃" value="active" />
          <el-option label="禁用" value="suspended" />
        </el-select>
        <el-select v-model="filters.plan" placeholder="套餐" clearable>
          <el-option label="全部" value="" />
          <el-option label="免费版" value="free" />
          <el-option label="专业版" value="pro" />
          <el-option label="企业版" value="enterprise" />
        </el-select>
      </div>
    </div>

    <div class="table-card glass">
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="companyName" label="公司名称" min-width="150" />
        <el-table-column prop="email" label="邮箱" min-width="150" />
        <el-table-column prop="industry" label="行业" width="100" />
        <el-table-column prop="plan" label="套餐" width="100">
          <template #default="{ row }">
            <el-tag :type="row.plan === 'enterprise' ? 'success' : row.plan === 'pro' ? 'warning' : 'info'">
              {{ getPlanName(row.plan) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '活跃' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="conversations" label="对话数" width="100" />
        <el-table-column prop="createdAt" label="注册时间" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView(row)">查看</el-button>
            <el-button type="warning" link @click="handleEdit(row)">编辑</el-button>
            <el-button 
              :type="row.status === 'active' ? 'danger' : 'success'" 
              link 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="showDetail" title="租户详情" width="600px">
      <div v-if="currentRow" class="tenant-detail">
        <div class="detail-item">
          <span class="label">公司名称：</span>
          <span class="value">{{ currentRow.companyName }}</span>
        </div>
        <div class="detail-item">
          <span class="label">邮箱：</span>
          <span class="value">{{ currentRow.email }}</span>
        </div>
        <div class="detail-item">
          <span class="label">行业：</span>
          <span class="value">{{ currentRow.industry }}</span>
        </div>
        <div class="detail-item">
          <span class="label">套餐：</span>
          <span class="value">{{ getPlanName(currentRow.plan) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="currentRow.status === 'active' ? 'success' : 'danger'">
            {{ currentRow.status === 'active' ? '活跃' : '禁用' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <span class="label">注册时间：</span>
          <span class="value">{{ currentRow.createdAt }}</span>
        </div>
        <div class="detail-item">
          <span class="label">对话总数：</span>
          <span class="value">{{ currentRow.conversations }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const showDetail = ref(false)
const currentRow = ref(null)
const keyword = ref('')

const filters = reactive({ status: '', plan: '' })
const pagination = reactive({ page: 1, size: 20, total: 0 })

const getPlanName = (plan) => {
  const names = { free: '免费版', pro: '专业版', enterprise: '企业版' }
  return names[plan] || plan
}

const handleView = (row) => {
  currentRow.value = row
  showDetail.value = true
}

const handleEdit = (row) => {
  ElMessage.info('编辑功能开发中')
}

const handleToggleStatus = (row) => {
  row.status = row.status === 'active' ? 'suspended' : 'active'
  ElMessage.success(row.status === 'active' ? '已启用' : '已禁用')
}

onMounted(() => {
  tableData.value = [
    { id: 1, companyName: '测试公司A', email: 'a@test.com', industry: '电商', plan: 'pro', status: 'active', conversations: 1234, createdAt: '2026-01-15' },
    { id: 2, companyName: '电商公司B', email: 'b@test.com', industry: '电商', plan: 'enterprise', status: 'active', conversations: 5678, createdAt: '2026-01-20' },
    { id: 3, companyName: '教育机构C', email: 'c@test.com', industry: '教育', plan: 'free', status: 'suspended', conversations: 45, createdAt: '2026-02-01' },
    { id: 4, companyName: '医疗机构D', email: 'd@test.com', industry: '医疗', plan: 'pro', status: 'active', conversations: 890, createdAt: '2026-02-10' },
    { id: 5, companyName: '金融公司E', email: 'e@test.com', industry: '金融', plan: 'enterprise', status: 'active', conversations: 2345, createdAt: '2026-02-15' }
  ]
  pagination.total = 5
})
</script>

<style scoped>
.tenants-page { padding: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-header h2 { font-size: 24px; font-weight: 600; color: #1d1d1f; }
.actions { display: flex; gap: 12px; }
.table-card.glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); border-radius: 16px; padding: 20px; }
.pagination { display: flex; justify-content: flex-end; margin-top: 20px; }
.tenant-detail { display: flex; flex-direction: column; gap: 16px; }
.detail-item { display: flex; gap: 12px; }
.detail-item .label { color: #86868b; min-width: 80px; }
.detail-item .value { color: #1d1d1f; }
</style>
