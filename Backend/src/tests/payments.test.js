import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from '../config/env.js';
import { createApp } from '../app.js';
import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { Product } from '../models/Product.js';
import { Address } from '../models/Address.js';
import { Cart } from '../models/Cart.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Counter } from '../models/Counter.js';
import { DevPaymentProvider } from '../payments/DevPaymentProvider.js';

const app = createApp();
const provider = new DevPaymentProvider();
let mongo;

function tokenFor(account) {
  return jwt.sign({ sub: String(account._id), role: account.role }, env.jwtSecret, { expiresIn: '1h' });
}

describe('Prompt 8 — payments', () => {
  let customer;
  let other;
  let auth;
  let order;

  before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  });

  after(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Admin.deleteMany({});
    await Product.deleteMany({});
    await Address.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});
    await Counter.deleteMany({});

    customer = await User.create({ name: 'Riya', phone: '9876543210', role: 'CUSTOMER' });
    other = await User.create({ name: 'Sunita', phone: '9123456789', role: 'CUSTOMER' });
    const admin = await Admin.create({ name: 'Harpreet', phone: '9000000001', role: 'ADMIN' });
    const tomato = await Product.create({
      name: 'Desi Red Tomato',
      category: 'vegetables',
      price: 40,
      unit: 'kg',
      image: 'https://example.com/tomato.jpg',
      stockQuantity: 10,
      farmerId: admin._id,
    });
    const address = await Address.create({
      userId: customer._id,
      name: 'Riya',
      phone: '9876543210',
      addressLine1: '12 Green Lane',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122101',
      isDefault: true,
    });
    await Cart.create({
      userId: customer._id,
      items: [{ productId: tomato._id, quantity: 2, priceSnapshot: 40 }],
    });
    auth = `Bearer ${tokenFor(customer)}`;

    const created = await request(app)
      .post('/api/orders')
      .set('Authorization', auth)
      .send({ addressId: address._id, paymentMethod: 'UPI' });
    order = created.body.data.order;
  });

  it('initiates payment using the backend order amount', async () => {
    const res = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', auth)
      .send({ orderId: order.id, amount: 1 });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.payment.amount, order.total);
    assert.equal(res.body.data.checkout.amount, order.total);
    assert.equal(res.body.data.payment.status, 'PENDING');
    assert.equal(res.body.data.payment.amount, 110);
  });

  it('does not mark an order paid from a frontend success flag', async () => {
    await request(app).post('/api/payments/initiate').set('Authorization', auth).send({ orderId: order.id });

    const res = await request(app)
      .post('/api/payments/verify')
      .set('Authorization', auth)
      .send({ orderId: order.id, success: true, paymentId: 'pay_fake' });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'VERIFY_REQUIRED');
    const fresh = await Order.findById(order.id);
    assert.equal(fresh.paymentStatus, 'PENDING');
  });

  it('marks paid only after server-side signature verification', async () => {
    const init = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', auth)
      .send({ orderId: order.id });
    const providerOrderId = init.body.data.checkout.providerOrderId;
    const referenceId = 'pay_dev_1';
    const signature = provider.signPayload(providerOrderId, referenceId, order.total);

    const res = await request(app).post('/api/payments/verify').set('Authorization', auth).send({
      orderId: order.id,
      providerOrderId,
      referenceId,
      signature,
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.payment.status, 'SUCCESS');
    assert.equal(res.body.data.order.paymentStatus, 'SUCCESS');
    assert.equal(res.body.data.order.orderStatus, 'CONFIRMED');

    const again = await request(app).post('/api/payments/verify').set('Authorization', auth).send({
      orderId: order.id,
      providerOrderId,
      referenceId,
      signature,
    });
    assert.equal(again.body.data.duplicate, true);
    assert.equal(again.body.data.payment.status, 'SUCCESS');
  });

  it('dev confirm signs on the server and does not trust frontend success', async () => {
    await request(app).post('/api/payments/initiate').set('Authorization', auth).send({ orderId: order.id });
    const res = await request(app)
      .post('/api/payments/dev/confirm')
      .set('Authorization', auth)
      .send({ orderId: order.id });
    assert.equal(res.status, 200);
    assert.equal(res.body.data.payment.status, 'SUCCESS');
  });

  it('fails verification on amount mismatch or bad signature', async () => {
    const init = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', auth)
      .send({ orderId: order.id });
    const providerOrderId = init.body.data.checkout.providerOrderId;

    const mismatch = await request(app).post('/api/payments/verify').set('Authorization', auth).send({
      orderId: order.id,
      providerOrderId,
      referenceId: 'pay_1',
      amount: 10,
      signature: provider.signPayload(providerOrderId, 'pay_1', 10),
    });
    assert.equal(mismatch.status, 400);
    assert.equal(mismatch.body.error.code, 'AMOUNT_MISMATCH');

    await request(app).post('/api/payments/initiate').set('Authorization', auth).send({ orderId: order.id });
    const badSig = await request(app).post('/api/payments/verify').set('Authorization', auth).send({
      orderId: order.id,
      providerOrderId,
      referenceId: 'pay_2',
      signature: 'deadbeef',
    });
    assert.equal(badSig.status, 400);
    assert.equal(badSig.body.error.code, 'INVALID_SIGNATURE');
    const fresh = await Order.findById(order.id);
    assert.equal(fresh.paymentStatus, 'FAILED');
    assert.notEqual(fresh.paymentStatus, 'SUCCESS');
  });

  it('switches an unpaid order to COD without marking it paid', async () => {
    await request(app).post('/api/payments/initiate').set('Authorization', auth).send({ orderId: order.id });
    const res = await request(app).post('/api/payments/cod').set('Authorization', auth).send({ orderId: order.id });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.order.paymentMethod, 'COD');
    assert.equal(res.body.data.order.paymentStatus, 'PENDING');
    assert.notEqual(res.body.data.order.paymentStatus, 'SUCCESS');
    assert.equal(res.body.data.payment.provider, 'cod');
    assert.equal(res.body.data.payment.status, 'PENDING');

    const paid = await request(app).post('/api/payments/dev/confirm').set('Authorization', auth).send({ orderId: order.id });
    assert.equal(paid.status, 400);
    assert.equal(paid.body.error.code, 'COD_NOT_VERIFIABLE');
  });

  it('does not switch a paid order to COD', async () => {
    await request(app).post('/api/payments/initiate').set('Authorization', auth).send({ orderId: order.id });
    await request(app).post('/api/payments/dev/confirm').set('Authorization', auth).send({ orderId: order.id });
    const res = await request(app).post('/api/payments/cod').set('Authorization', auth).send({ orderId: order.id });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, 'ALREADY_PAID');
  });

  it('records cancel and timeout as failed, not paid', async () => {
    await request(app).post('/api/payments/initiate').set('Authorization', auth).send({ orderId: order.id });
    const cancelled = await request(app)
      .post('/api/payments/cancel')
      .set('Authorization', auth)
      .send({ orderId: order.id });
    assert.equal(cancelled.body.data.payment.status, 'FAILED');
    assert.equal(cancelled.body.data.order.paymentStatus, 'FAILED');

    await request(app).post('/api/payments/initiate').set('Authorization', auth).send({ orderId: order.id });
    const timedOut = await request(app)
      .post('/api/payments/timeout')
      .set('Authorization', auth)
      .send({ orderId: order.id });
    assert.equal(timedOut.body.data.payment.status, 'FAILED');
    assert.equal(timedOut.body.data.payment.failureReason, 'Payment timed out');
  });

  it('accepts signed webhooks and is idempotent on retry', async () => {
    const init = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', auth)
      .send({ orderId: order.id });
    const providerOrderId = init.body.data.checkout.providerOrderId;
    const referenceId = 'pay_hook_1';
    const signature = provider.signPayload(providerOrderId, referenceId, order.total);

    const payload = {
      event: 'payment.captured',
      providerOrderId,
      referenceId,
      amount: order.total,
      status: 'SUCCESS',
    };

    const first = await request(app)
      .post('/api/payments/webhook')
      .set('x-organic2home-signature', signature)
      .send(payload);
    const retry = await request(app)
      .post('/api/payments/webhook')
      .set('x-organic2home-signature', signature)
      .send(payload);

    assert.equal(first.status, 200);
    assert.equal(first.body.data.payment.status, 'SUCCESS');
    assert.equal(retry.body.data.duplicate, true);
  });

  it('blocks another customer from paying this order', async () => {
    const res = await request(app)
      .post('/api/payments/initiate')
      .set('Authorization', `Bearer ${tokenFor(other)}`)
      .send({ orderId: order.id });
    assert.equal(res.status, 404);
  });
});
