import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import KnowledgeList from '../views/Knowledge/List.vue'
import ChatList from '../views/Chat/Index.vue'
import TenantSettings from '../views/Tenant/Settings.vue'
import Billing from '../views/Billing/Index.vue'
import AdminDashboard from '../views/Admin/Dashboard.vue'
import AdminTenants from '../views/Admin/Tenants/List.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/knowledge', name: 'KnowledgeList', component: KnowledgeList },
  { path: '/chat', name: 'ChatList', component: ChatList },
  { path: '/tenant', name: 'TenantSettings', component: TenantSettings },
  { path: '/billing', name: 'Billing', component: Billing },
  // 平台管理端
  { path: '/admin', name: 'AdminDashboard', component: AdminDashboard },
  { path: '/admin/tenants', name: 'AdminTenants', component: AdminTenants }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

export default router
