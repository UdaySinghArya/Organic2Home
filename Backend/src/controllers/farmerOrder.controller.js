import mongoose from 'mongoose';
import { createHttpError } from '../middleware/errorHandler.js';
import { findFarmerOrder, findFarmerOrders, transitionFarmerOrder } from '../services/farmerOrder.service.js';
import { publicOrder } from '../utils/publicOrder.js';

export async function listFarmerOrders(req, res, next) {
  try {
    const orders = await findFarmerOrders(req.user._id);
    res.json({
      success: true,
      data: {
        orders: orders.map(publicOrder),
        count: orders.length,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getFarmerOrder(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw createHttpError(400, 'Invalid order id', 'INVALID_ID');
    }
    const order = await findFarmerOrder(req.user._id, req.params.id);
    res.json({
      success: true,
      data: { order: publicOrder(order) },
    });
  } catch (err) {
    next(err);
  }
}

export async function patchFarmerOrderStatus(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw createHttpError(400, 'Invalid order id', 'INVALID_ID');
    }
    const status = String(req.body.status || '').trim().toUpperCase();
    const order = await transitionFarmerOrder(req.user._id, req.params.id, status);
    res.json({
      success: true,
      data: { order: publicOrder(order) },
    });
  } catch (err) {
    next(err);
  }
}
