'use client';
import { CartProvider } from '@/lib/CartContext';

export function Providers({ children }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}

export default Providers;
