import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'HARVESTING',
  'PACKED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

export const PAYMENT_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    label: String,
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    addressSnapshot: addressSnapshotSchema,
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'PENDING' },
    fulfillmentStatus: { type: String, enum: ORDER_STATUSES, default: 'PLACED' },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: 'PLACED', index: true },
    deliverySlot: { type: String, default: 'Tomorrow 7–10 AM' },
    paymentMethod: { type: String, enum: ['UPI', 'CARD', 'COD'], default: 'UPI' },
  },
  { timestamps: true },
);

export const Order = mongoose.model('Order', orderSchema);
