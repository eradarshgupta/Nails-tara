import { NextResponse } from 'next/server';
import { updateOrder } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function PUT(req, { params }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const data = await req.json();
  try {
    const order = await updateOrder(id, data);
    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
