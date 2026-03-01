<template>
  <div class="knowledge-page">
    <div class="page-header">
      <h2>知识库管理</h2>
      <div class="actions">
        <el-upload
          action="/api/knowledge/import"
          :headers="uploadHeaders"
          :show-file-list="false"
          :on-success="handleImportSuccess"
          :on-error="handleImportError"
        >
          <el-button>批量导入</el-button>
        </el-upload>
        <el-button type="primary" @click="showCreateDialog = true">
          添加知识
        </el-button>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="filters">
      <el-select v-model="filters.category" placeholder="分类" clearable @change="loadData">
        <el-option label="全部" value="" />
        <el-option label="售前咨询" value="pre-sale" />
        <el-option label="售后服务" value="after-sale" />
        <el-option label="技术支持" value="support" />
        <el-option label="其他" value="other" />
      </el-select>
      <el-select v-model="filters.status" placeholder="状态" clearable @change="loadData">
        <el-option label="全部" value="" />
        <el-option label="草稿" value="draft" />
        <el-option label="已发布" value="published" />
        <el-option label="已归档" value="archived" />
      </el-select>
      <el-input
        v-model="filters.keyword"
        placeholder="搜索标题/内容"
        clearable
        @change="loadData"
        style="width: 300px;"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
    </div>

    <!-- 表格 -->
    <div class="table-card glass">
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag>{{ getCategoryName(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="view_count" label="查看" width="80" />
        <el-table-column prop="useful_count" label="赞" width="80" />
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button 
              type="success" 
              link 
              @click="handlePublish(row)"
              v-if="row.status === 'draft'"
            >发布</el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDelete(row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingId ? '编辑知识' : '添加知识'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="80px" ref="formRef">
        <el-form-item label="标题" prop="title" required>
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择分类">
            <el-option label="售前咨询" value="pre-sale" />
            <el-option label="售后服务" value="after-sale" />
            <el-option label="技术支持" value="support" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="多个标签用逗号分隔" />
        </el-form-item>
        <el-form-item label="内容" prop="content" required>
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="请输入知识内容"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="draft">草稿</el-radio>
            <el-radio label="published">直接发布</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getKnowledgeList, createKnowledge, updateKnowledge, deleteKnowledge } from '../../../api'

const loading = ref(false)
const submitting = ref(false)
const tableData = ref([])
const showCreateDialog = ref(false)
const editingId = ref(null)
const formRef = ref(null)

const filters = reactive({
  category: '',
  status: '',
  keyword: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const form = reactive({
  title: '',
  category: 'general',
  tags: '',
  content: '',
  status: 'draft'
})

const uploadHeaders = ref({
  Authorization: `Bearer ${localStorage.getItem('token')}`
})

const categoryMap = {
  'pre-sale': '售前咨询',
  'after-sale': '售后服务',
  'support': '技术支持',
  'general': '其他'
}

const statusMap = {
  'draft': '草稿',
  'published': '已发布',
  'archived': '已归档'
}

const getCategoryName = (val) => categoryMap[val] || '其他'
const getStatusName = (val) => statusMap[val] || val
const getStatusType = (val) => {
  const types = { draft: 'info', published: 'success', archived: 'warning' }
  return types[val] || 'info'
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const loadData = async () => {
  loading.value = true
  try {
    const { data } = await getKnowledgeList({
      page: pagination.page,
      size: pagination.size,
      category: filters.category,
      status: filters.status
    })
    tableData.value = data.list
    pagination.total = data.total
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const handleEdit = (row) => {
  editingId.value = row.id
  Object.assign(form, {
    title: row.title,
    category: row.category,
    tags: row.tags,
    content: row.content,
    status: row.status
  })
  showCreateDialog.value = true
}

const handleSubmit = async () => {
  if (!form.title || !form.content) {
    ElMessage.warning('请填写标题和内容')
    return
  }

  submitting.value = true
  try {
    if (editingId.value) {
      await updateKnowledge(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createKnowledge(form)
      ElMessage.success('创建成功')
    }
    showCreateDialog.value = false
    loadData()
    resetForm()
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除这条知识吗？', '提示', {
      type: 'warning'
    })
    await deleteKnowledge(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handlePublish = async (row) => {
  try {
    await updateKnowledge(row.id, { status: 'published' })
    ElMessage.success('发布成功')
    loadData()
  } catch (error) {
    ElMessage.error('发布失败')
  }
}

const handleImportSuccess = (response) => {
  ElMessage.success(`成功导入 ${response.data.imported} 条`)
  loadData()
}

const handleImportError = () => {
  ElMessage.error('导入失败')
}

const resetForm = () => {
  editingId.value = null
  Object.assign(form, {
    title: '',
    category: 'general',
    tags: '',
    content: '',
    status: 'draft'
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.knowledge-page {
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

.actions {
  display: flex;
  gap: 12px;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.table-card.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
