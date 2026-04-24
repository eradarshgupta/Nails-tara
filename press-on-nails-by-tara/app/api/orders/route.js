import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orders = await getOrders();
  return NextResponse.json({ orders });
}

export async function POST(req) {
  const data = await req.json();

  if (!data.customer_name || !data.customer_phone) {
    return NextResponse.json({ error: 'Customer details are required' }, { status: 400 });
  }

  try {
    const order = await createOrder({
      id: `ord_${Date.now().toString(36)}`,
      order_number: `TN${Date.now().toString(36).toUpperCase()}`,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      delivery_address: data.delivery_address,
      items: data.items || [],
      subtotal: data.subtotal,
      shipping: data.shipping,
      total: data.total,
      payment_method: 'cod',
      payment_status: 'pending',
      order_status: 'pending',
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
