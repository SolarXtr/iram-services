import { NextResponse } from 'next/server';
import { dbQuery } from '@/lib/db';
import { getIsMock, apiDb } from '@/lib/apiDb';

export const runtime = 'edge';

const TABLE_SCHEMAS: Record<string, { name: string; type: string; pk: boolean }[]> = {
  irUser: [
    { name: 'id', type: 'TEXT', pk: true },
    { name: 'name', type: 'TEXT', pk: false },
    { name: 'email', type: 'TEXT', pk: false },
    { name: 'role', type: 'TEXT', pk: false },
    { name: 'createdAt', type: 'TEXT', pk: false },
    { name: 'updatedAt', type: 'TEXT', pk: false },
  ],
  irResearchProject: [
    { name: 'id', type: 'TEXT', pk: true },
    { name: 'title', type: 'TEXT', pk: false },
    { name: 'status', type: 'TEXT', pk: false },
    { name: 'budgetInitial', type: 'REAL', pk: false },
    { name: 'budgetSpent', type: 'REAL', pk: false },
    { name: 'startDate', type: 'TEXT', pk: false },
    { name: 'endDate', type: 'TEXT', pk: false },
    { name: 'ceuConsultDate', type: 'TEXT', pk: false },
    { name: 'irbNo', type: 'TEXT', pk: false },
    { name: 'approvedDate', type: 'TEXT', pk: false },
    { name: 'department', type: 'TEXT', pk: false },
    { name: 'leaderId', type: 'TEXT', pk: false },
    { name: 'createdAt', type: 'TEXT', pk: false },
    { name: 'updatedAt', type: 'TEXT', pk: false },
  ],
  irPublication: [
    { name: 'id', type: 'TEXT', pk: true },
    { name: 'title', type: 'TEXT', pk: false },
    { name: 'journal', type: 'TEXT', pk: false },
    { name: 'quartile', type: 'TEXT', pk: false },
    { name: 'rewardStatus', type: 'TEXT', pk: false },
    { name: 'rewardAmount', type: 'REAL', pk: false },
    { name: 'status', type: 'TEXT', pk: false },
    { name: 'projectId', type: 'TEXT', pk: false },
    { name: 'authorId', type: 'TEXT', pk: false },
    { name: 'createdAt', type: 'TEXT', pk: false },
    { name: 'updatedAt', type: 'TEXT', pk: false },
  ],
  irPresentation: [
    { name: 'id', type: 'TEXT', pk: true },
    { name: 'title', type: 'TEXT', pk: false },
    { name: 'conference', type: 'TEXT', pk: false },
    { name: 'type', type: 'TEXT', pk: false },
    { name: 'status', type: 'TEXT', pk: false },
    { name: 'projectId', type: 'TEXT', pk: false },
    { name: 'presenterId', type: 'TEXT', pk: false },
    { name: 'createdAt', type: 'TEXT', pk: false },
    { name: 'updatedAt', type: 'TEXT', pk: false },
  ],
  irConsultation: [
    { name: 'id', type: 'TEXT', pk: true },
    { name: 'type', type: 'TEXT', pk: false },
    { name: 'appointmentTime', type: 'TEXT', pk: false },
    { name: 'status', type: 'TEXT', pk: false },
    { name: 'advisorId', type: 'TEXT', pk: false },
    { name: 'requesterId', type: 'TEXT', pk: false },
    { name: 'createdAt', type: 'TEXT', pk: false },
    { name: 'updatedAt', type: 'TEXT', pk: false },
  ]
};

// Maps D1 table names to apiDb handler keys for mock fallback
const TABLE_MOCK_MAP: Record<string, string> = {
  irUser: 'users',
  irResearchProject: 'projects',
  irPublication: 'publications',
  irPresentation: 'presentations',
  irConsultation: 'consultations'
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeTable = searchParams.get('table') || 'irUser';
  
  const isMock = getIsMock();

  try {
    let tables: { name: string; rowCount: number }[] = [];
    let tableData: any[] = [];
    let schema = TABLE_SCHEMAS[activeTable] || [];

    if (isMock) {
      // Fetch mock counts and mock records
      tables = await Promise.all(
        Object.keys(TABLE_SCHEMAS).map(async (tableName) => {
          const handlerKey = TABLE_MOCK_MAP[tableName];
          let count = 0;
          try {
            const list = await apiDb[handlerKey].findMany();
            count = list.length;
          } catch (e) {}
          return { name: tableName, rowCount: count };
        })
      );

      const handlerKey = TABLE_MOCK_MAP[activeTable];
      if (handlerKey) {
        tableData = await apiDb[handlerKey].findMany();
      }
    } else {
      // Query SQLite/D1 for actual live tables
      const tablesRes = await dbQuery("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      const rawTables = tablesRes.rows.map((r: any) => r.name);

      tables = await Promise.all(
        rawTables.map(async (tableName: string) => {
          try {
            const countRes = await dbQuery(`SELECT COUNT(*) as cnt FROM "${tableName}"`);
            const count = countRes.rows[0]?.cnt || 0;
            return { name: tableName, rowCount: Number(count) };
          } catch (e) {
            return { name: tableName, rowCount: 0 };
          }
        })
      );

      // Query D1 table schema info dynamically
      try {
        const infoRes = await dbQuery(`PRAGMA table_info("${activeTable}")`);
        if (infoRes.rows && infoRes.rows.length > 0) {
          schema = infoRes.rows.map((col: any) => ({
            name: col.name,
            type: col.type,
            pk: col.pk === 1
          }));
        }
      } catch (e) {
        // Fallback to static schema if PRAGMA fails
      }

      // Query D1 table rows
      const dataRes = await dbQuery(`SELECT * FROM "${activeTable}" LIMIT 100`);
      tableData = dataRes.rows;
    }

    return NextResponse.json({
      status: 'success',
      isMock,
      tables,
      schema,
      activeTable,
      tableData
    });
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: err.message || err.toString()
    }, { status: 500 });
  }
}
