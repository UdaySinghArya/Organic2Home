import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { createCustomerOrder } from '../services/order.service.js';
import { publicOrder } from '../utils/publicOrder.js';

export async function createOrder(req, res, next) {
  try {
    const order = await createCustomerOrder(req.user, req.body || {});
    res.status(201).json({
      success: true,
      data: { order: publicOrder(order) },
    });
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
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

export async function getOrder(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw createHttpError(400, 'Invalid order id', 'INVALID_ID');
    }

    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
    if (!order) {
      throw createHttpError(404, 'Order not found', 'ORDER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: { order: publicOrder(order) },
    });
  } catch (err) {
    next(err);
  }
}
