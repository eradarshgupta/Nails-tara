import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

export async function GET(req) {
  if (!isAdmin(req)) return NextResponse.json({ valid: false }, { status: 401 });
  return NextResponse.json({ valid: true });
}
