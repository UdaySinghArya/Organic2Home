import { User } from '../models/User.js';
import { createHttpError } from '../middleware/errorHandler.js';
import { publicProfile } from '../utils/public.js';

export async function getProfile(req, res) {
  res.json({
    success: true,
    data: { profile: publicProfile(req.user) },
  });
}

export async function updateProfile(req, res, next) {
  try {
    const name = req.body.name !== undefined ? String(req.body.name || '').trim() : undefined;
    const email = req.body.email !== undefined ? String(req.body.email || '').trim().toLowerCase() : undefined;

    if (name !== undefined && !name) {
      throw createHttpError(400, 'Name cannot be empty', 'INVALID_NAME');
    }
    if (email !== undefined && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw createHttpError(400, 'Please enter a valid email', 'INVALID_EMAIL');
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email || undefined;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    res.json({
      success: true,
      data: { profile: publicProfile(user) },
    });
  } catch (err) {
    next(err);
  }
}
