import { NextResponse } from 'next/server';

export async function POST(req) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Razorpay not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' }, { status: 503 });
  }

  try {
    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount, currency = 'INR' } = await req.json();
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `rcpt_${Date.now().toString(36)}`,
    });

    return NextResponse.json({ order_id: order.id, amount: order.amount });
  } catch (e) {
    console.error('Razorpay create error:', e.message);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
