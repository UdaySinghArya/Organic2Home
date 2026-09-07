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
import { Order } from '../models/Order.js';

const app = createApp();
let mongo;

function tokenFor(account) {
  return jwt.sign({ sub: String(account._id), role: account.role }, env.jwtSecret, { expiresIn: '1h' });
}

describe('Prompt 10 — farmer orders + contract', () => {
  let admin;
  let otherAdmin;
  let customer;
  let tomato;
  let otherProduct;
  let order;
  let otherOrder;
  let auth;

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
    await Order.deleteMany({});

    admin = await Admin.create({ name: 'Harpreet', phone: '9000000001', role: 'ADMIN' });
    otherAdmin = await Admin.create({ name: 'Other', phone: '9000000002', role: 'ADMIN' });
    customer = await User.create({ name: 'Riya', phone: '9876543210', role: 'CUSTOMER' });
    tomato = await Product.create({
      name: 'Tomato',
      category: 'vegetables',
      price: 40,
      unit: 'kg',
      image: 'https://example.com/t.jpg',
      stockQuantity: 10,
      farmerId: admin._id,
    });
    otherProduct = await Product.create({
      name: 'Other Palak',
      category: 'vegetables',
      price: 30,
      unit: 'bndl',
      image: 'https://example.com/p.jpg',
      stockQuantity: 10,
      farmerId: otherAdmin._id,
    });
    order = await Order.create({
      orderNumber: 'KS-201',
      userId: customer._id,
      items: [{ productId: tomato._id, name: 'Tomato', price: 40, unit: 'kg', quantity: 2 }],
      subtotal: 80,
      deliveryFee: 30,
      total: 110,
      paymentStatus: 'SUCCESS',
      orderStatus: 'CONFIRMED',
      fulfillmentStatus: 'CONFIRMED',
    });
    otherOrder = await Order.create({
      orderNumber: 'KS-202',
      userId: customer._id,
      items: [{ productId: otherProduct._id, name: 'Other Palak', price: 30, unit: 'bndl', quantity: 1 }],
      subtotal: 30,
      deliveryFee: 30,
      total: 60,
      paymentStatus: 'SUCCESS',
      orderStatus: 'CONFIRMED',
      fulfillmentStatus: 'CONFIRMED',
    });
    auth = `Bearer ${tokenFor(admin)}`;
  });

  it('lists only orders that include this admin products', async () => {
    const res = await request(app).get('/api/farmer/orders').set('Authorization', auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.count, 1);
    assert.equal(res.body.data.orders[0].orderNumber, 'KS-201');
  });

  it('returns own related order and hides unrelated customer order', async () => {
    const mine = await request(app).get(`/api/farmer/orders/${order._id}`).set('Authorization', auth);
    const hidden = await request(app).get(`/api/farmer/orders/${otherOrder._id}`).set('Authorization', auth);
    assert.equal(mine.status, 200);
    assert.equal(hidden.status, 404);
  });

  it('allows valid fulfillment transitions and blocks skips', async () => {
    const harvest = await request(app)
      .patch(`/api/farmer/orders/${order._id}/status`)
      .set('Authorization', auth)
      .send({ status: 'HARVESTING' });
    assert.equal(harvest.status, 200);
    assert.equal(harvest.body.data.order.orderStatus, 'HARVESTING');
    assert.equal(harvest.body.data.order.fulfillmentStatus, 'HARVESTING');

    const skip = await request(app)
      .patch(`/api/farmer/orders/${order._id}/status`)
      .set('Authorization', auth)
      .send({ status: 'DELIVERED' });
    assert.equal(skip.status, 409);
    assert.equal(skip.body.error.code, 'INVALID_TRANSITION');
  });

  it('blocks customers from farmer order APIs', async () => {
    const res = await request(app)
      .get('/api/farmer/orders')
      .set('Authorization', `Bearer ${tokenFor(customer)}`);
    assert.equal(res.status, 403);
  });

  it('serves the API contract', async () => {
    const res = await request(app).get('/api/docs');
    assert.equal(res.status, 200);
    assert.equal(res.body.openapi, '3.0.3');
    assert.ok(res.body.paths['/api/farmer/orders']);
    assert.ok(res.body.paths['/api/payments/verify']);
  });
});
