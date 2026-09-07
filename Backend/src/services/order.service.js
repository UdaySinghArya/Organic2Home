import { Address } from '../models/Address.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { nextSequence } from '../models/Counter.js';
import { calculateDeliveryFee, deliverySlot } from '../config/pricing.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { isPurchasable } from '../utils/productAvailability.js';
import { publicAddress } from '../utils/public.js';

const PAYMENT_METHODS = ['UPI', 'CARD', 'COD'];

async function loadOwnedAddress(userId, addressId) {
  const query = addressId ? { _id: addressId, userId } : { userId, isDefault: true };
  const address = await Address.findOne(query);
  if (!address) {
    throw createHttpError(400, 'Please select a valid delivery address', 'INVALID_ADDRESS');
  }
  return address;
}

async function reserveStock(items) {
  const reserved = [];

  try {
    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          status: 'ACTIVE',
          availability: true,
          stockQuantity: { $gte: item.quantity },
        },
        { $inc: { stockQuantity: -item.quantity } },
        { returnDocument: 'after' },
      );

      if (!updated) {
        throw createHttpError(409, 'Not enough stock for one or more items', 'INSUFFICIENT_STOCK');
      }

      if (updated.stockQuantity === 0) {
        updated.status = 'OUT_OF_STOCK';
        updated.availability = false;
        await updated.save();
      }

      reserved.push({ productId: item.productId, quantity: item.quantity });
    }
  } catch (err) {
    await releaseStock(reserved);
    throw err;
  }

  return reserved;
}

async function releaseStock(reserved) {
  for (const item of reserved) {
    const product = await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stockQuantity: item.quantity } },
      { returnDocument: 'after' },
    );
    if (product && product.stockQuantity > 0 && product.status === 'OUT_OF_STOCK') {
      product.status = 'ACTIVE';
      product.availability = true;
      await product.save();
    }
  }
}

export async function createCustomerOrder(user, body) {
  const address = await loadOwnedAddress(user._id, body.addressId);
  const cart = await Cart.findOne({ userId: user._id });
  if (!cart || cart.items.length === 0) {
    throw createHttpError(400, 'Your cart is empty', 'CART_EMPTY');
  }

  const products = await Product.find({ _id: { $in: cart.items.map((item) => item.productId) } });
  const byId = new Map(products.map((product) => [String(product._id), product]));
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = byId.get(String(item.productId));
    if (!isPurchasable(product) || product.stockQuantity < item.quantity) {
      throw createHttpError(400, 'A cart item is unavailable or out of stock', 'CART_ITEM_UNAVAILABLE');
    }

    orderItems.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: item.quantity,
    });
    subtotal += product.price * item.quantity;
  }

  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;
  const paymentMethod = PAYMENT_METHODS.includes(body.paymentMethod) ? body.paymentMethod : 'UPI';
  const snapshot = publicAddress(address);
  delete snapshot.id;
  delete snapshot.isDefault;
  delete snapshot.createdAt;
  delete snapshot.updatedAt;

  const reserved = await reserveStock(orderItems);

  try {
    const seq = await nextSequence('order');
    const order = await Order.create({
      orderNumber: `O2H-${String(seq).padStart(3, '0')}`,
      userId: user._id,
      addressId: address._id,
      addressSnapshot: snapshot,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentStatus: 'PENDING',
      fulfillmentStatus: 'PLACED',
      orderStatus: 'PLACED',
      deliverySlot: deliverySlot(),
      paymentMethod,
    });

    cart.items = [];
    await cart.save();
    return order;
  } catch (err) {
    await releaseStock(reserved);
    throw err;
  }
}
