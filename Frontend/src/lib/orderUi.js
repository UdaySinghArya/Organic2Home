import { formatDate } from './format.js';

export const FULFILLMENT_STEPS = [
  { id: 'PLACED', label: 'Order Placed' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'HARVESTING', label: 'Harvesting' },
  { id: 'PACKED', label: 'Packed' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { id: 'DELIVERED', label: 'Delivered' },
];

export function orderTitle(items) {
  const names = [...new Set((items || []).map((item) => item.name).filter(Boolean))];
  if (names.length === 0) return 'Harvest crate';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} + ${names[1]}`;
  return `${names[0]} + ${names.length - 1} more`;
}

export function orderWhenLabel(order) {
  const status = order?.fulfillmentStatus || order?.orderStatus;
  if (status === 'DELIVERED') return `Delivered ${formatDate(order.updatedAt || order.createdAt)}`;
  if (status === 'CANCELLED' || order?.orderStatus === 'CANCELLED') return 'Cancelled';
  return order?.deliverySlot || formatDate(order?.createdAt);
}

export function paymentCopy(order) {
  if (!order) return '';
  if (order.paymentMethod === 'COD') return 'Pay on delivery';
  if (order.paymentStatus === 'SUCCESS') return `Paid via ${order.paymentMethod}`;
  if (order.paymentStatus === 'FAILED') return 'Payment failed';
  return 'Payment pending';
}

export function fulfillmentOf(order) {
  return order?.fulfillmentStatus || order?.orderStatus || 'PLACED';
}

export function stepIndex(status) {
  const index = FULFILLMENT_STEPS.findIndex((step) => step.id === status);
  return index < 0 ? 0 : index;
}
