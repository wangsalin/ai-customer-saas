<template>
  <div class="tenant-settings">
    <!-- 企业信息 -->
    <div class="section">
      <h3>企业信息</h3>
      <div class="card glass">
        <el-form :model="tenantForm" label-width="100px">
          <el-form-item label="企业名称">
            <el-input v-model="tenantForm.companyName" placeholder="请输入企业名称" />
          </el-form-item>
          <el-form-item label="行业">
            <el-select v-model="tenantForm.industry" placeholder="请选择行业">
              <el-option label="电商" value="ecommerce" />
              <el-option label="教育" value="education" />
              <el-option label="医疗" value="healthcare" />
              <el-option label="金融" value="finance" />
              <el-option label="制造业" value="manufacturing" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
          <el-form-item label="联系人">
            <el-input v-model="tenantForm.contact" placeholder="请输入联系人" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="tenantForm.phone" placeholder="请输入联系电话" />
          </el-form-item>
          <el-form-item label="Logo">
            <el-upload
              class="logo-uploader"
              :show-file-list="false"
              :on-change="handleLogoChange"
            >
              <img v-if="tenantForm.logo" :src="tenantForm.logo" class="logo" />
              <el-icon v-else class="uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveTenantInfo" :loading="saving">
              保存
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 渠道配置 -->
    <div class="section">
      <h3>渠道配置</h3>
      <div class="channels-grid">
        <div v-for="channel in channels" :key="channel.type" class="channel-card glass">
          <div class="channel-header">
            <img alt="channel.name" :alt="channel.name" class="channel-icon" />
            <div class="channel-info">
              <div class="name">{{ channel.name }}</div>
              <div class="status">
                <el-tag v-if="channel.enabled" type="success" size="small">已启用</el-tag>
                <el-tag v-else type="info" size="small">未启用</el-tag>
              </div>
            </div>
          </div>
          <div class="channel-config" v-if="channel.enabled">
            <div class="config-item">
              <span class="label">AppID:</span>
              <span class="value">{{ channel.config?.appId || '-' }}</span>
            </div>
          </div>
          <div class="channel-actions">
            <el-button v-if="channel.enabled" @click="configureChannel(channel)">配置</el-button>
            <el-button v-else type="primary" @click="enableChannel(channel)">启用</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 团队成员 -->
    <div class="section">
      <h3>团队成员</h3>
      <div class="card glass">
        <div class="table-header">
          <el-button type="primary" @click="showInviteDialog = true">邀请成员</el-button>
        </div>
        <el-table :data="members">
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="role" label="角色">
            <template #default="{ row }">
              <el-select v-model="row.role" @change="updateRole(row)">
                <el-option label="管理员" value="admin" />
                <el-option label="经理" value="manager" />
                <el-option label="客服" value="agent" />
                <el-option label="查看者" value="viewer" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="last_login" label="最后登录">
            <template #default="{ row }">
              {{ row.last_login ? formatTime(row.last_login) : '从未登录' }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="danger" link @click="removeMember(row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 安全设置 -->
    <div class="section">
      <h3>安全设置</h3>
      <div class="card glass">
        <el-form label-width="120px">
          <el-form-item label="修改密码">
            <el-button @click="showPasswordDialog = true">修改密码</el-button>
          </el-form-item>
          <el-form-item label="两步验证">
            <el-switch v-model="securitySettings.twoFactor" />
            <span class="hint">启用后登录需要额外验证</span>
          </el-form-item>
          <el-form-item label="登录通知">
            <el-switch v-model="securitySettings.loginNotify" />
            <span class="hint">新设备登录时发送通知</span>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 邀请成员弹窗 -->
    <el-dialog v-model="showInviteDialog" title="邀请成员" width="500px">
      <el-form :model="inviteForm" label-width="80px">
        <el-form-item label="邮箱" required>
          <el-input v-model="inviteForm.email" placeholder="请输入成员邮箱" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="inviteForm.name" placeholder="请输入成员姓名" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="inviteForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="经理" value="manager" />
            <el-option label="客服" value="agent" />
            <el-option label="查看者" value="viewer" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showInviteDialog = false">取消</el-button>
        <el-button type="primary" @click="sendInvite">发送邀请</el-button>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form :model="passwordForm" label-width="80px">
        <el-form-item label="原密码">
          <el-input v-model="passwordForm.oldPassword" type="password" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="changePassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const saving = ref(false)
const showInviteDialog = ref(false)
const showPasswordDialog = ref(false)

const tenantForm = reactive({
  companyName: '',
  industry: '',
  contact: '',
  phone: '',
  logo: ''
})

const inviteForm = reactive({
  email: '',
  name: '',
  role: 'agent'
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const securitySettings = reactive({
  twoFactor: false,
  loginNotify: true
})

const channels = ref([
  { type: 'weixin', name: '微信小程序', enabled: false, config: {} },
  { type: 'feishu', name: '飞书机器人', enabled: false, config: {} },
  { type: 'web', name: '网页客服', enabled: false, config: {} }
])

const members = ref([])

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const saveTenantInfo = async () => {
  saving.value = true
  try {
    // 保存企业信息
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleLogoChange = (file) => {
  const url = URL.createObjectURL(file.raw)
  tenantForm.logo = url
}

const enableChannel = (channel) => {
  // 启用渠道
}

const configureChannel = (channel) => {
  // 配置渠道
}

const sendInvite = async () => {
  if (!inviteForm.email || !inviteForm.role) {
    ElMessage.warning('请填写完整信息')
    return
  }
  ElMessage.success('邀请已发送')
  showInviteDialog.value = false
}

const updateRole = (row) => {
  ElMessage.success(`已将 ${row.name} 修改为 ${row.role}`)
}

const removeMember = async (row) => {
  try {
    await ElMessageBox.confirm(`确定移除成员 ${row.name} 吗？`, '提示', {
      type: 'warning'
    })
    members.value = members.value.filter(m => m.id !== row.id)
    ElMessage.success('已移除')
  } catch (error) {
    // 取消
  }
}

const changePassword = async () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword) {
    ElMessage.warning('请填写密码')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.warning('两次密码不一致')
    return
  }
  ElMessage.success('密码已修改')
  showPasswordDialog.value = false
}

onMounted(() => {
  // 加载数据
  tenantForm.companyName = '示例公司'
  members.value = [
    { id: 1, name: '管理员', email: 'admin@example.com', role: 'admin', last_login: new Date() },
    { id: 2, name: '客服小王', email: 'wang@example.com', role: 'agent', last_login: null }
  ]
})
</script>

<style scoped>
.tenant-settings {
  padding: 24px;
}

.section {
  margin-bottom: 32px;
}

.section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 16px;
}

.card.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
}

.logo-uploader {
  width: 100px;
  height: 100px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-uploader:hover {
  border-color: #007AFF;
}

.logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.channel-card.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
}

.channel-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.channel-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
}

.channel-info .name {
  font-weight: 600;
  color: #1d1d1f;
}

.config-item {
  font-size: 14px;
  color: #86868b;
  margin-bottom: 8px;
}

.config-item .label {
  margin-right: 8px;
}

.hint {
  margin-left: 12px;
  font-size: 12px;
  color: #86868b;
}

.table-header {
  margin-bottom: 16px;
}
</style>
