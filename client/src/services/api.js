import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export const checklistAPI = {
  getAll: () => api.get('/checklists'),
  getOne: (id) => api.get(`/checklists/${id}`),
  create: (data) => api.post('/checklists', data),
  update: (id, data) => api.put(`/checklists/${id}`, data),
  delete: (id) => api.delete(`/checklists/${id}`),
  addItem: (id, data) => api.post(`/checklists/${id}/items`, data),
  updateItem: (id, itemId, data) => api.put(`/checklists/${id}/items/${itemId}`, data),
  deleteItem: (id, itemId) => api.delete(`/checklists/${id}/items/${itemId}`),
  toggleItem: (id, itemId) => api.patch(`/checklists/${id}/items/${itemId}/toggle`),
}

export default api
