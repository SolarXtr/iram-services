import { NextResponse } from 'next/server';
import { isMock } from '@/lib/apiDb';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ isMock });
}
