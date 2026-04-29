import { NextResponse } from 'next/server';
import { createToken } from '@/lib/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@taranails.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Tara@2024';

export async function POST(req) {
  const { email, password } = await req.json();

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = createToken({ role: 'admin', email });
  return NextResponse.json({ token });
}
