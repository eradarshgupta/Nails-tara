import { NextResponse } from 'next/server';
import { getProducts, getOrders } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [products, orders] = await Promise.all([getProducts(), getOrders()]);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;

  const ordersToday = orders.filter(o => new Date(o.created_at).getTime() >= todayStart).length;
  const weekRevenue = orders
    .filter(o => new Date(o.created_at).getTime() >= weekStart && o.payment_status === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
  const totalProducts = products.length;

  return NextResponse.json({ ordersToday, weekRevenue, pendingOrders, totalProducts });
}
