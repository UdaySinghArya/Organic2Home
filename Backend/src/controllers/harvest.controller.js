import { Product } from '../models/Product.js';
import { publicHarvest, packHarvest, pickHarvest, syncTomorrowHarvest, tomorrowDate } from '../services/harvest.service.js';

async function withProducts(rows) {
  const products = await Product.find({ _id: { $in: rows.map((row) => row.productId) } });
  const byId = new Map(products.map((product) => [String(product._id), product]));
  return rows.map((row) => publicHarvest(row, byId.get(String(row.productId))));
}

export async function getTomorrowHarvest(req, res, next) {
  try {
    const rows = await syncTomorrowHarvest(req.user._id);
    const items = await withProducts(rows);
    const requiredQuantity = items.reduce((sum, item) => sum + item.requiredQuantity, 0);

    res.json({
      success: true,
      data: {
        date: tomorrowDate(),
        items,
        count: items.length,
        requiredQuantity,
        pendingCount: items.filter((item) => item.status === 'PENDING').length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function pickHarvestItem(req, res, next) {
  try {
    const harvest = await pickHarvest(req.user._id, req.params.id, req.body || {});
    const product = await Product.findById(harvest.productId);
    res.json({
      success: true,
      data: { harvest: publicHarvest(harvest, product) },
    });
  } catch (err) {
    next(err);
  }
}

export async function packHarvestItem(req, res, next) {
  try {
    const harvest = await packHarvest(req.user._id, req.params.id, req.body || {});
    const product = await Product.findById(harvest.productId);
    res.json({
      success: true,
      data: { harvest: publicHarvest(harvest, product) },
    });
  } catch (err) {
    next(err);
  }
}
