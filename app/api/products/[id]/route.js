import { NextResponse } from 'next/server';
import { getProducts, getProductBySlugOrId, updateProduct, deleteProduct } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  const { id } = params;
  try {
    const product = await getProductBySlugOrId(id);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const all = await getProducts();
    const related = all
      .filter(p => p.id !== product.id && p.in_stock && p.tags?.some(t => product.tags?.includes(t)))
      .slice(0, 4);

    return NextResponse.json({ product, related });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const data = await req.json();
  try {
    const product = await updateProduct(id, data);
    return NextResponse.json({ product });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  try {
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
