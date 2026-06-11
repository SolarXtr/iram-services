import { NextResponse } from 'next/server';
import { apiDb } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const publication = await apiDb.publications.findUnique(id);
    if (!publication) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 });
    }
    return NextResponse.json(publication);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const dataToUpdate: any = { ...body };
    if (body.rewardAmount !== undefined) dataToUpdate.rewardAmount = Number(body.rewardAmount);

    const updated = await apiDb.publications.update(id, dataToUpdate);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await apiDb.publications.delete(id);
    return NextResponse.json(deleted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
