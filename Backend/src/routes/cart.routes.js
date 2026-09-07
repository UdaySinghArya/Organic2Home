import { Router } from 'express';
import { requireAuth, requireCustomer } from '../middleware/auth.js';
import {
  addCartItem,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../controllers/cart.controller.js';

export const cartRouter = Router();

cartRouter.use(requireAuth, requireCustomer);
cartRouter.get('/', getCart);
cartRouter.post('/items', addCartItem);
cartRouter.put('/items/:productId', updateCartItem);
cartRouter.delete('/items/:productId', removeCartItem);
cartRouter.delete('/', clearCart);
