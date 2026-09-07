import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { profileRouter } from './routes/profile.routes.js';
import { addressRouter } from './routes/address.routes.js';
import { productRouter } from './routes/product.routes.js';
import { farmerProductRouter } from './routes/farmerProduct.routes.js';
import { listCategories } from './controllers/product.controller.js';
import { cartRouter } from './routes/cart.routes.js';
import { orderRouter } from './routes/order.routes.js';
import { paymentRouter } from './routes/payment.routes.js';
import { harvestRouter } from './routes/harvest.routes.js';
import { farmerOrderRouter } from './routes/farmerOrder.routes.js';
import { docsRouter } from './routes/docs.routes.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.use('/api/health', healthRouter);
  app.use('/api/docs', docsRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/addresses', addressRouter);
  app.get('/api/categories', listCategories);
  app.use('/api/products', productRouter);
  app.use('/api/farmer/products', farmerProductRouter);
  app.use('/api/farmer/harvest', harvestRouter);
  app.use('/api/farmer/orders', farmerOrderRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/payments', paymentRouter);

  app.use(errorHandler);
  return app;
}
