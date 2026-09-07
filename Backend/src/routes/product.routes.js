import { Router } from 'express';
import {
  getCustomerProduct,
  listCategories,
  listCustomerProducts,
} from '../controllers/product.controller.js';

export const productRouter = Router();

productRouter.get('/categories', listCategories);
productRouter.get('/', listCustomerProducts);
productRouter.get('/:id', getCustomerProduct);
