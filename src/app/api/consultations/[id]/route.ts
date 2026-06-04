import { NextResponse } from 'next/server';
import { apiDb } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const consultation = await apiDb.consultations.findUnique(id);
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }
    return NextResponse.json(consultation);
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
    if (body.appointmentTime) dataToUpdate.appointmentTime = new Date(body.appointmentTime).toISOString();

    const updated = await apiDb.consultations.update(id, dataToUpdate);
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
    const deleted = await apiDb.consultations.delete(id);
    return NextResponse.json(deleted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
