import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { createHttpError } from '../middleware/errorHandler.js';
import {
  assertCanAdd,
  buildCartResponse,
  getOrCreateCart,
  readQuantity,
} from '../services/cart.service.js';

function assertProductId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, 'Invalid product id', 'INVALID_ID');
  }
}

async function respondCart(res, cart, status = 200) {
  res.status(status).json({
    success: true,
    data: { cart: await buildCartResponse(cart) },
  });
}

export async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    await respondCart(res, cart);
  } catch (err) {
    next(err);
  }
}

export async function addCartItem(req, res, next) {
  try {
    const productId = req.body.productId;
    assertProductId(productId);
    const addBy = readQuantity(req.body.quantity ?? 1);

    const product = await Product.findById(productId);
    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((item) => String(item.productId) === String(productId));
    const nextQty = (existing?.quantity || 0) + addBy;

    assertCanAdd(product, nextQty);

    if (existing) {
      existing.quantity = nextQty;
      existing.priceSnapshot = product.price;
    } else {
      cart.items.push({
        productId,
        quantity: addBy,
        priceSnapshot: product.price,
      });
    }

    await cart.save();
    await respondCart(res, cart);
  } catch (err) {
    next(err);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    assertProductId(req.params.productId);
    const quantity = readQuantity(req.body.quantity, { allowZero: true });
    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((item) => String(item.productId) === req.params.productId);

    if (!existing) {
      throw createHttpError(404, 'Item not found in cart', 'CART_ITEM_NOT_FOUND');
    }

    if (quantity === 0) {
      cart.items = cart.items.filter((item) => String(item.productId) !== req.params.productId);
      await cart.save();
      return respondCart(res, cart);
    }

    const product = await Product.findById(req.params.productId);
    assertCanAdd(product, quantity);
    existing.quantity = quantity;
    existing.priceSnapshot = product.price;
    await cart.save();
    await respondCart(res, cart);
  } catch (err) {
    next(err);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    assertProductId(req.params.productId);
    const cart = await getOrCreateCart(req.user._id);
    const before = cart.items.length;
    cart.items = cart.items.filter((item) => String(item.productId) !== req.params.productId);

    if (cart.items.length === before) {
      throw createHttpError(404, 'Item not found in cart', 'CART_ITEM_NOT_FOUND');
    }

    await cart.save();
    await respondCart(res, cart);
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    await respondCart(res, cart);
  } catch (err) {
    next(err);
  }
}
