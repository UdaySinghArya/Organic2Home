import { api } from '../lib/api.js';

export const farmerService = {
  listProducts: () => api('/farmer/products'),
  createProduct: (body) => api('/farmer/products', { method: 'POST', body }),
  getProduct: (id) => api(`/farmer/products/${id}`),
  updateProduct: (id, body) => api(`/farmer/products/${id}`, { method: 'PUT', body }),
  patchProductStatus: (id, body) => api(`/farmer/products/${id}/status`, { method: 'PATCH', body }),
  deleteProduct: (id) => api(`/farmer/products/${id}`, { method: 'DELETE' }),
  getTomorrowHarvest: () => api('/farmer/harvest/tomorrow'),
  pickHarvest: (id, body) => api(`/farmer/harvest/${id}/pick`, { method: 'PATCH', body }),
  packHarvest: (id, body) => api(`/farmer/harvest/${id}/pack`, { method: 'PATCH', body }),
  listOrders: () => api('/farmer/orders'),
  getOrder: (id) => api(`/farmer/orders/${id}`),
  patchOrderStatus: (id, body) => api(`/farmer/orders/${id}/status`, { method: 'PATCH', body }),
};
