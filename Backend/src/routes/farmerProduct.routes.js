import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  createFarmerProduct,
  deleteFarmerProduct,
  getFarmerProduct,
  listFarmerProducts,
  patchFarmerProductStatus,
  updateFarmerProduct,
} from '../controllers/farmerProduct.controller.js';

export const farmerProductRouter = Router();

farmerProductRouter.use(requireAuth, requireAdmin);
farmerProductRouter.get('/', listFarmerProducts);
farmerProductRouter.post('/', createFarmerProduct);
farmerProductRouter.get('/:id', getFarmerProduct);
farmerProductRouter.put('/:id', updateFarmerProduct);
farmerProductRouter.patch('/:id/status', patchFarmerProductStatus);
farmerProductRouter.delete('/:id', deleteFarmerProduct);
