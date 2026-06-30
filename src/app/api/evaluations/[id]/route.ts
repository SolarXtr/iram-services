import { NextResponse } from 'next/server';
import { apiDb, ensureMigrations } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureMigrations();
    const evaluation = await apiDb.evaluations.findUnique(params.id);
    if (!evaluation) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }
    return NextResponse.json(evaluation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureMigrations();
    const body = await request.json();
    const updated = await apiDb.evaluations.update(params.id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureMigrations();
    const deleted = await apiDb.evaluations.delete(params.id);
    return NextResponse.json(deleted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
