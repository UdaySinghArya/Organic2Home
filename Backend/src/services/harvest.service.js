import { Harvest } from '../models/Harvest.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { publicProduct } from '../utils/publicProduct.js';

export function tomorrowDate(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

function deriveStatus(required, picked, packed) {
  if (required > 0 && packed >= required) return 'PACKED';
  if (required > 0 && picked >= required) return 'PICKED';
  return 'PENDING';
}

export function publicHarvest(row, product) {
  const remainingQuantity = Math.max(0, row.requiredQuantity - row.packedQuantity);
  return {
    id: String(row._id),
    date: row.date,
    product: product ? publicProduct(product, { farmerView: true }) : { id: String(row.productId) },
    requiredQuantity: row.requiredQuantity,
    pickedQuantity: row.pickedQuantity,
    packedQuantity: row.packedQuantity,
    remainingQuantity,
    relatedOrderCount: row.relatedOrderCount,
    status: row.status,
  };
}

export async function syncTomorrowHarvest(adminId, now = new Date()) {
  const date = tomorrowDate(now);
  const products = await Product.find({ farmerId: adminId }).select('_id');
  const productIds = products.map((item) => item._id);

  const orders = await Order.find({
    orderStatus: { $ne: 'CANCELLED' },
    $or: [{ paymentStatus: 'SUCCESS' }, { paymentMethod: 'COD' }],
    'items.productId': { $in: productIds },
  });

  const byProduct = new Map();
  for (const order of orders) {
    for (const item of order.items) {
      const key = String(item.productId);
      if (!productIds.some((id) => String(id) === key)) continue;
      const current = byProduct.get(key) || { requiredQuantity: 0, orderIds: new Set() };
      current.requiredQuantity += item.quantity;
      current.orderIds.add(String(order._id));
      byProduct.set(key, current);
    }
  }

  const rows = [];
  for (const product of products) {
    const stats = byProduct.get(String(product._id)) || { requiredQuantity: 0, orderIds: new Set() };
    const existing = await Harvest.findOne({ productId: product._id, date });
    const pickedQuantity = existing?.pickedQuantity || 0;
    const packedQuantity = existing?.packedQuantity || 0;
    const status = deriveStatus(stats.requiredQuantity, pickedQuantity, packedQuantity);

    const row = await Harvest.findOneAndUpdate(
      { productId: product._id, date },
      {
        $set: {
          farmerId: adminId,
          requiredQuantity: stats.requiredQuantity,
          relatedOrderCount: stats.orderIds.size,
          pickedQuantity,
          packedQuantity,
          status,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    rows.push(row);
  }

  return rows.filter((row) => row.requiredQuantity > 0);
}

async function loadOwnedHarvest(adminId, id) {
  const harvest = await Harvest.findOne({ _id: id, farmerId: adminId });
  if (!harvest) {
    throw createHttpError(404, 'Harvest item not found', 'HARVEST_NOT_FOUND');
  }
  return harvest;
}

function readQty(body, fallback) {
  if (body.quantity === undefined) return fallback;
  const quantity = Number(body.quantity);
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw createHttpError(400, 'Quantity cannot be negative', 'INVALID_QUANTITY');
  }
  return quantity;
}

export async function pickHarvest(adminId, id, body = {}) {
  const harvest = await loadOwnedHarvest(adminId, id);
  if (harvest.status === 'PACKED') {
    throw createHttpError(409, 'Already packed. Cannot pick again.', 'INVALID_TRANSITION');
  }
  if (harvest.requiredQuantity <= 0) {
    throw createHttpError(400, 'Nothing to pick for this product', 'NOTHING_TO_PICK');
  }

  const nextPicked = Math.min(readQty(body, harvest.requiredQuantity), harvest.requiredQuantity);
  harvest.pickedQuantity = nextPicked;
  harvest.status = deriveStatus(harvest.requiredQuantity, harvest.pickedQuantity, harvest.packedQuantity);
  await harvest.save();

  await Order.updateMany(
    {
      orderStatus: { $in: ['PLACED', 'CONFIRMED'] },
      'items.productId': harvest.productId,
    },
    { $set: { orderStatus: 'HARVESTING', fulfillmentStatus: 'HARVESTING' } },
  );

  return harvest;
}

export async function packHarvest(adminId, id, body = {}) {
  const harvest = await loadOwnedHarvest(adminId, id);
  if (harvest.status === 'PENDING' || harvest.pickedQuantity <= 0) {
    throw createHttpError(409, 'Pick the harvest before packing', 'INVALID_TRANSITION');
  }
  if (harvest.status === 'PACKED' && harvest.packedQuantity >= harvest.requiredQuantity) {
    throw createHttpError(409, 'Already packed', 'INVALID_TRANSITION');
  }

  const nextPacked = Math.min(
    readQty(body, harvest.pickedQuantity),
    harvest.pickedQuantity,
    harvest.requiredQuantity,
  );
  harvest.packedQuantity = nextPacked;
  harvest.status = deriveStatus(harvest.requiredQuantity, harvest.pickedQuantity, harvest.packedQuantity);
  await harvest.save();
  return harvest;
}
