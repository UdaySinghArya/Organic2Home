export function calculateDeliveryFee(subtotal) {
  const fee = Number(process.env.DELIVERY_FEE || 30);
  const freeAbove = Number(process.env.FREE_DELIVERY_MIN || 200);
  if (subtotal >= freeAbove) return 0;
  return fee;
}

export function deliverySlot(now = new Date()) {
  return now.getHours() >= 20 ? 'Day after tomorrow 7–10 AM' : 'Tomorrow 7–10 AM';
}
