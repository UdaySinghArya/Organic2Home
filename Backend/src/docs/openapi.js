const error = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        code: { type: 'string' },
      },
    },
  },
};

const bearer = [{ bearerAuth: [] }];

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Organic2Home API',
    version: '1.0.0',
    description: 'Farm-fresh storefront API. Backend is the source of truth for price, stock, and totals.',
  },
  servers: [{ url: 'http://localhost:5000', description: 'Local' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Profile' },
    { name: 'Addresses' },
    { name: 'Products' },
    { name: 'Cart' },
    { name: 'Orders' },
    { name: 'Payments' },
    { name: 'Farmer Products' },
    { name: 'Farmer Harvest' },
    { name: 'Farmer Orders' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: { Error: error },
  },
  paths: {
    '/api/health': {
      get: { tags: ['Health'], summary: 'Health check', responses: { 200: { description: 'OK' } } },
    },
    '/api/docs': {
      get: { tags: ['Health'], summary: 'OpenAPI contract', responses: { 200: { description: 'OpenAPI JSON' } } },
    },
    '/api/auth/otp/request': {
      post: {
        tags: ['Auth'],
        summary: 'Customer OTP request',
        requestBody: { content: { 'application/json': { schema: { example: { phone: '9876543210', mode: 'login', name: 'Riya' } } } } },
        responses: { 200: { description: 'OTP sent (printed in terminal)' }, 400: { description: 'INVALID_PHONE' } },
      },
    },
    '/api/auth/otp/resend': {
      post: { tags: ['Auth'], summary: 'Customer OTP resend', responses: { 200: { description: 'OTP resent' } } },
    },
    '/api/auth/otp/verify': {
      post: {
        tags: ['Auth'],
        summary: 'Customer OTP verify',
        requestBody: { content: { 'application/json': { schema: { example: { phone: '9876543210', otp: '123456', mode: 'login' } } } } },
        responses: { 200: { description: 'JWT + user' }, 400: { description: 'INVALID_OTP' } },
      },
    },
    '/api/auth/admin/register': {
      post: {
        tags: ['Auth'],
        summary: 'Create admin (Postman)',
        requestBody: { content: { 'application/json': { schema: { example: { name: 'Harpreet', phone: '9000000001', farmName: 'Green Field' } } } } },
        responses: { 201: { description: 'Admin created' }, 409: { description: 'PHONE_TAKEN' } },
      },
    },
    '/api/auth/admin/otp/request': {
      post: { tags: ['Auth'], summary: 'Admin OTP request', responses: { 200: { description: 'OTP sent' }, 404: { description: 'ADMIN_NOT_FOUND' } } },
    },
    '/api/auth/admin/otp/resend': {
      post: { tags: ['Auth'], summary: 'Admin OTP resend', responses: { 200: { description: 'OTP resent' } } },
    },
    '/api/auth/admin/otp/verify': {
      post: { tags: ['Auth'], summary: 'Admin OTP verify', responses: { 200: { description: 'JWT + admin' } } },
    },
    '/api/auth/me': {
      get: { tags: ['Auth'], security: bearer, summary: 'Current session', responses: { 200: { description: 'User or admin' }, 401: { description: 'UNAUTHENTICATED' } } },
    },
    '/api/auth/logout': {
      post: { tags: ['Auth'], security: bearer, summary: 'Logout (client deletes token)', responses: { 200: { description: 'loggedOut' } } },
    },
    '/api/profile': {
      get: { tags: ['Profile'], security: bearer, summary: 'Customer profile', responses: { 200: { description: 'Profile' }, 403: { description: 'Admin forbidden' } } },
      put: { tags: ['Profile'], security: bearer, summary: 'Update name/email', responses: { 200: { description: 'Updated profile' } } },
    },
    '/api/addresses': {
      get: { tags: ['Addresses'], security: bearer, summary: 'List addresses', responses: { 200: { description: 'addresses + defaultAddress' } } },
      post: {
        tags: ['Addresses'],
        security: bearer,
        summary: 'Create address',
        requestBody: { content: { 'application/json': { schema: { example: { name: 'Riya', phone: '9876543210', addressLine1: '12 Green Lane', city: 'Gurugram', state: 'Haryana', pincode: '122101' } } } } },
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation' } },
      },
    },
    '/api/addresses/{id}': {
      get: { tags: ['Addresses'], security: bearer, summary: 'Get own address', responses: { 200: { description: 'Address' }, 404: { description: 'ADDRESS_NOT_FOUND' } } },
      put: { tags: ['Addresses'], security: bearer, summary: 'Update own address', responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Addresses'], security: bearer, summary: 'Delete own address', responses: { 200: { description: 'Deleted' } } },
    },
    '/api/categories': {
      get: { tags: ['Products'], summary: 'Categories', responses: { 200: { description: 'vegetables, fruits' } } },
    },
    '/api/products': {
      get: { tags: ['Products'], summary: 'Customer catalog', parameters: [{ name: 'category', in: 'query', schema: { type: 'string' } }, { name: 'availability', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Products (RESTING hidden)' } } },
    },
    '/api/products/{id}': {
      get: { tags: ['Products'], summary: 'Product detail', responses: { 200: { description: 'Product + inStock' }, 404: { description: 'PRODUCT_NOT_FOUND' } } },
    },
    '/api/farmer/products': {
      get: { tags: ['Farmer Products'], security: bearer, summary: 'Admin product list', responses: { 200: { description: 'Own products' }, 403: { description: 'Customer forbidden' } } },
      post: { tags: ['Farmer Products'], security: bearer, summary: 'Create product', responses: { 201: { description: 'Created' }, 400: { description: 'INVALID_PRICE / INVALID_STOCK' } } },
    },
    '/api/farmer/products/{id}': {
      get: { tags: ['Farmer Products'], security: bearer, summary: 'Get own product', responses: { 200: { description: 'Product' }, 404: { description: 'Not owned' } } },
      put: { tags: ['Farmer Products'], security: bearer, summary: 'Update product', responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Farmer Products'], security: bearer, summary: 'Delete product', responses: { 200: { description: 'Deleted' } } },
    },
    '/api/farmer/products/{id}/status': {
      patch: { tags: ['Farmer Products'], security: bearer, summary: 'ACTIVE | RESTING | OUT_OF_STOCK', responses: { 200: { description: 'Updated' } } },
    },
    '/api/cart': {
      get: { tags: ['Cart'], security: bearer, summary: 'Get cart (live prices)', responses: { 200: { description: 'items, itemCount, subtotal, total' } } },
      delete: { tags: ['Cart'], security: bearer, summary: 'Empty cart', responses: { 200: { description: 'Empty cart' } } },
    },
    '/api/cart/items': {
      post: { tags: ['Cart'], security: bearer, summary: 'Add item', requestBody: { content: { 'application/json': { schema: { example: { productId: 'id', quantity: 1 } } } } }, responses: { 200: { description: 'Cart' }, 400: { description: 'INSUFFICIENT_STOCK' } } },
    },
    '/api/cart/items/{productId}': {
      put: { tags: ['Cart'], security: bearer, summary: 'Set quantity (0 removes)', responses: { 200: { description: 'Cart' } } },
      delete: { tags: ['Cart'], security: bearer, summary: 'Remove item', responses: { 200: { description: 'Cart' } } },
    },
    '/api/orders': {
      get: { tags: ['Orders'], security: bearer, summary: 'Customer orders', responses: { 200: { description: 'Own orders only' } } },
      post: { tags: ['Orders'], security: bearer, summary: 'Place order from cart', requestBody: { content: { 'application/json': { schema: { example: { addressId: 'id', paymentMethod: 'UPI' } } } } }, responses: { 201: { description: 'Order PLACED, payment PENDING' }, 409: { description: 'INSUFFICIENT_STOCK' } } },
    },
    '/api/orders/{id}': {
      get: { tags: ['Orders'], security: bearer, summary: 'Customer order detail', responses: { 200: { description: 'Order' }, 404: { description: 'Not own order' } } },
    },
    '/api/payments/initiate': {
      post: { tags: ['Payments'], security: bearer, summary: 'Start payment (amount from order)', responses: { 201: { description: 'PENDING payment' } } },
    },
    '/api/payments/verify': {
      post: { tags: ['Payments'], security: bearer, summary: 'Server-side verify (signature required)', responses: { 200: { description: 'SUCCESS + CONFIRMED' }, 400: { description: 'INVALID_SIGNATURE / AMOUNT_MISMATCH / VERIFY_REQUIRED' } } },
    },
    '/api/payments/dev/confirm': {
      post: { tags: ['Payments'], security: bearer, summary: 'Dev provider only: server signs and verifies', responses: { 200: { description: 'SUCCESS' }, 400: { description: 'NOT_DEV_PROVIDER' } } },
    },
    '/api/payments/cancel': {
      post: { tags: ['Payments'], security: bearer, summary: 'Cancel payment', responses: { 200: { description: 'FAILED' } } },
    },
    '/api/payments/timeout': {
      post: { tags: ['Payments'], security: bearer, summary: 'Timeout payment', responses: { 200: { description: 'FAILED' } } },
    },
    '/api/payments/cod': {
      post: { tags: ['Payments'], security: bearer, summary: 'Switch unpaid order to cash on delivery', responses: { 200: { description: 'COD PENDING, not marked paid' }, 409: { description: 'ALREADY_PAID' } } },
    },
    '/api/payments/order/{orderId}': {
      get: { tags: ['Payments'], security: bearer, summary: 'Payment for order', responses: { 200: { description: 'Payment' } } },
    },
    '/api/payments/webhook': {
      post: { tags: ['Payments'], summary: 'Signed webhook', responses: { 200: { description: 'Applied' }, 400: { description: 'INVALID_SIGNATURE' } } },
    },
    '/api/farmer/harvest/tomorrow': {
      get: { tags: ['Farmer Harvest'], security: bearer, summary: 'Tomorrow harvest from real orders', responses: { 200: { description: 'required/picked/packed/remaining' } } },
    },
    '/api/farmer/harvest/{id}/pick': {
      patch: { tags: ['Farmer Harvest'], security: bearer, summary: 'Mark picked', responses: { 200: { description: 'PICKED' }, 409: { description: 'INVALID_TRANSITION' } } },
    },
    '/api/farmer/harvest/{id}/pack': {
      patch: { tags: ['Farmer Harvest'], security: bearer, summary: 'Mark packed', responses: { 200: { description: 'PACKED' }, 409: { description: 'Pick first' } } },
    },
    '/api/farmer/orders': {
      get: { tags: ['Farmer Orders'], security: bearer, summary: 'Orders containing admin products', responses: { 200: { description: 'Farmer orders' }, 403: { description: 'Customer forbidden' } } },
    },
    '/api/farmer/orders/{id}': {
      get: { tags: ['Farmer Orders'], security: bearer, summary: 'Farmer order detail', responses: { 200: { description: 'Order' }, 404: { description: 'Unrelated order' } } },
    },
    '/api/farmer/orders/{id}/status': {
      patch: {
        tags: ['Farmer Orders'],
        security: bearer,
        summary: 'Valid fulfillment transition',
        requestBody: { content: { 'application/json': { schema: { example: { status: 'OUT_FOR_DELIVERY' } } } } },
        responses: { 200: { description: 'Updated' }, 409: { description: 'INVALID_TRANSITION' } },
      },
    },
  },
};
