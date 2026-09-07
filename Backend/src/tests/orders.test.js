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
import { Counter } from '../models/Counter.js';

const app = createApp();
let mongo;

function tokenFor(account) {
  return jwt.sign({ sub: String(account._id), role: account.role }, env.jwtSecret, { expiresIn: '1h' });
}

const addressFields = {
  name: 'Riya Sharma',
  phone: '9876543210',
  addressLine1: '12 Green Lane',
  city: 'Gurugram',
  state: 'Haryana',
  pincode: '122101',
  label: 'Home',
  isDefault: true,
};

describe('Prompt 7 — orders + checkout', () => {
  let customer;
  let other;
  let admin;
  let tomato;
  let address;
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
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Counter.deleteMany({});

    customer = await User.create({ name: 'Riya', phone: '9876543210', role: 'CUSTOMER' });
    other = await User.create({ name: 'Sunita', phone: '9123456789', role: 'CUSTOMER' });
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
    address = await Address.create({ ...addressFields, userId: customer._id });
    auth = `Bearer ${tokenFor(customer)}`;
  });

  async function fillCart(user, product, quantity = 2) {
    await Cart.findOneAndUpdate(
      { userId: user._id },
      { $set: { items: [{ productId: product._id, quantity, priceSnapshot: product.price }] } },
      { upsert: true },
    );
  }

  it('places an order from cart using server prices, reduces stock, and clears cart', async () => {
    await fillCart(customer, tomato, 2);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', auth)
      .send({
        addressId: address._id,
        paymentMethod: 'UPI',
        total: 1,
        price: 1,
        userId: other._id,
      });

    assert.equal(res.status, 201);
    assert.match(res.body.data.order.orderNumber, /^O2H-\d{3}$/);
    assert.equal(res.body.data.order.subtotal, 80);
    assert.equal(res.body.data.order.deliveryFee, 30);
    assert.equal(res.body.data.order.total, 110);
    assert.equal(res.body.data.order.paymentStatus, 'PENDING');
    assert.equal(res.body.data.order.orderStatus, 'PLACED');
    assert.equal(res.body.data.order.fulfillmentStatus, 'PLACED');
    assert.equal(res.body.data.order.items[0].name, 'Desi Red Tomato');
    assert.equal(res.body.data.order.items[0].price, 40);

    const stock = await Product.findById(tomato._id);
    assert.equal(stock.stockQuantity, 3);
    const cart = await Cart.findOne({ userId: customer._id });
    assert.equal(cart.items.length, 0);
  });

  it('uses current product price if cart snapshot is stale', async () => {
    await fillCart(customer, tomato, 1);
    tomato.price = 55;
    await tomato.save();

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', auth)
      .send({ addressId: address._id });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.order.items[0].price, 55);
    assert.equal(res.body.data.order.subtotal, 55);
  });

  it('rejects empty cart and another customer address', async () => {
    const empty = await request(app).post('/api/orders').set('Authorization', auth).send({ addressId: address._id });
    const foreign = await Address.create({ ...addressFields, phone: '9123456789', userId: other._id });
    await fillCart(customer, tomato, 1);
    const stolen = await request(app)
      .post('/api/orders')
      .set('Authorization', auth)
      .send({ addressId: foreign._id });

    assert.equal(empty.status, 400);
    assert.equal(empty.body.error.code, 'CART_EMPTY');
    assert.equal(stolen.status, 400);
    assert.equal(stolen.body.error.code, 'INVALID_ADDRESS');
  });

  it('lets a customer list and view only their own orders', async () => {
    await fillCart(customer, tomato, 1);
    const created = await request(app)
      .post('/api/orders')
      .set('Authorization', auth)
      .send({ addressId: address._id });

    const list = await request(app).get('/api/orders').set('Authorization', auth);
    const mine = await request(app)
      .get(`/api/orders/${created.body.data.order.id}`)
      .set('Authorization', auth);
    const otherGet = await request(app)
      .get(`/api/orders/${created.body.data.order.id}`)
      .set('Authorization', `Bearer ${tokenFor(other)}`);

    assert.equal(list.body.data.count, 1);
    assert.equal(mine.status, 200);
    assert.equal(otherGet.status, 404);
  });

  it('rejects unauthorized and admin access', async () => {
    const noAuth = await request(app).get('/api/orders');
    const adminRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({});
    assert.equal(noAuth.status, 401);
    assert.equal(adminRes.status, 403);
  });

  it('handles concurrent checkout against the same stock safely', async () => {
    tomato.stockQuantity = 1;
    await tomato.save();

    const otherAddress = await Address.create({
      ...addressFields,
      name: 'Sunita',
      phone: '9123456789',
      userId: other._id,
    });
    await fillCart(customer, tomato, 1);
    await fillCart(other, tomato, 1);

    const [first, second] = await Promise.all([
      request(app).post('/api/orders').set('Authorization', auth).send({ addressId: address._id }),
      request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${tokenFor(other)}`)
        .send({ addressId: otherAddress._id }),
    ]);

    const statuses = [first.status, second.status].sort();
    assert.deepEqual(statuses, [201, 409]);
    assert.equal(await Order.countDocuments(), 1);
    const stock = await Product.findById(tomato._id);
    assert.equal(stock.stockQuantity, 0);
    assert.equal(stock.status, 'OUT_OF_STOCK');
  });
});
