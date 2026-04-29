import { NextResponse } from 'next/server';
import { getOrders, saveOrders } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function PUT(req, { params }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const data = await req.json();
  const orders = await getOrders();

  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  orders[idx] = { ...orders[idx], ...data, id: orders[idx].id };
  await saveOrders(orders);
  return NextResponse.json({ order: orders[idx] });
}
