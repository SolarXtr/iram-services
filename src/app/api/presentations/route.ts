import { NextResponse } from 'next/server';
import { apiDb } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const presentations = await apiDb.presentations.findMany({ includeDeleted });
    return NextResponse.json(presentations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, conference, type, status, projectId, presenterId } = body;

    if (!title || !conference || !type || !presenterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPresentation = await apiDb.presentations.create({
      title,
      conference,
      type,
      status: status || 'PENDING',
      projectId: projectId || null,
      presenterId
    });

    return NextResponse.json(newPresentation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
