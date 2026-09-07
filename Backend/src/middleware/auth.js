import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';
import { createHttpError } from './errorHandler.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      throw createHttpError(401, 'Authentication required', 'UNAUTHENTICATED');
    }

    const payload = jwt.verify(token, env.jwtSecret);
    const Model = payload.role === 'ADMIN' ? Admin : User;
    const account = await Model.findById(payload.sub);

    if (!account || account.status !== 'ACTIVE') {
      throw createHttpError(401, 'Invalid session', 'UNAUTHENTICATED');
    }

    req.user = account;
    next();
  } catch (err) {
    if (err.statusCode) return next(err);
    next(createHttpError(401, 'Invalid or expired token', 'UNAUTHENTICATED'));
  }
}

export function requireRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(createHttpError(403, 'You do not have access to this resource', 'FORBIDDEN'));
    }
    next();
  };
}

export const requireCustomer = requireRoles('CUSTOMER');
export const requireAdmin = requireRoles('ADMIN');
