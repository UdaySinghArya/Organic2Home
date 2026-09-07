export function publicOrder(order) {
  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    items: order.items.map((item) => ({
      productId: String(item.productId),
      name: item.name,
      price: item.price,
      unit: item.unit,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    })),
    address: order.addressSnapshot || null,
    addressId: order.addressId ? String(order.addressId) : null,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    total: order.total,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    orderStatus: order.orderStatus,
    deliverySlot: order.deliverySlot,
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
