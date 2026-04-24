'use client';
import { createContext, useContext, useState, useMemo } from 'react';
import { SHIPPING_THRESHOLD, SHIPPING_COST } from '@/lib/config';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = (product, options = {}, quantity = 1) => {
    // Normalize options — strip empty strings so {shape:'',length:''} matches {}
    const cleanOptions = Object.fromEntries(Object.entries(options).filter(([, v]) => v));
    const optionKey = JSON.stringify(cleanOptions);
    setCart(prev => {
      const existing = prev.find(
        item => item.productId === product.id && JSON.stringify(Object.fromEntries(Object.entries(item.options).filter(([, v]) => v))) === optionKey
      );
      if (existing) {
        return prev.map(item =>
          item.id === existing.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        id: `${product.id}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        quantity,
        options: cleanOptions,
        image: product.images?.[0] || null,
      }];
    });
  };

  const removeItem = (itemId) => setCart(prev => prev.filter(item => item.id !== itemId));

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) { removeItem(itemId); return; }
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const shipping = useMemo(
    () => subtotal === 0 ? 0 : subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST,
    [subtotal]
  );

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  return (
    <CartContext.Provider value={{
      cart, addItem, removeItem, updateQuantity, clearCart,
      subtotal, shipping, total,
      isCartOpen, setIsCartOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
