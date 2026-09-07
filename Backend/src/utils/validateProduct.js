import mongoose from 'mongoose';
import { createHttpError } from '../middleware/errorHandler.js';
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from '../models/Product.js';

export function assertProductId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, 'Invalid product id', 'INVALID_ID');
  }
  return id;
}

function readNonNegativeNumber(value, field, code) {
  if (value === undefined || value === null || value === '') {
    throw createHttpError(400, `${field} is required`, code);
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw createHttpError(400, `${field} must be a number`, code);
  }
  if (num < 0) {
    throw createHttpError(400, `${field} cannot be negative`, code);
  }
  return num;
}

export function readProductInput(body, { partial = false } = {}) {
  const data = {};

  if (!partial || body.name !== undefined) {
    const name = String(body.name || '').trim();
    if (!name) throw createHttpError(400, 'Product name is required', 'INVALID_NAME');
    data.name = name;
  }

  if (!partial || body.description !== undefined) {
    data.description = String(body.description || '').trim() || undefined;
  }

  if (!partial || body.category !== undefined) {
    const category = String(body.category || '').trim().toLowerCase();
    if (!PRODUCT_CATEGORIES.includes(category)) {
      throw createHttpError(400, 'Category must be vegetables or fruits', 'INVALID_CATEGORY');
    }
    data.category = category;
  }

  if (!partial || body.price !== undefined) {
    data.price = readNonNegativeNumber(body.price, 'Price', 'INVALID_PRICE');
  }

  if (!partial || body.unit !== undefined) {
    const unit = String(body.unit || 'kg').trim();
    if (!unit) throw createHttpError(400, 'Unit is required', 'INVALID_UNIT');
    data.unit = unit;
  }

  if (!partial || body.image !== undefined) {
    const image = String(body.image || '').trim();
    if (!image) throw createHttpError(400, 'Product image is required', 'INVALID_IMAGE');
    data.image = image;
  }

  if (!partial || body.stockQuantity !== undefined) {
    data.stockQuantity = readNonNegativeNumber(body.stockQuantity, 'Stock', 'INVALID_STOCK');
  }

  if (body.availability !== undefined) {
    data.availability = Boolean(body.availability);
  }

  if (body.status !== undefined) {
    const status = String(body.status || '').trim().toUpperCase();
    if (!PRODUCT_STATUSES.includes(status)) {
      throw createHttpError(400, 'Status must be ACTIVE, RESTING or OUT_OF_STOCK', 'INVALID_STATUS');
    }
    data.status = status;
  }

  if (body.farm !== undefined || body.farmName || body.field || body.location) {
    data.farm = {
      name: String(body.farm?.name || body.farmName || '').trim() || undefined,
      field: String(body.farm?.field || body.field || '').trim() || undefined,
      location: String(body.farm?.location || body.location || '').trim() || undefined,
    };
  }

  return data;
}

export function syncStockStatus(data, current = {}) {
  const stock = data.stockQuantity !== undefined ? data.stockQuantity : current.stockQuantity;
  const status = data.status || current.status || 'ACTIVE';

  if (status === 'RESTING') {
    data.status = 'RESTING';
    return data;
  }

  if (stock === 0) {
    data.status = 'OUT_OF_STOCK';
    data.availability = false;
  } else if (data.status === 'OUT_OF_STOCK' && stock > 0 && data.availability === undefined) {
    data.status = 'OUT_OF_STOCK';
  }

  return data;
}
