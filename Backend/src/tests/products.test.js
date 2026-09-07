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

const app = createApp();
let mongo;

function tokenFor(account) {
  return jwt.sign({ sub: String(account._id), role: account.role }, env.jwtSecret, { expiresIn: '1h' });
}

const tomato = {
  name: 'Desi Red Tomato',
  description: 'Freshly picked',
  category: 'vegetables',
  price: 40,
  unit: 'kg',
  image: 'https://example.com/tomato.jpg',
  stockQuantity: 14,
};

describe('Prompt 5 — products + inventory', () => {
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
  });

  async function seedAdmin() {
    return Admin.create({
      name: 'Harpreet',
      phone: '9000000001',
      role: 'ADMIN',
      farmProfile: { farmName: 'Green Field Farm', plot: '4B', village: 'Samana' },
    });
  }

  it('lists categories', async () => {
    const res = await request(app).get('/api/categories');
    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.data.categories.map((item) => item.id),
      ['vegetables', 'fruits'],
    );
  });

  it('lets an admin create, edit, and change product status', async () => {
    const admin = await seedAdmin();
    const auth = `Bearer ${tokenFor(admin)}`;

    const created = await request(app).post('/api/farmer/products').set('Authorization', auth).send(tomato);
    assert.equal(created.status, 201);
    assert.equal(created.body.data.product.price, 40);
    assert.equal(created.body.data.product.status, 'ACTIVE');
    assert.equal(created.body.data.product.inStock, true);

    const id = created.body.data.product.id;
    const updated = await request(app)
      .put(`/api/farmer/products/${id}`)
      .set('Authorization', auth)
      .send({ price: 45, stockQuantity: 10 });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.product.price, 45);

    const resting = await request(app)
      .patch(`/api/farmer/products/${id}/status`)
      .set('Authorization', auth)
      .send({ status: 'RESTING' });
    assert.equal(resting.status, 200);
    assert.equal(resting.body.data.product.status, 'RESTING');
  });

  it('rejects negative price and negative stock', async () => {
    const admin = await seedAdmin();
    const auth = `Bearer ${tokenFor(admin)}`;

    const price = await request(app)
      .post('/api/farmer/products')
      .set('Authorization', auth)
      .send({ ...tomato, price: -10 });
    const stock = await request(app)
      .post('/api/farmer/products')
      .set('Authorization', auth)
      .send({ ...tomato, stockQuantity: -2 });

    assert.equal(price.status, 400);
    assert.equal(price.body.error.code, 'INVALID_PRICE');
    assert.equal(stock.status, 400);
    assert.equal(stock.body.error.code, 'INVALID_STOCK');
  });

  it('lists and filters customer catalog by category and availability', async () => {
    const admin = await seedAdmin();
    await Product.create({
      ...tomato,
      farmerId: admin._id,
      status: 'ACTIVE',
      availability: true,
    });
    await Product.create({
      ...tomato,
      name: 'Safeda Mango',
      category: 'fruits',
      farmerId: admin._id,
      status: 'ACTIVE',
      availability: true,
    });
    await Product.create({
      ...tomato,
      name: 'Resting Palak',
      farmerId: admin._id,
      status: 'RESTING',
    });
    await Product.create({
      ...tomato,
      name: 'Out Onion',
      farmerId: admin._id,
      stockQuantity: 0,
      status: 'OUT_OF_STOCK',
      availability: false,
    });

    const all = await request(app).get('/api/products');
    const veg = await request(app).get('/api/products?category=vegetables');
    const available = await request(app).get('/api/products?availability=true');

    assert.equal(all.status, 200);
    assert.equal(all.body.data.count, 3);
    assert.ok(!all.body.data.products.some((item) => item.name === 'Resting Palak'));
    assert.equal(veg.body.data.count, 2);
    assert.ok(veg.body.data.products.every((item) => item.category === 'vegetables'));
    assert.equal(available.body.data.count, 2);
    assert.ok(available.body.data.products.every((item) => item.inStock));
  });

  it('returns product detail including out-of-stock state', async () => {
    const admin = await seedAdmin();
    const product = await Product.create({
      ...tomato,
      farmerId: admin._id,
      stockQuantity: 0,
      status: 'OUT_OF_STOCK',
      availability: false,
    });

    const res = await request(app).get(`/api/products/${product._id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.product.inStock, false);
    assert.equal(res.body.data.product.status, 'OUT_OF_STOCK');
  });

  it('blocks customers from farmer product APIs', async () => {
    const customer = await User.create({ name: 'Riya', phone: '9876543210', role: 'CUSTOMER' });
    const res = await request(app)
      .get('/api/farmer/products')
      .set('Authorization', `Bearer ${tokenFor(customer)}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  it('blocks one admin from editing another admin product', async () => {
    const owner = await seedAdmin();
    const other = await Admin.create({ name: 'Other', phone: '9000000002', role: 'ADMIN' });
    const product = await Product.create({ ...tomato, farmerId: owner._id });

    const res = await request(app)
      .put(`/api/farmer/products/${product._id}`)
      .set('Authorization', `Bearer ${tokenFor(other)}`)
      .send({ price: 99 });

    assert.equal(res.status, 404);
    const unchanged = await Product.findById(product._id);
    assert.equal(unchanged.price, 40);
  });

  it('requires auth for farmer create', async () => {
    const res = await request(app).post('/api/farmer/products').send(tomato);
    assert.equal(res.status, 401);
  });
});
