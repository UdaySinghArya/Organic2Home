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
import { Order } from '../models/Order.js';
import { Harvest } from '../models/Harvest.js';

const app = createApp();
let mongo;

function tokenFor(account) {
  return jwt.sign({ sub: String(account._id), role: account.role }, env.jwtSecret, { expiresIn: '1h' });
}

describe('Prompt 9 — farmer harvest', () => {
  let admin;
  let otherAdmin;
  let customer;
  let tomato;
  let mango;
  let otherTomato;
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
    await Address.deleteMany({});
    await Order.deleteMany({});
    await Harvest.deleteMany({});

    admin = await Admin.create({ name: 'Harpreet', phone: '9000000001', role: 'ADMIN' });
    otherAdmin = await Admin.create({ name: 'Other', phone: '9000000002', role: 'ADMIN' });
    customer = await User.create({ name: 'Riya', phone: '9876543210', role: 'CUSTOMER' });
    tomato = await Product.create({
      name: 'Desi Red Tomato',
      category: 'vegetables',
      price: 40,
      unit: 'kg',
      image: 'https://example.com/tomato.jpg',
      stockQuantity: 20,
      farmerId: admin._id,
    });
    mango = await Product.create({
      name: 'Safeda Mango',
      category: 'fruits',
      price: 80,
      unit: 'kg',
      image: 'https://example.com/mango.jpg',
      stockQuantity: 10,
      farmerId: admin._id,
    });
    otherTomato = await Product.create({
      name: 'Other Farm Tomato',
      category: 'vegetables',
      price: 35,
      unit: 'kg',
      image: 'https://example.com/other.jpg',
      stockQuantity: 10,
      farmerId: otherAdmin._id,
    });
    auth = `Bearer ${tokenFor(admin)}`;
  });

  async function placeOrder({ items, paymentStatus = 'SUCCESS', paymentMethod = 'UPI', orderStatus = 'CONFIRMED' }) {
    return Order.create({
      orderNumber: `KS-${Math.floor(Math.random() * 900 + 100)}`,
      userId: customer._id,
      items,
      subtotal: 100,
      deliveryFee: 0,
      total: 100,
      paymentStatus,
      paymentMethod,
      orderStatus,
      fulfillmentStatus: orderStatus,
    });
  }

  it('builds tomorrow harvest from real paid orders, not screenshot numbers', async () => {
    await placeOrder({
      items: [
        { productId: tomato._id, name: tomato.name, price: 40, unit: 'kg', quantity: 2 },
        { productId: mango._id, name: mango.name, price: 80, unit: 'kg', quantity: 1 },
      ],
    });
    await placeOrder({
      items: [{ productId: tomato._id, name: tomato.name, price: 40, unit: 'kg', quantity: 3 }],
    });
    await placeOrder({
      items: [{ productId: tomato._id, name: tomato.name, price: 40, unit: 'kg', quantity: 9 }],
      paymentStatus: 'PENDING',
      paymentMethod: 'UPI',
    });
    await placeOrder({
      items: [{ productId: tomato._id, name: tomato.name, price: 40, unit: 'kg', quantity: 4 }],
      orderStatus: 'CANCELLED',
    });
    await placeOrder({
      items: [{ productId: otherTomato._id, name: otherTomato.name, price: 35, unit: 'kg', quantity: 6 }],
    });

    const res = await request(app).get('/api/farmer/harvest/tomorrow').set('Authorization', auth);
    assert.equal(res.status, 200);
    const tomatoRow = res.body.data.items.find((item) => item.product.name === 'Desi Red Tomato');
    const mangoRow = res.body.data.items.find((item) => item.product.name === 'Safeda Mango');
    assert.equal(tomatoRow.requiredQuantity, 5);
    assert.equal(tomatoRow.relatedOrderCount, 2);
    assert.equal(tomatoRow.remainingQuantity, 5);
    assert.equal(mangoRow.requiredQuantity, 1);
    assert.ok(!res.body.data.items.some((item) => item.product.name === 'Other Farm Tomato'));
    assert.notEqual(tomatoRow.requiredQuantity, 14);
  });

  it('includes COD orders even if payment is still pending', async () => {
    await placeOrder({
      items: [{ productId: tomato._id, name: tomato.name, price: 40, unit: 'kg', quantity: 2 }],
      paymentStatus: 'PENDING',
      paymentMethod: 'COD',
      orderStatus: 'PLACED',
    });

    const res = await request(app).get('/api/farmer/harvest/tomorrow').set('Authorization', auth);
    assert.equal(res.body.data.items[0].requiredQuantity, 2);
  });

  it('picks then packs, and blocks invalid transitions', async () => {
    await placeOrder({
      items: [{ productId: tomato._id, name: tomato.name, price: 40, unit: 'kg', quantity: 2 }],
    });
    const list = await request(app).get('/api/farmer/harvest/tomorrow').set('Authorization', auth);
    const id = list.body.data.items[0].id;

    const beforePick = await request(app)
      .patch(`/api/farmer/harvest/${id}/pack`)
      .set('Authorization', auth)
      .send({});
    assert.equal(beforePick.status, 409);

    const picked = await request(app).patch(`/api/farmer/harvest/${id}/pick`).set('Authorization', auth).send({});
    assert.equal(picked.body.data.harvest.status, 'PICKED');
    assert.equal(picked.body.data.harvest.pickedQuantity, 2);

    const packed = await request(app).patch(`/api/farmer/harvest/${id}/pack`).set('Authorization', auth).send({});
    assert.equal(packed.body.data.harvest.status, 'PACKED');
    assert.equal(packed.body.data.harvest.remainingQuantity, 0);

    const again = await request(app).patch(`/api/farmer/harvest/${id}/pick`).set('Authorization', auth).send({});
    assert.equal(again.status, 409);
    assert.equal(again.body.error.code, 'INVALID_TRANSITION');

    const order = await Order.findOne({ userId: customer._id });
    assert.equal(order.orderStatus, 'HARVESTING');
  });

  it('blocks customers and other admins', async () => {
    await placeOrder({
      items: [{ productId: tomato._id, name: tomato.name, price: 40, unit: 'kg', quantity: 1 }],
    });
    const list = await request(app).get('/api/farmer/harvest/tomorrow').set('Authorization', auth);

    const customerRes = await request(app)
      .get('/api/farmer/harvest/tomorrow')
      .set('Authorization', `Bearer ${tokenFor(customer)}`);
    const otherRes = await request(app)
      .patch(`/api/farmer/harvest/${list.body.data.items[0].id}/pick`)
      .set('Authorization', `Bearer ${tokenFor(otherAdmin)}`);

    assert.equal(customerRes.status, 403);
    assert.equal(otherRes.status, 404);
  });
});
