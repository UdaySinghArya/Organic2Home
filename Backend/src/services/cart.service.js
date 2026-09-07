import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { isPurchasable } from '../utils/productAvailability.js';
import { publicProduct } from '../utils/publicProduct.js';

export async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

export async function buildCartResponse(cart) {
  const productIds = cart.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const byId = new Map(products.map((product) => [String(product._id), product]));

  const items = [];
  let subtotal = 0;
  let itemCount = 0;

  for (const item of cart.items) {
    const product = byId.get(String(item.productId));
    const unitPrice = product ? product.price : item.priceSnapshot;
    const available = isPurchasable(product);
    const lineSubtotal = available ? unitPrice * item.quantity : 0;

    if (available) {
      subtotal += lineSubtotal;
      itemCount += item.quantity;
    }

    items.push({
      productId: String(item.productId),
      quantity: item.quantity,
      unitPrice,
      priceSnapshot: item.priceSnapshot,
      priceChanged: Boolean(product && product.price !== item.priceSnapshot),
      subtotal: available ? lineSubtotal : 0,
      available,
      unavailableReason: available
        ? null
        : !product
          ? 'PRODUCT_NOT_FOUND'
          : product.status === 'RESTING'
            ? 'UNAVAILABLE'
            : 'OUT_OF_STOCK',
      product: product ? publicProduct(product) : null,
    });
  }

  return {
    id: String(cart._id),
    items,
    itemCount,
    subtotal,
    total: subtotal,
  };
}

export function readQuantity(value, { allowZero = false } = {}) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 0 || (!allowZero && quantity < 1)) {
    throw createHttpError(400, 'Quantity must be a positive whole number', 'INVALID_QUANTITY');
  }
  return quantity;
}

export function assertCanAdd(product, quantity) {
  if (!product || !isPurchasable(product)) {
    throw createHttpError(400, 'This product is not available', 'PRODUCT_UNAVAILABLE');
  }
  if (quantity > product.stockQuantity) {
    throw createHttpError(400, 'Quantity exceeds available stock', 'INSUFFICIENT_STOCK');
  }
}
