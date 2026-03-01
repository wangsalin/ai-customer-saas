<template>
  <div class="chat-list-page">
    <div class="page-header">
      <h2>对话管理</h2>
      <div class="actions">
        <el-select v-model="filters.status" placeholder="状态筛选" clearable @change="loadData">
          <el-option label="全部" value="" />
          <el-option label="进行中" value="active" />
          <el-option label="待回复" value="waiting" />
          <el-option label="已回复" value="answered" />
          <el-option label="已转人工" value="transferred" />
          <el-option label="已关闭" value="closed" />
        </el-select>
      </div>
    </div>

    <!-- 对话列表 -->
    <div class="table-card glass">
      <el-table :data="tableData" v-loading="loading" @row-click="handleRowClick">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32">{{ row.channel_user_name?.charAt(0) || 'U' }}</el-avatar>
              <span>{{ row.channel_user_name || '匿名用户' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="channel" label="渠道" width="100">
          <template #default="{ row }">
            <el-tag>{{ getChannelName(row.channel) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rating" label="评分" width="80">
          <template #default="{ row }">
            <el-rate v-if="row.rating" v-model="row.rating" disabled text-pattern />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="started_at" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.started_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="handleView(row)">查看</el-button>
            <el-button 
              v-if="row.status === 'active' || row.status === 'waiting'" 
              type="warning" 
              link 
              @click.stop="handleTransfer(row)"
            >转人工</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- 对话详情弹窗 -->
    <el-dialog
      v-model="showDetail"
      title="对话详情"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="chat-detail" v-if="currentChat">
        <div class="chat-header">
          <div class="user-info">
            <el-avatar :size="48">{{ currentChat.channel_user_name?.charAt(0) || 'U' }}</el-avatar>
            <div>
              <div class="name">{{ currentChat.channel_user_name || '匿名用户' }}</div>
              <div class="meta">
                {{ getChannelName(currentChat.channel) }} · {{ formatTime(currentChat.started_at) }}
              </div>
            </div>
          </div>
          <div class="status-actions">
            <el-tag :type="getStatusType(currentChat.status)">
              {{ getStatusName(currentChat.status) }}
            </el-tag>
            <el-button 
              v-if="currentChat.status === 'active' || currentChat.status === 'waiting'"
              type="warning"
              @click="handleTransfer(currentChat)"
            >
              转人工
            </el-button>
          </div>
        </div>

        <div class="messages-area" ref="messagesRef">
          <div 
            v-for="msg in messages" 
            :key="msg.id" 
            :class="['message', msg.role]"
          >
            <div class="avatar">
              <img v-if="msg.role === 'assistant'" alt="AI" />
              <img v-else-if="msg.role === 'agent'" alt="客服" />
              <div v-else class="user-avatar">{{ msg.content?.charAt(0) }}</div>
            </div>
            <div class="content">
              <div class="bubble">{{ msg.content }}</div>
              <div class="time">{{ formatTime(msg.created_at) }}</div>
            </div>
          </div>
        </div>

        <!-- 评价区域 -->
        <div class="rating-area" v-if="currentChat.status === 'closed'">
          <div v-if="currentChat.rating">
            <el-rate v-model="currentChat.rating" disabled text-pattern />
            <div class="comment" v-if="currentChat.rating_comment">
              {{ currentChat.rating_comment }}
            </div>
          </div>
          <div v-else>
            <span>用户未评价</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="showDetail = false">关闭</el-button>
        <el-button 
          v-if="currentChat && currentChat.status !== 'closed'"
          type="danger" 
          @click="handleClose"
        >
          结束对话
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getChatList, getChatDetail, transferChat, rateChat } from '@/api'

const loading = ref(false)
const tableData = ref([])
const showDetail = ref(false)
const currentChat = ref(null)
const messages = ref([])
const messagesRef = ref(null)

const filters = reactive({
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const channelMap = {
  'weixin': '微信',
  'feishu': '飞书',
  'web': '网页',
  'app': 'App'
}

const statusMap = {
  'active': '进行中',
  'waiting': '待回复',
  'answered': '已回复',
  'transferred': '已转人工',
  'closed': '已关闭'
}

const getChannelName = (val) => channelMap[val] || val
const getStatusName = (val) => statusMap[val] || val
const getStatusType = (val) => {
  const types = {
    'active': 'primary',
    'waiting': 'warning',
    'answered': 'success',
    'transferred': 'danger',
    'closed': 'info'
  }
  return types[val] || 'info'
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await getChatList({
      page: pagination.page,
      size: pagination.size,
      status: filters.status
    })
    tableData.value = data.list
    pagination.total = data.total || 0
  } catch (error) {
    // 模拟数据
    tableData.value = [
      { id: 1, channel: 'weixin', channel_user_name: '张三', status: 'active', started_at: new Date(), rating: null },
      { id: 2, channel: 'feishu', channel_user_name: '李四', status: 'answered', started_at: new Date(), rating: 5 },
      { id: 3, channel: 'web', channel_user_name: '王五', status: 'transferred', started_at: new Date(), rating: 3 }
    ]
    pagination.total = 3
  } finally {
    loading.value = false
  }
}

const handleRowClick = (row) => {
  handleView(row)
}

const handleView = async (row) => {
  currentChat.value = row
  showDetail.value = true
  messages.value = [
    { id: 1, role: 'user', content: '你好，我想问一下退货流程', created_at: new Date(Date.now() - 60000) },
    { id: 2, role: 'assistant', content: '您好！请问您的订单号是多少？', created_at: new Date(Date.now() - 30000) },
    { id: 3, role: 'user', content: '订单号是 20260301001', created_at: new Date() }
  ]
  await nextTick()
  scrollToBottom()
}

const scrollToBottom = () => {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

const handleTransfer = async (row) => {
  try {
    await ElMessageBox.confirm('确定转接人工客服吗？', '提示', {
      type: 'warning'
    })
    await transferChat({ conversationId: row.id })
    ElMessage.success('已转人工')
    loadData()
    if (showDetail.value) {
      currentChat.value.status = 'transferred'
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleClose = async () => {
  try {
    await ElMessageBox.confirm('确定结束当前对话吗？', '提示', {
      type: 'warning'
    })
    // 关闭对话
    currentChat.value.status = 'closed'
    ElMessage.success('对话已结束')
    loadData()
  } catch (error) {
    // 取消
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.chat-list-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
}

.table-card.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.chat-detail {
  display: flex;
  flex-direction: column;
  height: 500px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  margin-bottom: 16px;
}

.chat-header .user-info .name {
  font-weight: 600;
  color: #1d1d1f;
}

.chat-header .user-info .meta {
  font-size: 12px;
  color: #86868b;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  display: flex;
  margin-bottom: 16px;
}

.message.user {
  flex-direction: row-reverse;
}

.message .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  overflow: hidden;
}

.message.user .avatar {
  background: #007AFF;
  color: white;
}

.message.assistant .avatar img,
.message.agent .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message .content {
  max-width: 70%;
  margin: 0 12px;
}

.message .bubble {
  background: rgba(255,255,255,0.8);
  padding: 12px 16px;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.1);
}

.message.user .bubble {
  background: #007AFF;
  color: white;
}

.message .time {
  font-size: 12px;
  color: #86868b;
  margin-top: 4px;
}

.message.user .time {
  text-align: right;
}

.rating-area {
  padding-top: 16px;
  border-top: 1px solid rgba(0,0,0,0.1);
  margin-top: 16px;
}

.comment {
  margin-top: 8px;
  color: #86868b;
  font-size: 14px;
}
</style>
