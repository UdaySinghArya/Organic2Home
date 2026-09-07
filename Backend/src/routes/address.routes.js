import { Router } from 'express';
import { requireAuth, requireCustomer } from '../middleware/auth.js';
import {
  createAddress,
  deleteAddress,
  getAddress,
  listAddresses,
  updateAddress,
} from '../controllers/address.controller.js';

export const addressRouter = Router();

addressRouter.use(requireAuth, requireCustomer);
addressRouter.get('/', listAddresses);
addressRouter.post('/', createAddress);
addressRouter.get('/:id', getAddress);
addressRouter.put('/:id', updateAddress);
addressRouter.delete('/:id', deleteAddress);
