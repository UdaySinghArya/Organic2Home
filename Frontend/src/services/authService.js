import { api } from '../lib/api.js';

export const authService = {
  requestCustomerOtp: (body) => api('/auth/otp/request', { method: 'POST', body }),
  resendCustomerOtp: (body) => api('/auth/otp/resend', { method: 'POST', body }),
  verifyCustomerOtp: (body) => api('/auth/otp/verify', { method: 'POST', body }),
  requestAdminOtp: (body) => api('/auth/admin/otp/request', { method: 'POST', body }),
  resendAdminOtp: (body) => api('/auth/admin/otp/resend', { method: 'POST', body }),
  verifyAdminOtp: (body) => api('/auth/admin/otp/verify', { method: 'POST', body }),
  me: () => api('/auth/me'),
  logout: () => api('/auth/logout', { method: 'POST' }),
};
