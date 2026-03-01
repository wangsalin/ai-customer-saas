import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000
})

// 请求拦截器
client.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
client.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response || error)
  }
)

// 租户 API
export const login = (data) => client.post('/tenant/login', data)
export const register = (data) => client.post('/tenant/register', data)

// 知识库 API
export const getKnowledgeList = (params) => client.get('/knowledge', { params })
export const createKnowledge = (data) => client.post('/knowledge', data)
export const updateKnowledge = (id, data) => client.put(`/knowledge/${id}`, data)
export const deleteKnowledge = (id) => client.delete(`/knowledge/${id}`)
export const importKnowledge = (data) => client.post('/knowledge/import', data)

// 对话 API
export const sendChat = (data) => client.post('/chat', data)
export const getChatList = (params) => client.get('/chat/list', { params })
export const getChatDetail = (id) => client.get(`/chat/${id}`)
export const transferChat = (data) => client.post('/chat/transfer', data)
export const rateChat = (data) => client.post('/chat/rating', data)

// 统计 API
export const getDashboard = () => client.get('/stats/dashboard')
export const getTrend = (params) => client.get('/stats/trend', { params })

// 计费 API
export const getPlan = () => client.get('/billing/plan')
export const getPlans = () => client.get('/billing/plans')
export const upgradePlan = (data) => client.post('/billing/upgrade', data)
export const getUsage = () => client.get('/billing/usage')

export default client
