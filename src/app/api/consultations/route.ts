import { NextResponse } from 'next/server';
import { apiDb } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const consultations = await apiDb.consultations.findMany({ includeDeleted });
    return NextResponse.json(consultations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      type, 
      appointmentTime, 
      status, 
      advisorId, 
      requesterId 
    } = body;

    if (!type || !appointmentTime || !advisorId || !requesterId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newConsultation = await apiDb.consultations.create({
      type,
      appointmentTime: new Date(appointmentTime).toISOString(),
      status: status || 'SCHEDULED',
      advisorId,
      requesterId
    });

    return NextResponse.json(newConsultation, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
