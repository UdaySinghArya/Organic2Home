import mongoose from 'mongoose';
import { createHttpError } from '../middleware/errorHandler.js';
import { normalizePhone, PHONE_RE } from '../services/phone.js';

const PINCODE_RE = /^\d{6}$/;

export function assertObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, 'Invalid address id', 'INVALID_ID');
  }
  return id;
}

export function readAddressInput(body, { partial = false } = {}) {
  const data = {};

  if (!partial || body.name !== undefined) {
    const name = String(body.name || '').trim();
    if (!name) throw createHttpError(400, 'Full name is required', 'INVALID_NAME');
    data.name = name;
  }

  if (!partial || body.phone !== undefined) {
    const phone = normalizePhone(body.phone);
    if (!PHONE_RE.test(phone)) {
      throw createHttpError(400, 'Please enter a valid 10-digit mobile number', 'INVALID_PHONE');
    }
    data.phone = phone;
  }

  if (!partial || body.addressLine1 !== undefined) {
    const addressLine1 = String(body.addressLine1 || body.house || '').trim();
    if (!addressLine1) {
      throw createHttpError(400, 'House / flat / building is required', 'INVALID_ADDRESS');
    }
    data.addressLine1 = addressLine1;
  }

  if (!partial || body.addressLine2 !== undefined) {
    data.addressLine2 = String(body.addressLine2 || '').trim() || undefined;
  }

  if (!partial || body.city !== undefined || body.area !== undefined) {
    const city = String(body.city || body.area || '').trim();
    if (!city) throw createHttpError(400, 'Village / area / city is required', 'INVALID_CITY');
    data.city = city;
  }

  if (!partial || body.state !== undefined) {
    const state = String(body.state || '').trim();
    if (!state) throw createHttpError(400, 'State is required', 'INVALID_STATE');
    data.state = state;
  }

  if (!partial || body.pincode !== undefined) {
    const pincode = String(body.pincode || '').replace(/\D/g, '');
    if (!PINCODE_RE.test(pincode)) {
      throw createHttpError(400, 'Please enter a valid 6-digit pincode', 'INVALID_PINCODE');
    }
    data.pincode = pincode;
  }

  if (!partial || body.landmark !== undefined) {
    data.landmark = String(body.landmark || '').trim() || undefined;
  }

  if (!partial || body.label !== undefined) {
    data.label = String(body.label || 'Home').trim() || 'Home';
  }

  if (body.isDefault !== undefined) {
    data.isDefault = Boolean(body.isDefault);
  }

  return data;
}
