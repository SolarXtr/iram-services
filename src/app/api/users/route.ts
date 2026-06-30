import { NextResponse } from 'next/server';
import { apiDb } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const users = await apiDb.users.findMany({ includeDeleted });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, title, firstName, lastName } = body;
    if ((!name && (!firstName || !lastName)) || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newUser = await apiDb.users.create({ name, email, role, title, firstName, lastName });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
