import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Image storage not configured. Add BLOB_READ_WRITE_TOKEN in Vercel dashboard (Storage → Blob).' },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const { put } = await import('@vercel/blob');
  const blob = await put(`products/${Date.now()}-${file.name}`, file, { access: 'public' });
  return NextResponse.json({ url: blob.url });
}
