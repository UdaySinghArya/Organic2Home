import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { getTomorrowHarvest, packHarvestItem, pickHarvestItem } from '../controllers/harvest.controller.js';

export const harvestRouter = Router();

harvestRouter.use(requireAuth, requireAdmin);
harvestRouter.get('/tomorrow', getTomorrowHarvest);
harvestRouter.patch('/:id/pick', pickHarvestItem);
harvestRouter.patch('/:id/pack', packHarvestItem);
