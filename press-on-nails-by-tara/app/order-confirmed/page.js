'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, MessageCircle, ShoppingBag } from 'lucide-react';
import { WHATSAPP_NUMBER, WHATSAPP_PREORDER_MSG } from '@/lib/config';
import { Suspense } from 'react';

function OrderContent() {
  const params = useSearchParams();
  const orderNum = params.get('order') || 'TN-XXXXXXXX';

  return (
    <div className="min-h-screen bg-tara-ivory flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="font-serif text-3xl text-tara-dark mb-2">Order Confirmed!</h1>
        <p className="text-tara-muted mb-1 text-sm">Your order number is:</p>
        <p className="font-bold text-tara-pink text-2xl mb-4">{orderNum}</p>
        <p className="text-sm text-tara-muted leading-relaxed mb-8">
          Thank you for your order! We'll hand-pack your nails with care and ship within 3–5 business days. You'll receive updates on WhatsApp.
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_PREORDER_MSG(orderNum))}`}
          target="_blank" rel="noopener noreferrer"
          className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-2xl mb-3 transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle size={18} /> Track on WhatsApp
        </a>
        <Link href="/shop">
          <button className="w-full border-2 border-tara-blush text-tara-dark font-medium py-3.5 rounded-2xl hover:border-tara-pink hover:text-tara-pink transition-colors flex items-center justify-center gap-2">
            <ShoppingBag size={16} /> Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-tara-ivory flex items-center justify-center"><div className="text-4xl animate-bounce">💅</div></div>}>
      <OrderContent />
    </Suspense>
  );
}
