import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { findAccountByPhone, normalizePhone, PHONE_RE } from '../services/phone.js';
import { consumeOtp, issueOtp } from '../services/otp.service.js';

function publicAccount(account) {
  return {
    id: account._id,
    name: account.name,
    phone: account.phone,
    email: account.email || null,
    role: account.role,
    status: account.status,
    farmProfile: account.farmProfile || null,
  };
}

function signToken(account) {
  return jwt.sign({ sub: String(account._id), role: account.role }, env.jwtSecret, {
    expiresIn: '7d',
  });
}

function readPhone(body) {
  const phone = normalizePhone(body.phone);
  if (!PHONE_RE.test(phone)) {
    throw createHttpError(400, 'Please enter a valid 10-digit mobile number', 'INVALID_PHONE');
  }
  return phone;
}

export async function customerRequestOtp(req, res, next) {
  try {
    const phone = readPhone(req.body);
    const mode = req.body.mode === 'register' ? 'register' : 'login';
    const name = String(req.body.name || '').trim();
    const found = await findAccountByPhone(phone);

    if (found.role === 'ADMIN') {
      throw createHttpError(409, 'This number is already registered as admin', 'PHONE_TAKEN');
    }

    if (mode === 'register') {
      if (!name) {
        throw createHttpError(400, 'Name is required to create an account', 'INVALID_NAME');
      }
      if (found.account) {
        throw createHttpError(409, 'This number already has an Organic2Home account', 'USER_EXISTS');
      }
    } else if (!found.account) {
      throw createHttpError(404, 'No account found. Create an account first.', 'USER_NOT_FOUND');
    }

    const otp = await issueOtp(phone, 'CUSTOMER');
    res.json({
      success: true,
      data: {
        ...otp,
        mode,
        name: name || found.account?.name || null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function customerResendOtp(req, res, next) {
  try {
    const phone = readPhone(req.body);
    const found = await findAccountByPhone(phone);

    if (found.role === 'ADMIN') {
      throw createHttpError(409, 'This number is already registered as admin', 'PHONE_TAKEN');
    }

    await issueOtp(phone, 'CUSTOMER');
    res.json({
      success: true,
      data: {
        phone,
        role: 'CUSTOMER',
        expiresInMinutes: env.otpExpiryMinutes,
        resent: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function customerVerifyOtp(req, res, next) {
  try {
    const phone = readPhone(req.body);
    const otp = String(req.body.otp || '');
    const mode = req.body.mode === 'register' ? 'register' : 'login';
    const name = String(req.body.name || '').trim();

    await consumeOtp(phone, 'CUSTOMER', otp);

    const found = await findAccountByPhone(phone);
    if (found.role === 'ADMIN') {
      throw createHttpError(409, 'This number is already registered as admin', 'PHONE_TAKEN');
    }

    let user = found.account;
    if (mode === 'register') {
      if (user) {
        throw createHttpError(409, 'This number already has an Organic2Home account', 'USER_EXISTS');
      }
      if (!name) {
        throw createHttpError(400, 'Name is required to create an account', 'INVALID_NAME');
      }
      user = await User.create({ name, phone, role: 'CUSTOMER' });
    } else if (!user) {
      throw createHttpError(404, 'No account found. Create an account first.', 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        token: signToken(user),
        user: publicAccount(user),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function adminRegister(req, res, next) {
  try {
    const phone = readPhone(req.body);
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!name) {
      throw createHttpError(400, 'Name is required to create an admin', 'INVALID_NAME');
    }

    const found = await findAccountByPhone(phone);
    if (found.account) {
      throw createHttpError(409, 'This phone number is already registered', 'PHONE_TAKEN');
    }

    const admin = await Admin.create({
      name,
      phone,
      email: email || undefined,
      role: 'ADMIN',
      farmProfile: {
        farmName: String(req.body.farmName || '').trim() || undefined,
        plot: String(req.body.plot || '').trim() || undefined,
        village: String(req.body.village || '').trim() || undefined,
        location: String(req.body.location || '').trim() || undefined,
      },
    });

    res.status(201).json({
      success: true,
      data: { admin: publicAccount(admin) },
    });
  } catch (err) {
    next(err);
  }
}

export async function adminRequestOtp(req, res, next) {
  try {
    const phone = readPhone(req.body);
    const found = await findAccountByPhone(phone);

    if (!found.account || found.role !== 'ADMIN') {
      throw createHttpError(404, 'No admin account found for this number', 'ADMIN_NOT_FOUND');
    }

    const otp = await issueOtp(phone, 'ADMIN');
    res.json({
      success: true,
      data: {
        ...otp,
        name: found.account.name,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function adminResendOtp(req, res, next) {
  try {
    const phone = readPhone(req.body);
    const found = await findAccountByPhone(phone);

    if (!found.account || found.role !== 'ADMIN') {
      throw createHttpError(404, 'No admin account found for this number', 'ADMIN_NOT_FOUND');
    }

    const otp = await issueOtp(phone, 'ADMIN');
    res.json({
      success: true,
      data: {
        ...otp,
        resent: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function adminVerifyOtp(req, res, next) {
  try {
    const phone = readPhone(req.body);
    const otp = String(req.body.otp || '');

    await consumeOtp(phone, 'ADMIN', otp);

    const found = await findAccountByPhone(phone);
    if (!found.account || found.role !== 'ADMIN') {
      throw createHttpError(404, 'No admin account found for this number', 'ADMIN_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        token: signToken(found.account),
        user: publicAccount(found.account),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSession(req, res) {
  res.json({
    success: true,
    data: { user: publicAccount(req.user) },
  });
}

export function logout(_req, res) {
  res.json({
    success: true,
    data: { loggedOut: true, message: 'Delete the token on the client' },
  });
}
