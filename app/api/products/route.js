import { NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get('tag');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const adminReq = isAdmin(req);

  try {
    let products = await getProducts();
    if (!adminReq) products = products.filter(p => p.in_stock !== false);
    if (tag) products = products.filter(p => p.tags?.includes(tag));
    const filtered = products;
    return NextResponse.json({ products: filtered.slice(0, limit), total: filtered.length });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  if (!data.name?.trim()) return NextResponse.json({ error: 'Product name is required' }, { status: 400 });

  try {
    const products = await getProducts();
    let slug = toSlug(data.name);
    let i = 1;
    while (products.some(p => p.slug === slug)) slug = `${toSlug(data.name)}-${i++}`;

    const product = await createProduct({
      id: `prod_${Date.now().toString(36)}`,
      slug,
      name: data.name.trim(),
      description: data.description?.trim() || '',
      price: data.price,
      sale_price: data.sale_price || null,
      shapes: data.shapes || [],
      lengths: data.lengths || [],
      finishes: data.finishes || [],
      tags: data.tags || [],
      images: data.images || [],
      in_stock: data.in_stock !== false,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
