import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载
const Login = () => import('../views/Login.vue')
const Dashboard = () => import('../views/Dashboard.vue')
const KnowledgeList = () => import('../views/Knowledge/List.vue')
const ChatList = () => import('../views/Chat/Index.vue')
const TenantSettings = () => import('../views/Tenant/Settings.vue')
const Billing = () => import('../views/Billing/Index.vue')
const AdminDashboard = () => import('../views/Admin/Dashboard.vue')
const AdminTenants = () => import('../views/Admin/Tenants/List.vue')

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

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

export default router
