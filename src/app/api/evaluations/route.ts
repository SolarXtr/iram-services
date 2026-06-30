import { NextResponse } from 'next/server';
import { apiDb, ensureMigrations } from '@/lib/apiDb';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    await ensureMigrations();
    const { searchParams } = new URL(request.url);
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const evaluatorId = searchParams.get('evaluatorId');
    const projectId = searchParams.get('projectId');
    
    let evaluations = await apiDb.evaluations.findMany({ includeDeleted });
    
    if (evaluatorId) {
      evaluations = evaluations.filter((e: any) => e.evaluatorId === evaluatorId);
    }
    if (projectId) {
      evaluations = evaluations.filter((e: any) => e.projectId === projectId);
    }
    
    return NextResponse.json(evaluations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureMigrations();
    const body = await request.json();
    const { projectId, evaluatorId, evaluatorType } = body;

    if (!projectId || !evaluatorId) {
      return NextResponse.json({ error: 'Missing projectId or evaluatorId' }, { status: 400 });
    }

    // Check if assignment already exists
    const existing = await apiDb.evaluations.findMany();
    const isDuplicate = existing.some((e: any) => e.projectId === projectId && e.evaluatorId === evaluatorId && !e.isDeleted);
    if (isDuplicate) {
      return NextResponse.json({ error: 'Evaluator is already assigned to this project' }, { status: 400 });
    }

    const newEval = await apiDb.evaluations.create({
      projectId,
      evaluatorId,
      evaluatorType: evaluatorType || 'INTERNAL',
      status: 'DRAFT'
    });

    return NextResponse.json(newEval, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
