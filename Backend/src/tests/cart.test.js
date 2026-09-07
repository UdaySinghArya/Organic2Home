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
import { Cart } from '../models/Cart.js';

const app = createApp();
let mongo;

function tokenFor(account) {
  return jwt.sign({ sub: String(account._id), role: account.role }, env.jwtSecret, { expiresIn: '1h' });
}

describe('Prompt 6 — cart', () => {
  let customer;
  let admin;
  let tomato;
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
    await Cart.deleteMany({});

    customer = await User.create({ name: 'Riya', phone: '9876543210', role: 'CUSTOMER' });
    admin = await Admin.create({ name: 'Harpreet', phone: '9000000001', role: 'ADMIN' });
    tomato = await Product.create({
      name: 'Desi Red Tomato',
      description: 'Freshly picked',
      category: 'vegetables',
      price: 40,
      unit: 'kg',
      image: 'https://example.com/tomato.jpg',
      stockQuantity: 5,
      farmerId: admin._id,
    });
    auth = `Bearer ${tokenFor(customer)}`;
  });

  it('adds, updates, removes, and clears cart items using server prices', async () => {
    const added = await request(app)
      .post('/api/cart/items')
      .set('Authorization', auth)
      .send({ productId: tomato._id, quantity: 2 });
    assert.equal(added.status, 200);
    assert.equal(added.body.data.cart.itemCount, 2);
    assert.equal(added.body.data.cart.subtotal, 80);
    assert.equal(added.body.data.cart.total, 80);
    assert.equal(added.body.data.cart.items[0].unitPrice, 40);

    const increased = await request(app)
      .post('/api/cart/items')
      .set('Authorization', auth)
      .send({ productId: tomato._id, quantity: 1 });
    assert.equal(increased.body.data.cart.itemCount, 3);
    assert.equal(increased.body.data.cart.subtotal, 120);

    const setQty = await request(app)
      .put(`/api/cart/items/${tomato._id}`)
      .set('Authorization', auth)
      .send({ quantity: 1 });
    assert.equal(setQty.body.data.cart.itemCount, 1);
    assert.equal(setQty.body.data.cart.subtotal, 40);

    const removed = await request(app).delete(`/api/cart/items/${tomato._id}`).set('Authorization', auth);
    assert.equal(removed.body.data.cart.items.length, 0);

    await request(app).post('/api/cart/items').set('Authorization', auth).send({ productId: tomato._id });
    const cleared = await request(app).delete('/api/cart').set('Authorization', auth);
    assert.equal(cleared.body.data.cart.itemCount, 0);
    assert.equal(cleared.body.data.cart.total, 0);
  });

  it('rejects unauthorized cart access', async () => {
    const res = await request(app).get('/api/cart');
    assert.equal(res.status, 401);
  });

  it('blocks admin from customer cart APIs', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${tokenFor(admin)}`);
    assert.equal(res.status, 403);
  });

  it('prevents adding more than available stock', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', auth)
      .send({ productId: tomato._id, quantity: 6 });
    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, 'INSUFFICIENT_STOCK');
  });

  it('rejects unavailable or out-of-stock products', async () => {
    const resting = await Product.create({
      name: 'Resting Palak',
      category: 'vegetables',
      price: 30,
      unit: 'bndl',
      image: 'https://example.com/palak.jpg',
      stockQuantity: 4,
      status: 'RESTING',
      farmerId: admin._id,
    });
    const oos = await Product.create({
      name: 'Onion',
      category: 'vegetables',
      price: 35,
      unit: 'kg',
      image: 'https://example.com/onion.jpg',
      stockQuantity: 0,
      status: 'OUT_OF_STOCK',
      availability: false,
      farmerId: admin._id,
    });

    const restingRes = await request(app)
      .post('/api/cart/items')
      .set('Authorization', auth)
      .send({ productId: resting._id });
    const oosRes = await request(app)
      .post('/api/cart/items')
      .set('Authorization', auth)
      .send({ productId: oos._id });

    assert.equal(restingRes.status, 400);
    assert.equal(oosRes.status, 400);
    assert.equal(restingRes.body.error.code, 'PRODUCT_UNAVAILABLE');
  });

  it('returns the current product price if it changed after add', async () => {
    await request(app)
      .post('/api/cart/items')
      .set('Authorization', auth)
      .send({ productId: tomato._id, quantity: 2 });

    tomato.price = 50;
    await tomato.save();

    const res = await request(app).get('/api/cart').set('Authorization', auth);
    assert.equal(res.body.data.cart.items[0].unitPrice, 50);
    assert.equal(res.body.data.cart.items[0].priceChanged, true);
    assert.equal(res.body.data.cart.subtotal, 100);
    assert.equal(res.body.data.cart.total, 100);
  });

  it('ignores frontend-sent totals', async () => {
    const res = await request(app)
      .post('/api/cart/items')
      .set('Authorization', auth)
      .send({ productId: tomato._id, quantity: 2, total: 1, subtotal: 1, price: 1 });

    assert.equal(res.body.data.cart.total, 80);
    assert.equal(res.body.data.cart.items[0].unitPrice, 40);
  });
});
