import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from '../config/env.js';
import { createApp } from '../app.js';
import { User } from '../models/User.js';
import { Address } from '../models/Address.js';

const app = createApp();
let mongo;

function tokenFor(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, { expiresIn: '1h' });
}

async function createCustomer(overrides = {}) {
  return User.create({
    name: overrides.name || 'Riya',
    phone: overrides.phone || '9876543210',
    email: overrides.email,
    role: 'CUSTOMER',
  });
}

const sampleAddress = {
  name: 'Riya Sharma',
  phone: '9876543210',
  addressLine1: 'Flat 302, Palm Grove',
  city: 'Gurugram',
  state: 'Haryana',
  pincode: '122101',
  landmark: 'Near metro',
  label: 'Home',
};

describe('Prompt 4 — profile + addresses', () => {
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
    await Address.deleteMany({});
  });

  it('returns the authenticated customer profile', async () => {
    const user = await createCustomer();
    const res = await request(app).get('/api/profile').set('Authorization', `Bearer ${tokenFor(user)}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.profile.phone, '9876543210');
    assert.equal(res.body.data.profile.role, 'CUSTOMER');
  });

  it('updates the customer profile', async () => {
    const user = await createCustomer();
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${tokenFor(user)}`)
      .send({ name: 'Riya K', email: 'riya@example.com' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.profile.name, 'Riya K');
    assert.equal(res.body.data.profile.email, 'riya@example.com');
  });

  it('rejects unauthorized profile and address requests', async () => {
    const profile = await request(app).get('/api/profile');
    const addresses = await request(app).get('/api/addresses');

    assert.equal(profile.status, 401);
    assert.equal(addresses.status, 401);
    assert.equal(profile.body.error.code, 'UNAUTHENTICATED');
  });

  it('rejects invalid profile and address payloads', async () => {
    const user = await createCustomer();
    const auth = `Bearer ${tokenFor(user)}`;

    const profile = await request(app).put('/api/profile').set('Authorization', auth).send({ name: '  ' });
    const address = await request(app).post('/api/addresses').set('Authorization', auth).send({
      name: 'Riya',
      phone: '123',
      addressLine1: 'A',
      city: 'Gurgaon',
      state: 'HR',
      pincode: '12',
    });

    assert.equal(profile.status, 400);
    assert.equal(address.status, 400);
    assert.equal(address.body.error.code, 'INVALID_PHONE');
  });

  it('creates and lists multiple addresses, first one default', async () => {
    const user = await createCustomer();
    const auth = `Bearer ${tokenFor(user)}`;

    const first = await request(app).post('/api/addresses').set('Authorization', auth).send(sampleAddress);
    const second = await request(app).post('/api/addresses').set('Authorization', auth).send({
      ...sampleAddress,
      label: 'Office',
      addressLine1: 'Plot 11',
    });
    const list = await request(app).get('/api/addresses').set('Authorization', auth);

    assert.equal(first.status, 201);
    assert.equal(first.body.data.address.isDefault, true);
    assert.equal(second.status, 201);
    assert.equal(second.body.data.address.isDefault, false);
    assert.equal(list.body.data.addresses.length, 2);
    assert.equal(list.body.data.defaultAddress.id, first.body.data.address.id);
  });

  it('switches default address and promotes another when default is deleted', async () => {
    const user = await createCustomer();
    const auth = `Bearer ${tokenFor(user)}`;

    const first = await request(app).post('/api/addresses').set('Authorization', auth).send(sampleAddress);
    const second = await request(app)
      .post('/api/addresses')
      .set('Authorization', auth)
      .send({ ...sampleAddress, label: 'Farm', isDefault: true, addressLine1: 'Field 4B' });

    assert.equal(second.body.data.address.isDefault, true);

    const afterSwitch = await request(app)
      .get(`/api/addresses/${first.body.data.address.id}`)
      .set('Authorization', auth);
    assert.equal(afterSwitch.body.data.address.isDefault, false);

    await request(app).delete(`/api/addresses/${second.body.data.address.id}`).set('Authorization', auth);
    const remaining = await request(app)
      .get(`/api/addresses/${first.body.data.address.id}`)
      .set('Authorization', auth);
    assert.equal(remaining.body.data.address.isDefault, true);
  });

  it('returns 404 for a missing address', async () => {
    const user = await createCustomer();
    const missingId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/addresses/${missingId}`)
      .set('Authorization', `Bearer ${tokenFor(user)}`);

    assert.equal(res.status, 404);
    assert.equal(res.body.error.code, 'ADDRESS_NOT_FOUND');
  });

  it('blocks one customer from reading, updating, or deleting another customer address', async () => {
    const riya = await createCustomer({ phone: '9876543210' });
    const sunita = await createCustomer({ name: 'Sunita', phone: '9123456789' });
    const riyaAddress = await Address.create({ ...sampleAddress, userId: riya._id, isDefault: true });

    const getRes = await request(app)
      .get(`/api/addresses/${riyaAddress._id}`)
      .set('Authorization', `Bearer ${tokenFor(sunita)}`);
    const putRes = await request(app)
      .put(`/api/addresses/${riyaAddress._id}`)
      .set('Authorization', `Bearer ${tokenFor(sunita)}`)
      .send({ city: 'Delhi' });
    const deleteRes = await request(app)
      .delete(`/api/addresses/${riyaAddress._id}`)
      .set('Authorization', `Bearer ${tokenFor(sunita)}`);

    assert.equal(getRes.status, 404);
    assert.equal(putRes.status, 404);
    assert.equal(deleteRes.status, 404);
    const stillThere = await Address.findById(riyaAddress._id);
    assert.ok(stillThere);
  });
});
