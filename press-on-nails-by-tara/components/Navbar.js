'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { ShoppingBag, X, Minus, Plus, Trash2, Sparkles, Menu } from 'lucide-react';
import { formatPrice } from '@/lib/config';

export default function Navbar() {
  const { cart, subtotal, shipping, total, updateQuantity, removeItem } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-tara-blush">
        <div className="container flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <Sparkles size={16} className="text-tara-gold" />
            <span className="font-serif text-tara-dark text-lg font-medium">Press On Nails By Tara</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-tara-muted">
            <Link href="/" className="hover:text-tara-pink transition-colors">Home</Link>
            <Link href="/shop" className="hover:text-tara-pink transition-colors">Shop</Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-tara-blush transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag size={22} className="text-tara-dark" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-tara-pink text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-tara-blush transition-colors"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-tara-blush bg-white px-6 py-4 flex flex-col gap-4 text-sm font-medium">
            <Link href="/" onClick={() => setMenuOpen(false)} className="text-tara-dark hover:text-tara-pink">Home</Link>
            <Link href="/shop" onClick={() => setMenuOpen(false)} className="text-tara-dark hover:text-tara-pink">Shop</Link>
          </div>
        )}
      </header>

      {/* Cart Drawer Overlay */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-tara-blush">
              <h2 className="font-serif text-lg text-tara-dark">
                Your Cart {itemCount > 0 && <span className="text-tara-pink text-base">({itemCount})</span>}
              </h2>
              <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-full hover:bg-tara-blush transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">💅</div>
                  <p className="text-tara-muted text-sm">Your cart is empty</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-4 text-tara-pink text-sm font-medium hover:underline"
                  >
                    Start shopping →
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-tara-blush flex-shrink-0">
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">💅</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-medium text-tara-dark line-clamp-1">{item.name}</p>
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </div>
                      {(item.options?.shape || item.options?.length) && (
                        <p className="text-xs text-tara-muted capitalize">
                          {[item.options.shape, item.options.length].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-full bg-tara-blush hover:bg-tara-pink hover:text-white text-tara-pink flex items-center justify-center transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-semibold text-tara-dark w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-full bg-tara-blush hover:bg-tara-pink hover:text-white text-tara-pink flex items-center justify-center transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-tara-pink">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-tara-blush px-5 py-4 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-tara-muted">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-tara-muted">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'FREE 🎉' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-1.5 border-t border-tara-blush">
                    <span>Total</span>
                    <span className="text-tara-pink">{formatPrice(total)}</span>
                  </div>
                </div>
                <Link href="/checkout" onClick={() => setCartOpen(false)}>
                  <button className="w-full bg-tara-pink text-white font-semibold py-3.5 rounded-2xl hover:bg-[#b5697a] transition-colors text-sm">
                    Checkout — {formatPrice(total)}
                  </button>
                </Link>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full text-tara-muted text-xs hover:text-tara-pink transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
