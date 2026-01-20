import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加token（如果有）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // 只在有token时才添加，允许未登录访问查看接口
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => {
    // 如果是blob响应，直接返回
    if (response.config.responseType === 'blob') {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    // 401错误：只在确实需要登录的操作时跳转（例如创建、更新、删除）
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      // 如果有token但401，说明token过期，清除并提示
      if (token) {
        localStorage.removeItem('token');
        // 只有在需要认证的操作时才自动跳转
        const method = error.config?.method?.toUpperCase();
        if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
          window.location.href = '/login';
        }
      }
    }
    // blob响应错误也需要特殊处理
    if (error.config?.responseType === 'blob' && error.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// 认证API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (username, password) => api.post('/auth/login', { username, password }),
  wechatLogin: (code, userInfo) => api.post('/auth/wechat', { code, ...userInfo }),
  verify: (token) => api.get('/auth/verify', { headers: { Authorization: `Bearer ${token}` } }),
};

// 订单API
export const ordersAPI = {
  search: (orderNumber) => api.get('/orders/search', { params: { orderNumber } }),
  list: (params) => api.get('/orders', { params }),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  // 管理员专用接口
  adminImport: (data) => api.post('/orders/admin/import', data),
  adminList: (params) => api.get('/orders/admin/list', { params }),
  adminCreate: (data) => api.post('/orders/admin/create', data),
  adminUpdate: (id, data) => api.put(`/orders/admin/${id}`, data),
  adminDelete: (id) => api.delete(`/orders/admin/${id}`),
  adminBatchDelete: (ids) => api.post('/orders/admin/batch-delete', { ids }),
};

// 批次API
export const batchesAPI = {
  list: (params) => api.get('/batches', { params }),
  get: (id) => api.get(`/batches/${id}`),
  create: (data) => api.post('/batches', data),
  update: (id, data) => api.put(`/batches/${id}`, data),
  delete: (id) => api.delete(`/batches/${id}`),
};

// 消息API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  send: (data) => api.post('/messages', data),
  markRead: (messageId) => api.put(`/messages/${messageId}/read`),
  // 新增：创建新对话
  createConversation: (userId) => api.post('/messages/conversation', { userId }),
};

// 用户管理API（管理员）
export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  delete: (id) => api.delete(`/users/${id}`),
  // 搜索用户（用于新建对话）
  search: (keyword) => api.get('/users/search', { params: { keyword } }),
};

// 导出API
export const exportAPI = {
  exportBatch: (batchId) => {
    return api.get(`/export/batch/${batchId}`, { responseType: 'blob' });
  },
  exportBatches: (batchIds) => {
    return api.post('/export/batches', { batchIds }, { responseType: 'blob' });
  },
  exportAll: () => {
    return api.get('/export/all', { responseType: 'blob' });
  },
  exportAllBatches: () => {
    return api.get('/export/all-batches', { responseType: 'blob' });
  },
};

// 物流查询API
export const logisticsAPI = {
  // 查询单个订单物流
  query: (orderNumber) => api.get(`/logistics/${encodeURIComponent(orderNumber)}`),
  // 批量查询物流
  batchQuery: (orderIds) => api.post('/logistics/batch', { orderIds }),
  // 刷新订单物流
  refresh: (orderId) => api.post(`/logistics/refresh/${orderId}`),
  // 识别快递公司
  detectCourier: (orderNumber) => api.get(`/logistics/detect/${encodeURIComponent(orderNumber)}`),
};

export default api;
