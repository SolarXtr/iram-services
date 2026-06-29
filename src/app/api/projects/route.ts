import { NextResponse } from 'next/server';
import { apiDb } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const projects = await apiDb.projects.findMany({ includeDeleted });
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      title, 
      status, 
      budgetInitial, 
      budgetSpent, 
      startDate, 
      endDate, 
      leaderId,
      ceuConsultDate,
      irbNo,
      approvedDate
    } = body;

    if (!title || !status || budgetInitial === undefined || !startDate || !endDate || !leaderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newProject = await apiDb.projects.create({
      title,
      status,
      budgetInitial: Number(budgetInitial),
      budgetSpent: Number(budgetSpent || 0),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      leaderId,
      ceuConsultDate: ceuConsultDate ? new Date(ceuConsultDate).toISOString() : null,
      irbNo: irbNo || null,
      approvedDate: approvedDate ? new Date(approvedDate).toISOString() : null
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
