import { NextResponse } from 'next/server';
import { apiDb } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await apiDb.projects.findUnique(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project);
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
    
    // Parse dates and numbers if present
    const dataToUpdate: any = { ...body };
    if (body.budgetInitial !== undefined) dataToUpdate.budgetInitial = Number(body.budgetInitial);
    if (body.budgetSpent !== undefined) dataToUpdate.budgetSpent = Number(body.budgetSpent);
    if (body.startDate) dataToUpdate.startDate = new Date(body.startDate).toISOString();
    if (body.endDate) dataToUpdate.endDate = new Date(body.endDate).toISOString();
    if (body.ceuConsultDate !== undefined) {
      dataToUpdate.ceuConsultDate = body.ceuConsultDate ? new Date(body.ceuConsultDate).toISOString() : null;
    }
    if (body.approvedDate !== undefined) {
      dataToUpdate.approvedDate = body.approvedDate ? new Date(body.approvedDate).toISOString() : null;
    }

    const updated = await apiDb.projects.update(id, dataToUpdate);
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
    const deleted = await apiDb.projects.delete(id);
    return NextResponse.json(deleted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
