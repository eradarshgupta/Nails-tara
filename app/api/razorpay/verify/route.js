import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createOrder } from '@/lib/db';

export async function POST(req) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = await req.json();

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  const order = await createOrder({
    id: `ord_${Date.now().toString(36)}`,
    order_number: `TN${Date.now().toString(36).toUpperCase()}`,
    ...orderData,
    payment_method: 'razorpay',
    payment_status: 'paid',
    razorpay_order_id,
    razorpay_payment_id,
    order_status: 'processing',
  });

  return NextResponse.json({ order });
}
