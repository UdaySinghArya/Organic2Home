import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getFarmerOrder, listFarmerOrders, patchFarmerOrderStatus } from '../controllers/farmerOrder.controller.js';

export const farmerOrderRouter = Router();

farmerOrderRouter.use(requireAuth, requireAdmin);
farmerOrderRouter.get('/', listFarmerOrders);
farmerOrderRouter.get('/:id', getFarmerOrder);
farmerOrderRouter.patch('/:id/status', patchFarmerOrderStatus);
