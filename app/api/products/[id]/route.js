import { NextResponse } from 'next/server';
import { getProducts, saveProducts } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  const { id } = params;
  const products = await getProducts();
  const product = products.find(p => p.slug === id || p.id === id);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const related = products
    .filter(p => p.id !== product.id && p.in_stock && p.tags?.some(t => product.tags?.includes(t)))
    .slice(0, 4);

  return NextResponse.json({ product, related });
}

export async function PUT(req, { params }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const data = await req.json();
  const products = await getProducts();

  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  products[idx] = { ...products[idx], ...data, id: products[idx].id, slug: products[idx].slug };
  await saveProducts(products);
  return NextResponse.json({ product: products[idx] });
}

export async function DELETE(req, { params }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  await saveProducts(filtered);
  return NextResponse.json({ success: true });
}
