import { Order, ORDER_STATUSES } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { createHttpError } from '../middleware/errorHandler.js';

const TRANSITIONS = {
  PLACED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['HARVESTING', 'CANCELLED'],
  HARVESTING: ['PACKED', 'CANCELLED'],
  PACKED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export async function farmerProductIds(adminId) {
  const products = await Product.find({ farmerId: adminId }).select('_id');
  return products.map((product) => product._id);
}

export async function findFarmerOrders(adminId) {
  const productIds = await farmerProductIds(adminId);
  if (productIds.length === 0) return [];
  return Order.find({ 'items.productId': { $in: productIds } }).sort({ createdAt: -1 });
}

export async function findFarmerOrder(adminId, orderId) {
  const productIds = await farmerProductIds(adminId);
  const order = await Order.findOne({
    _id: orderId,
    'items.productId': { $in: productIds },
  });
  if (!order) {
    throw createHttpError(404, 'Order not found', 'ORDER_NOT_FOUND');
  }
  return order;
}

export function assertTransition(from, to) {
  if (!ORDER_STATUSES.includes(to)) {
    throw createHttpError(400, 'Invalid fulfillment status', 'INVALID_STATUS');
  }
  if (!(TRANSITIONS[from] || []).includes(to)) {
    throw createHttpError(409, `Cannot move order from ${from} to ${to}`, 'INVALID_TRANSITION');
  }
}

export async function transitionFarmerOrder(adminId, orderId, status) {
  const order = await findFarmerOrder(adminId, orderId);
  assertTransition(order.orderStatus, status);
  order.orderStatus = status;
  order.fulfillmentStatus = status;
  await order.save();
  return order;
}
