import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { getPaymentProvider } from '../payments/getProvider.js';

function safeVerify(provider, payload) {
  try {
    return provider.verifySignature(payload);
  } catch {
    return false;
  }
}

export function publicPayment(payment) {
  return {
    id: String(payment._id),
    orderId: String(payment.orderId),
    provider: payment.provider,
    referenceId: payment.referenceId || null,
    amount: payment.amount,
    status: payment.status,
    failureReason: payment.failureReason || null,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

async function loadOwnedOrder(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    throw createHttpError(404, 'Order not found', 'ORDER_NOT_FOUND');
  }
  return order;
}

export async function initiatePayment(user, orderId) {
  const order = await loadOwnedOrder(user._id, orderId);

  if (order.paymentStatus === 'SUCCESS') {
    throw createHttpError(409, 'This order is already paid', 'ALREADY_PAID');
  }

  if (order.paymentMethod === 'COD') {
    const payment = await Payment.findOneAndUpdate(
      { orderId: order._id, provider: 'cod' },
      {
        $setOnInsert: {
          orderId: order._id,
          provider: 'cod',
          amount: order.total,
          status: 'PENDING',
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    return {
      payment: publicPayment(payment),
      checkout: {
        method: 'COD',
        amount: order.total,
        message: 'Pay when produce reaches your door',
      },
    };
  }

  const provider = getPaymentProvider();
  const checkout = await provider.createPayment(order);

  const payment = await Payment.create({
    orderId: order._id,
    provider: checkout.provider,
    referenceId: checkout.providerOrderId,
    amount: order.total,
    status: 'PENDING',
  });

  order.paymentStatus = 'PENDING';
  await order.save();

  return {
    payment: publicPayment(payment),
    checkout: {
      ...checkout,
      amount: order.total,
    },
  };
}

async function applySuccess(order, payment, referenceId) {
  if (payment.status === 'SUCCESS') {
    return { payment, order, duplicate: true };
  }

  const locked = await Payment.findOneAndUpdate(
    { _id: payment._id, status: { $in: ['PENDING', 'FAILED'] } },
    { $set: { status: 'SUCCESS', referenceId, failureReason: null } },
    { returnDocument: 'after' },
  );

  if (!locked) {
    const current = await Payment.findById(payment._id);
    return { payment: current, order, duplicate: current.status === 'SUCCESS' };
  }

  order.paymentStatus = 'SUCCESS';
  if (order.orderStatus === 'PLACED') {
    order.orderStatus = 'CONFIRMED';
    order.fulfillmentStatus = 'CONFIRMED';
  }
  await order.save();
  return { payment: locked, order, duplicate: false };
}

async function applyFailure(order, payment, reason) {
  payment.status = 'FAILED';
  payment.failureReason = reason;
  await payment.save();
  order.paymentStatus = 'FAILED';
  await order.save();
  return { payment, order };
}

export async function verifyPayment(user, body) {
  const order = await loadOwnedOrder(user._id, body.orderId);
  const payment = await Payment.findOne({ orderId: order._id }).sort({ createdAt: -1 });
  if (!payment) {
    throw createHttpError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
  }

  if (body.success === true && !body.signature) {
    throw createHttpError(400, 'Frontend success is not enough. Server verification required.', 'VERIFY_REQUIRED');
  }

  if (order.paymentMethod === 'COD') {
    throw createHttpError(400, 'COD orders are collected on delivery', 'COD_NOT_VERIFIABLE');
  }

  const claimedAmount = body.amount !== undefined ? Number(body.amount) : payment.amount;
  if (claimedAmount !== order.total || payment.amount !== order.total) {
    await applyFailure(order, payment, 'Payment amount does not match the order');
    throw createHttpError(400, 'Payment amount does not match the order', 'AMOUNT_MISMATCH');
  }

  const provider = getPaymentProvider();
  const providerOrderId = body.providerOrderId || payment.referenceId;
  const referenceId = body.referenceId || body.paymentId;
  const valid = safeVerify(provider, {
    providerOrderId,
    referenceId,
    signature: body.signature,
    amount: order.total,
  });

  if (!valid) {
    await applyFailure(order, payment, 'Invalid payment signature');
    throw createHttpError(400, 'Invalid payment signature', 'INVALID_SIGNATURE');
  }

  return applySuccess(order, payment, referenceId);
}

export async function cancelPayment(user, orderId) {
  const order = await loadOwnedOrder(user._id, orderId);
  const payment = await Payment.findOne({ orderId: order._id }).sort({ createdAt: -1 });
  if (!payment) {
    throw createHttpError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
  }
  if (payment.status === 'SUCCESS') {
    throw createHttpError(409, 'Paid orders cannot be cancelled here', 'ALREADY_PAID');
  }
  return applyFailure(order, payment, 'Payment cancelled');
}

export async function timeoutPayment(user, orderId) {
  const order = await loadOwnedOrder(user._id, orderId);
  const payment = await Payment.findOne({ orderId: order._id, status: 'PENDING' }).sort({ createdAt: -1 });
  if (!payment) {
    throw createHttpError(404, 'No pending payment', 'PAYMENT_NOT_FOUND');
  }
  return applyFailure(order, payment, 'Payment timed out');
}

export async function switchToCod(user, orderId) {
  const order = await loadOwnedOrder(user._id, orderId);

  if (order.paymentStatus === 'SUCCESS') {
    throw createHttpError(409, 'This order is already paid', 'ALREADY_PAID');
  }

  const latest = await Payment.findOne({ orderId: order._id }).sort({ createdAt: -1 });
  if (latest && latest.status === 'PENDING' && latest.provider !== 'cod') {
    latest.status = 'FAILED';
    latest.failureReason = 'Switched to cash on delivery';
    await latest.save();
  }

  order.paymentMethod = 'COD';
  order.paymentStatus = 'PENDING';
  await order.save();

  const payment = await Payment.findOneAndUpdate(
    { orderId: order._id, provider: 'cod' },
    {
      $setOnInsert: {
        orderId: order._id,
        provider: 'cod',
        amount: order.total,
        status: 'PENDING',
      },
    },
    { upsert: true, returnDocument: 'after' },
  );

  return { order, payment };
}

export async function handleWebhook(headers, body) {
  const provider = getPaymentProvider();
  const event = provider.parseWebhook(headers, body);

  if (!event.providerOrderId && !event.referenceId) {
    throw createHttpError(400, 'Invalid webhook payload', 'INVALID_WEBHOOK');
  }

  const payment = await Payment.findOne({
    $or: [{ referenceId: event.providerOrderId }, { referenceId: event.referenceId }],
  });
  if (!payment) {
    throw createHttpError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
  }

  const order = await Order.findById(payment.orderId);
  const valid = safeVerify(provider, {
    providerOrderId: event.providerOrderId,
    referenceId: event.referenceId,
    signature: event.signature,
    amount: order.total,
  });

  if (!valid) {
    throw createHttpError(400, 'Invalid webhook signature', 'INVALID_SIGNATURE');
  }

  if (event.status === 'SUCCESS' || event.event === 'payment.captured') {
    if (Number(event.amount) && Number(event.amount) !== order.total) {
      await applyFailure(order, payment, 'Webhook amount mismatch');
      throw createHttpError(400, 'Payment amount does not match the order', 'AMOUNT_MISMATCH');
    }
    return applySuccess(order, payment, event.referenceId);
  }

  return applyFailure(order, payment, event.event || 'Webhook payment failed');
}

export async function confirmDevPayment(user, orderId) {
  const provider = getPaymentProvider();
  if (provider.name !== 'dev' || typeof provider.signPayload !== 'function') {
    throw createHttpError(400, 'This provider requires a signed checkout callback', 'NOT_DEV_PROVIDER');
  }

  const order = await loadOwnedOrder(user._id, orderId);
  if (order.paymentMethod === 'COD') {
    throw createHttpError(400, 'COD orders are collected on delivery', 'COD_NOT_VERIFIABLE');
  }

  const payment = await Payment.findOne({ orderId: order._id }).sort({ createdAt: -1 });
  if (!payment) {
    throw createHttpError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
  }

  const referenceId = `pay_dev_${Date.now()}`;
  const providerOrderId = payment.referenceId;
  const signature = provider.signPayload(providerOrderId, referenceId, order.total);

  return verifyPayment(user, {
    orderId,
    providerOrderId,
    referenceId,
    signature,
  });
}

export async function getPaymentForOrder(user, orderId) {
  const order = await loadOwnedOrder(user._id, orderId);
  const payment = await Payment.findOne({ orderId: order._id }).sort({ createdAt: -1 });
  if (!payment) {
    throw createHttpError(404, 'Payment not found', 'PAYMENT_NOT_FOUND');
  }
  return { payment, order };
}
