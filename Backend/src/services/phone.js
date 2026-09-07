import { User } from '../models/User.js';
import { Admin } from '../models/Admin.js';

export const PHONE_RE = /^[6-9]\d{9}$/;

export function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '').slice(-10);
}

export async function findAccountByPhone(phone) {
  const [user, admin] = await Promise.all([User.findOne({ phone }), Admin.findOne({ phone })]);
  if (user) return { account: user, role: 'CUSTOMER' };
  if (admin) return { account: admin, role: 'ADMIN' };
  return { account: null, role: null };
}
