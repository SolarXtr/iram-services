import { NextResponse } from 'next/server';
import { apiDb } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const publications = await apiDb.publications.findMany({ includeDeleted });
    return NextResponse.json(publications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      journal, 
      quartile, 
      rewardStatus, 
      rewardAmount, 
      projectId, 
      authorId 
    } = body;

    if (!title || !journal || !quartile || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPublication = await apiDb.publications.create({
      title,
      journal,
      quartile,
      rewardStatus: rewardStatus || 'PENDING',
      rewardAmount: rewardAmount !== undefined ? Number(rewardAmount) : 0,
      status: body.status || 'WRITING',
      projectId: projectId || null,
      authorId
    });

    return NextResponse.json(newPublication, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
