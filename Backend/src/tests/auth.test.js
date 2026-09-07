import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from '../config/env.js';
import { createApp } from '../app.js';
import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { Otp } from '../models/Otp.js';

const app = createApp();
let mongo;

function tokenFor(account, expiresIn = '1h') {
  return jwt.sign({ sub: String(account._id), role: account.role }, env.jwtSecret, { expiresIn });
}

async function plantOtp(phone, role, code = '123456') {
  await Otp.deleteMany({ phone, role });
  await Otp.create({
    phone,
    role,
    codeHash: await bcrypt.hash(code, 10),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
  return code;
}

describe('Prompt 12 — auth, session, authorization', () => {
  let customer;
  let admin;

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
    await Otp.deleteMany({});
    customer = await User.create({ name: 'Riya', phone: '9876543210', role: 'CUSTOMER' });
    admin = await Admin.create({ name: 'Harpreet', phone: '9000000001', role: 'ADMIN' });
  });

  it('returns the current session for a valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tokenFor(customer)}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.role, 'CUSTOMER');
    assert.equal(res.body.data.user.phone, '9876543210');
  });

  it('rejects missing, expired, and garbage tokens', async () => {
    const missing = await request(app).get('/api/auth/me');
    const expired = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenFor(customer, '-1s')}`);
    const garbage = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-jwt');

    assert.equal(missing.status, 401);
    assert.equal(expired.status, 401);
    assert.equal(garbage.status, 401);
    assert.equal(expired.body.error.code, 'UNAUTHENTICATED');
    assert.equal(garbage.body.error.code, 'UNAUTHENTICATED');
  });

  it('logs out an authenticated session', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${tokenFor(customer)}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.loggedOut, true);
  });

  it('blocks customers from farmer APIs and admins from customer cart', async () => {
    const farmer = await request(app)
      .get('/api/farmer/products')
      .set('Authorization', `Bearer ${tokenFor(customer)}`);
    const cart = await request(app).get('/api/cart').set('Authorization', `Bearer ${tokenFor(admin)}`);

    assert.equal(farmer.status, 403);
    assert.equal(cart.status, 403);
    assert.equal(farmer.body.error.code, 'FORBIDDEN');
    assert.equal(cart.body.error.code, 'FORBIDDEN');
  });

  it('accepts the static dev OTP after a login request', async () => {
    const requested = await request(app).post('/api/auth/otp/request').send({
      phone: customer.phone,
      mode: 'login',
    });
    assert.equal(requested.status, 200);

    const res = await request(app).post('/api/auth/otp/verify').send({
      phone: customer.phone,
      otp: '000000',
      mode: 'login',
    });
    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);
  });

  it('verifies a planted customer OTP and issues a JWT', async () => {
    const otp = await plantOtp(customer.phone, 'CUSTOMER');
    const res = await request(app).post('/api/auth/otp/verify').send({
      phone: customer.phone,
      otp,
      mode: 'login',
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.user.role, 'CUSTOMER');
    assert.ok(res.body.data.token);
    const payload = jwt.verify(res.body.data.token, env.jwtSecret);
    assert.equal(payload.role, 'CUSTOMER');
    assert.equal(payload.sub, String(customer._id));
  });

  it('keeps customer and admin phone tables exclusive at OTP request', async () => {
    const customerOnAdmin = await request(app)
      .post('/api/auth/otp/request')
      .send({ phone: admin.phone, mode: 'login' });
    const adminOnCustomer = await request(app)
      .post('/api/auth/admin/otp/request')
      .send({ phone: customer.phone });
    const missing = await request(app).post('/api/auth/otp/request').send({ phone: '9111111111', mode: 'login' });

    assert.equal(customerOnAdmin.status, 409);
    assert.equal(adminOnCustomer.status, 404);
    assert.equal(missing.status, 404);
    assert.equal(customerOnAdmin.body.error.code, 'PHONE_TAKEN');
    assert.equal(adminOnCustomer.body.error.code, 'ADMIN_NOT_FOUND');
    assert.equal(missing.body.error.code, 'USER_NOT_FOUND');
  });
});
