import { Router } from 'express';
import { requireAuth, requireCustomer } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';

export const profileRouter = Router();

profileRouter.use(requireAuth, requireCustomer);
profileRouter.get('/', getProfile);
profileRouter.put('/', updateProfile);
