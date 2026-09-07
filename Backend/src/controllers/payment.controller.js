import { publicOrder } from '../utils/publicOrder.js';
import {
  cancelPayment,
  confirmDevPayment,
  getPaymentForOrder,
  handleWebhook,
  initiatePayment,
  publicPayment,
  switchToCod,
  timeoutPayment,
  verifyPayment,
} from '../services/payment.service.js';

export async function initiate(req, res, next) {
  try {
    const result = await initiatePayment(req.user, req.body.orderId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function verify(req, res, next) {
  try {
    const result = await verifyPayment(req.user, req.body || {});
    res.json({
      success: true,
      data: {
        payment: publicPayment(result.payment),
        order: publicOrder(result.order),
        duplicate: result.duplicate,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req, res, next) {
  try {
    const result = await cancelPayment(req.user, req.body.orderId);
    res.json({
      success: true,
      data: {
        payment: publicPayment(result.payment),
        order: publicOrder(result.order),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function timeout(req, res, next) {
  try {
    const result = await timeoutPayment(req.user, req.body.orderId);
    res.json({
      success: true,
      data: {
        payment: publicPayment(result.payment),
        order: publicOrder(result.order),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function payWithCod(req, res, next) {
  try {
    const result = await switchToCod(req.user, req.body.orderId);
    res.json({
      success: true,
      data: {
        payment: publicPayment(result.payment),
        order: publicOrder(result.order),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function confirmDev(req, res, next) {
  try {
    const result = await confirmDevPayment(req.user, req.body.orderId);
    res.json({
      success: true,
      data: {
        payment: publicPayment(result.payment),
        order: publicOrder(result.order),
        duplicate: result.duplicate,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getByOrder(req, res, next) {
  try {
    const result = await getPaymentForOrder(req.user, req.params.orderId);
    res.json({
      success: true,
      data: {
        payment: publicPayment(result.payment),
        order: publicOrder(result.order),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function webhook(req, res, next) {
  try {
    const result = await handleWebhook(req.headers, req.body || {});
    res.json({
      success: true,
      data: {
        payment: publicPayment(result.payment),
        duplicate: result.duplicate || false,
      },
    });
  } catch (err) {
    next(err);
  }
}
