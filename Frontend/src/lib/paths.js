export const paths = {
  welcome: '/',
  login: '/login',
  register: '/register',
  otp: '/otp',
  home: '/home',
  product: (id) => `/products/${id}`,
  cart: '/cart',
  checkout: '/checkout',
  addressNew: '/addresses/new',
  addressEdit: (id) => `/addresses/${id}/edit`,
  orders: '/orders',
  order: (id) => `/orders/${id}`,
  payment: '/payment',
  paymentFailed: '/payment/failed',
  orderSuccess: '/orders/success',
  profile: '/profile',
  addresses: '/addresses',
  help: '/help',
  farmerLogin: '/farmer/login',
  farmerOtp: '/farmer/otp',
  farmerDashboard: '/farmer',
  farmerHarvest: '/farmer/harvest',
  farmerProducts: '/farmer/products',
  farmerProductNew: '/farmer/products/new',
  farmerProductEdit: (id) => `/farmer/products/${id}/edit`,
  farmerOrders: '/farmer/orders',
  farmerOrder: (id) => `/farmer/orders/${id}`,
  farmerProfile: '/farmer/profile',
};

const AUTH_PATHS = new Set([
  paths.welcome,
  paths.login,
  paths.register,
  paths.otp,
  paths.farmerLogin,
  paths.farmerOtp,
]);

function readInternalPath(from) {
  if (typeof from !== 'string') return '';
  const path = from.trim();
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '';
  return path;
}

export function customerReturnPath(from) {
  const path = readInternalPath(from);
  if (!path) return paths.home;
  const route = path.split('?')[0];
  if (route.startsWith('/farmer') || AUTH_PATHS.has(route)) return paths.home;
  return path;
}

export function farmerReturnPath(from) {
  const path = readInternalPath(from);
  if (!path) return paths.farmerDashboard;
  const route = path.split('?')[0];
  if (!route.startsWith('/farmer') || route === paths.farmerLogin || route === paths.farmerOtp) {
    return paths.farmerDashboard;
  }
  return path;
}
