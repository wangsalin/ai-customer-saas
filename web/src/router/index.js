import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import KnowledgeList from '../views/Knowledge/List.vue'
import ChatList from '../views/Chat/Index.vue'
import TenantSettings from '../views/Tenant/Settings.vue'
import Billing from '../views/Billing/Index.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/knowledge', name: 'KnowledgeList', component: KnowledgeList },
  { path: '/chat', name: 'ChatList', component: ChatList },
  { path: '/tenant', name: 'TenantSettings', component: TenantSettings },
  { path: '/billing', name: 'Billing', component: Billing }
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
