export const NEXT_ORDER_STATUS = {
  PLACED: 'CONFIRMED',
  CONFIRMED: 'HARVESTING',
  HARVESTING: 'PACKED',
  PACKED: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
};

const NEXT_ACTION_LABEL = {
  PLACED: 'Confirm order',
  CONFIRMED: 'Start harvesting',
  HARVESTING: 'Mark packed',
  PACKED: 'Out for delivery',
  OUT_FOR_DELIVERY: 'Mark Delivered',
};

const NEXT_ACTION_ICON = {
  PLACED: 'check',
  CONFIRMED: 'agriculture',
  HARVESTING: 'inventory_2',
  PACKED: 'local_shipping',
  OUT_FOR_DELIVERY: 'done_all',
};

export function nextOrderStatus(status) {
  return NEXT_ORDER_STATUS[status] || null;
}

export function nextOrderAction(status) {
  const next = nextOrderStatus(status);
  if (!next) return null;
  return {
    status: next,
    label: NEXT_ACTION_LABEL[status],
    icon: NEXT_ACTION_ICON[status] || 'arrow_forward',
  };
}

export function qtyLabel(quantity, unit = 'kg') {
  return `${Number(quantity || 0)} ${unit}`;
}

export function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'KS';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function customerOf(order) {
  return {
    name: order?.address?.name || 'Customer',
    phone: order?.address?.phone || '',
  };
}

export function harvestHint(status) {
  if (status === 'PACKED') return 'Packed for dawn dispatch';
  if (status === 'PICKED') return 'Picked — pack into crates';
  return 'Ready to pick & weigh';
}

export function harvestAction(status) {
  if (status === 'PACKED') return { kind: 'done', label: 'Packed', icon: 'task_alt' };
  if (status === 'PICKED') return { kind: 'pack', label: 'Mark packed', icon: 'check_circle' };
  return { kind: 'pick', label: 'Mark picked', icon: 'agriculture' };
}

export function farmNameOf(user) {
  return user?.farmProfile?.farmName || user?.name || 'Organic2Home Farmer';
}

export function farmPlaceOf(user) {
  return user?.farmProfile?.village || user?.farmProfile?.location || user?.farmProfile?.plot || '';
}

export function dispatchCounts(orders) {
  const rows = orders || [];
  return {
    field: rows.filter((order) => ['PLACED', 'CONFIRMED', 'HARVESTING'].includes(order.orderStatus)).length,
    transit: rows.filter((order) => ['PACKED', 'OUT_FOR_DELIVERY'].includes(order.orderStatus)).length,
    done: rows.filter((order) => order.orderStatus === 'DELIVERED').length,
  };
}

export function farmerSection(pathname) {
  if (pathname.startsWith('/farmer/products')) return 'Products';
  if (pathname.startsWith('/farmer/orders')) return 'Orders';
  if (pathname.startsWith('/farmer/profile')) return 'Profile';
  return 'Harvest';
}

export const UNITS = ['kg', 'dozen', 'bundle'];
export const CATEGORIES = [
  { id: 'vegetables', label: 'Vegetables', icon: 'psychiatry' },
  { id: 'fruits', label: 'Fruits', icon: 'nutrition' },
];
