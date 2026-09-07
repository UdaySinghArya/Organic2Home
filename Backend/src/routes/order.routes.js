import { Router } from 'express';
import { requireAuth, requireCustomer } from '../middleware/auth.js';
import { createOrder, getOrder, listOrders } from '../controllers/order.controller.js';

export const orderRouter = Router();

orderRouter.use(requireAuth, requireCustomer);
orderRouter.post('/', createOrder);
orderRouter.get('/', listOrders);
orderRouter.get('/:id', getOrder);
