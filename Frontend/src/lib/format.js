export const DISPLAY_DELIVERY_FEE = 30;
export const DISPLAY_FREE_DELIVERY_MIN = 200;

export function inr(value) {
  return `₹${Number(value || 0)}`;
}

export function firstName(name) {
  return String(name || 'there').trim().split(/\s+/)[0];
}

export function isPastCutoff(now = new Date()) {
  return now.getHours() >= 20;
}

export function harvestDateLabel(now = new Date()) {
  const date = new Date(now);
  date.setDate(date.getDate() + (isPastCutoff(now) ? 2 : 1));
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function deliverySlotLabel(now = new Date()) {
  return isPastCutoff(now) ? 'Day after tomorrow 7–10 AM' : 'Tomorrow 7–10 AM';
}

export function estimateDeliveryFee(subtotal) {
  return Number(subtotal || 0) >= DISPLAY_FREE_DELIVERY_MIN ? 0 : DISPLAY_DELIVERY_FEE;
}

export function formatAddress(address) {
  if (!address) return '';
  return [address.addressLine1, address.addressLine2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(', ');
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatClock(value) {
  if (!value) return '';
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatWeekdayDate(value = new Date()) {
  return new Date(value).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function categoryLabel(category) {
  if (category === 'fruits') return 'Fruit';
  if (category === 'vegetables') return 'Vegetable';
  return category || 'Produce';
}

export function itemSummary(items) {
  return (items || []).map((item) => `${item.name} ${item.quantity} ${item.unit}`).join(', ');
}
