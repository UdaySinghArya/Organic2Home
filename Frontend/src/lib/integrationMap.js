import { paths } from './paths.js';

export const frontendAudit = {
  framework: 'React 19 + Vite',
  routing: 'react-router-dom',
  state: 'AuthProvider + React state/hooks (no Redux)',
  styling: 'Tailwind v4 with Stitch tokens in src/index.css',
  fonts: 'Plus Jakarta Sans + Material Symbols Outlined',
  apiClient: 'src/lib/api.js → Vite proxy /api → http://localhost:5000',
  auth: 'JWT in localStorage, restored via GET /api/auth/me',
  stitch: '_stitch_refs/**/screen.png is visual source of truth; code.html is not a route',
};

export const integrationMap = [
  { screen: 'welcome_to_khetse', route: paths.welcome, hook: 'useAuth', api: [] },
  { screen: 'login_khetse', route: paths.login, hook: 'useAuth.requestCustomerOtp', api: ['POST /api/auth/otp/request'] },
  { screen: 'register_khetse', route: paths.register, hook: 'useAuth.requestCustomerOtp', api: ['POST /api/auth/otp/request'] },
  { screen: 'otp_verification_khetse', route: paths.otp, hook: 'useAuth.verifyCustomerOtp', api: ['POST /api/auth/otp/verify', 'POST /api/auth/otp/resend'] },
  { screen: 'customer_home_khetse', route: paths.home, hook: 'useProducts + useCart', api: ['GET /api/products', 'GET /api/categories', 'GET /api/cart'] },
  { screen: 'product_detail_*', route: paths.product(':id'), hook: 'useProduct', api: ['GET /api/products/:id', 'POST /api/cart/items'] },
  { screen: 'your_cart_khetse / empty_cart_khetse', route: paths.cart, hook: 'useCart', api: ['GET /api/cart', 'PUT|DELETE /api/cart/items/:productId'] },
  { screen: 'add_address_khetse', route: paths.addressNew, hook: 'useAddresses', api: ['POST /api/addresses'] },
  { screen: 'place_order_khetse', route: paths.checkout, hook: 'useCheckout', api: ['GET /api/addresses', 'POST /api/orders'] },
  { screen: 'payment_* / order_success_*', route: paths.payment, hook: 'usePayment', api: ['POST /api/payments/initiate', 'POST /api/payments/dev/confirm', 'POST /api/payments/cancel', 'POST /api/payments/timeout', 'POST /api/payments/cod'] },
  { screen: 'your_orders_khetse / order_detail_*', route: paths.orders, hook: 'useOrders', api: ['GET /api/orders', 'GET /api/orders/:id'] },
  { screen: 'profile_khetse / saved_addresses / help', route: paths.profile, hook: 'useProfile', api: ['GET|PUT /api/profile', 'GET /api/addresses', 'GET /api/orders'] },
  { screen: 'farmer_login_khetse', route: paths.farmerLogin, hook: 'useAuth.requestAdminOtp', api: ['POST /api/auth/admin/otp/request'] },
  { screen: 'farmer_admin_dashboard / pick_for_tomorrow', route: paths.farmerDashboard, hook: 'useHarvest', api: ['GET /api/farmer/harvest/tomorrow', 'PATCH /api/farmer/harvest/:id/pick', 'PATCH /api/farmer/harvest/:id/pack'] },
  { screen: 'products_khetse_farmer / add_or_edit_product', route: paths.farmerProducts, hook: 'useFarmerProducts', api: ['GET|POST|PUT /api/farmer/products', 'PATCH /api/farmer/products/:id/status'] },
  { screen: 'orders_khetse_farmer / order_detail_farmer', route: paths.farmerOrders, hook: 'useFarmerOrders', api: ['GET /api/farmer/orders', 'GET /api/farmer/orders/:id', 'PATCH /api/farmer/orders/:id/status'] },
  { screen: 'farmer_profile_logout', route: paths.farmerProfile, hook: 'useAuth.logout', api: ['GET /api/auth/me', 'POST /api/auth/logout'] },
];
