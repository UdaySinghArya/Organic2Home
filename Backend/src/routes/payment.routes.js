import { Router } from 'express';
import { requireAuth, requireCustomer } from '../middleware/auth.js';
import {
  cancel,
  confirmDev,
  getByOrder,
  initiate,
  payWithCod,
  timeout,
  verify,
  webhook,
} from '../controllers/payment.controller.js';

export const paymentRouter = Router();

paymentRouter.post('/webhook', webhook);

paymentRouter.use(requireAuth, requireCustomer);
paymentRouter.post('/initiate', initiate);
paymentRouter.post('/verify', verify);
paymentRouter.post('/dev/confirm', confirmDev);
paymentRouter.post('/cancel', cancel);
paymentRouter.post('/timeout', timeout);
paymentRouter.post('/cod', payWithCod);
paymentRouter.get('/order/:orderId', getByOrder);
