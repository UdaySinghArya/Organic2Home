import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { customerService } from '../services/customerService.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isCustomer } = useAuth();
  const [cart, setCart] = useState({ items: [], itemCount: 0, subtotal: 0, total: 0 });
  const [loading, setLoading] = useState(() => Boolean(isCustomer));
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!isCustomer) {
      setCart({ items: [], itemCount: 0, subtotal: 0, total: 0 });
      setError('');
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const data = await customerService.getCart();
      setCart(data.cart);
      setError('');
      return data.cart;
    } catch (err) {
      if (err.status === 401) {
        setCart({ items: [], itemCount: 0, subtotal: 0, total: 0 });
        setError('');
        return null;
      }
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const quantityFor = useCallback(
    (productId) => cart.items.find((item) => item.productId === productId)?.quantity || 0,
    [cart.items],
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      refresh,
      quantityFor,
      async add(productId, quantity = 1) {
        const data = await customerService.addCartItem({ productId, quantity });
        setCart(data.cart);
        return data.cart;
      },
      async setQuantity(productId, quantity) {
        if (quantity <= 0) {
          const data = await customerService.removeCartItem(productId);
          setCart(data.cart);
          return data.cart;
        }
        const data = await customerService.updateCartItem(productId, { quantity });
        setCart(data.cart);
        return data.cart;
      },
      async remove(productId) {
        const data = await customerService.removeCartItem(productId);
        setCart(data.cart);
        return data.cart;
      },
      async clear() {
        const data = await customerService.clearCart();
        setCart(data.cart);
        return data.cart;
      },
    }),
    [cart, loading, error, refresh, quantityFor],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
