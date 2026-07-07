import { mockDb } from './mockDb';
import { dbQuery } from './db';

let getRequestContext: any = null;
import('@cloudflare/next-on-pages')
  .then((m) => {
    getRequestContext = m.getRequestContext;
  })
  .catch(() => {});

// Helper to safely get request context without crashing Next.js Edge compiler
const safeGetRequestContext = () => {
  try {
    if (getRequestContext) {
      const ctx = getRequestContext();
      if (ctx) return ctx;
    }
  } catch (e) {
    // Ignore
  }
  try {
    const symbol = Symbol.for('__cloudflare-request-context__');
    return (globalThis as any)[symbol] || null;
  } catch (e) {
    return null;
  }
};

/**
 * Determine if we should use Mock database
 * Returns true when D1 is not available (development/local)
 * Returns false when D1 is available (production on Cloudflare Pages/Workers)
 */
export const getIsMock = () => {
  try {
    const ctx = safeGetRequestContext();
    return !(ctx && ctx.env && (ctx.env as any).DB);
  } catch (e) {
    return true;
  }
};

// Date formatter helper to match ISO string formatting
const toIsoString = (val: any) => {
  if (!val) return val;
  return new Date(val).toISOString();
};

import { headers } from 'next/headers';

// Helper to safely get performedBy from HTTP headers
const getPerformedByFromHeaders = () => {
  try {
    const headerList = headers();
    return headerList.get('x-performed-by') || null;
  } catch (e) {
    return null;
  }
};

// Helper to write audit logs to Cloudflare D1
const writeRealAuditLog = async (
  tableName: string,
  recordId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  oldData: any,
  newData: any,
  performedBy?: string | null
) => {
  try {
    let actor = performedBy;
    if (!actor) {
      actor = getPerformedByFromHeaders();
    }
    const id = crypto.randomUUID();
    await dbQuery(
      'INSERT INTO "irAuditLog" (id, "tableName", "recordId", action, "oldData", "newData", "performedBy", timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)',
      [
        id,
        tableName,
        recordId,
        action,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        actor || 'system',
      ]
    );
  } catch (e) {
    console.error('Audit logging failed', e);
  }
};

export const splitThaiName = (fullName: string) => {
  if (!fullName) return { title: '', firstName: '', lastName: '' };
  const prefixes = [
    'ศ.ดร.นพ.', 'ศ.ดร.พญ.', 'ศ.ดร.', 'รศ.ดร.นพ.', 'รศ.ดร.พญ.', 'รศ.ดร.', 'ผศ.ดร.นพ.', 'ผศ.ดร.พญ.', 'ผศ.ดร.',
    'ศ.นพ.', 'ศ.พญ.', 'ศ.', 'รศ.นพ.', 'รศ.พญ.', 'รศ.', 'ผศ.นพ.', 'ผศ.พญ.', 'ผศ.',
    'ดร.นพ.', 'ดร.พญ.', 'ดร.', 'นพ.', 'พญ.', 'นายแพทย์', 'แพทย์หญิง', 'นาย', 'นางสาว', 'นาง'
  ];
  let cleanName = fullName.trim();
  let matchedPrefix = '';
  for (const p of prefixes) {
    if (cleanName.startsWith(p)) {
      matchedPrefix = p;
      cleanName = cleanName.slice(p.length).trim();
      break;
    }
  }
  const parts = cleanName.split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { title: matchedPrefix, firstName, lastName };
};

// Migrate D1 database table columns if they do not exist
let migrated = false;
export const ensureMigrations = async () => {
  if (migrated || getIsMock()) return;
  try {
    await dbQuery('ALTER TABLE "irUser" ADD COLUMN "title" TEXT');
  } catch (e) {}
  try {
    await dbQuery('ALTER TABLE "irUser" ADD COLUMN "firstName" TEXT');
  } catch (e) {}
  try {
    await dbQuery('ALTER TABLE "irUser" ADD COLUMN "lastName" TEXT');
  } catch (e) {}
  try {
    const checkRes = await dbQuery('SELECT id, name FROM "irUser" WHERE "firstName" IS NULL OR "firstName" = \'\'');
    for (const r of checkRes.rows) {
      const { title, firstName, lastName } = splitThaiName(r.name);
      await dbQuery('UPDATE "irUser" SET "title" = $1, "firstName" = $2, "lastName" = $3 WHERE id = $4', [
        title, firstName, lastName, r.id
      ]);
    }
  } catch (e) {
    console.error("Auto-migration name splitting failed:", e);
  }
  try {
    await dbQuery('ALTER TABLE "irResearchProject" ADD COLUMN "ceuConsultId" TEXT');
  } catch (e) {
    // Ignore error if column already exists
  }
  try {
    await dbQuery('ALTER TABLE "irResearchProject" ADD COLUMN "ceuBypassReason" TEXT');
  } catch (e) {
    // Ignore error if column already exists
  }
  try {
    await dbQuery('ALTER TABLE "irResearchProject" ADD COLUMN "attachmentName" TEXT');
  } catch (e) {}
  try {
    await dbQuery('ALTER TABLE "irResearchProject" ADD COLUMN "attachmentData" TEXT');
  } catch (e) {}
  try {
    await dbQuery('ALTER TABLE "irPublication" ADD COLUMN "attachmentName" TEXT');
  } catch (e) {}
  try {
    await dbQuery('ALTER TABLE "irPublication" ADD COLUMN "attachmentData" TEXT');
  } catch (e) {}
  try {
    await dbQuery('ALTER TABLE "irPresentation" ADD COLUMN "attachmentName" TEXT');
  } catch (e) {}
  try {
    await dbQuery('ALTER TABLE "irPresentation" ADD COLUMN "attachmentData" TEXT');
  } catch (e) {}
  try {
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS "irProposalEvaluation" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "evaluatorId" TEXT NOT NULL,
        "evaluatorType" TEXT,
        "feedbackResearchProcess" TEXT,
        "feedbackOriginality" TEXT,
        "feedbackExpectedOutput" TEXT,
        "feedbackBudgetAppropriate" TEXT,
        "scoreOverallQuality" INTEGER,
        "bankAccountName" TEXT,
        "bankName" TEXT,
        "bankBranch" TEXT,
        "bankAccountNumber" TEXT,
        "bankBookAttachmentName" TEXT,
        "bankBookAttachmentData" TEXT,
        "status" TEXT DEFAULT 'DRAFT',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (e) {
    console.error("Migration error creating irProposalEvaluation:", e);
  }
  migrated = true;
};

// Helper to map and decode user roles in D1 records
const mapUserRoles = (u: any) => {
  if (!u) return u;
  return {
    ...u,
    roles: u.role ? u.role.split(',') : [],
    isDeleted: u.isDeleted === 1 || u.isDeleted === true || u.isDeleted === '1',
  };
};

// Database handlers for D1 (Production)
const realDbHandlers = {
  users: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const includeDeleted = options?.includeDeleted ?? false;
      const sql = includeDeleted
        ? 'SELECT id, name, email, role, title, "firstName", "lastName", "isDeleted", "createdAt", "updatedAt" FROM "irUser" ORDER BY "firstName" ASC'
        : 'SELECT id, name, email, role, title, "firstName", "lastName", "isDeleted", "createdAt", "updatedAt" FROM "irUser" WHERE "isDeleted" = 0 OR "isDeleted" IS NULL ORDER BY "firstName" ASC';
      const res = await dbQuery(sql);
      return res.rows.map((r: any) => mapUserRoles({
        ...r,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
      }));
    },
    findUnique: async (id: string) => {
      const res = await dbQuery('SELECT id, name, email, role, title, "firstName", "lastName", "isDeleted", "createdAt", "updatedAt" FROM "irUser" WHERE id = $1', [id]);
      const r = res.rows[0];
      if (!r) return null;
      return mapUserRoles({
        ...r,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
      });
    },
    create: async (data: any, performedBy?: string | null) => {
      const id = data.id || crypto.randomUUID();
      const title = data.title || '';
      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      const name = data.name || `${title} ${firstName} ${lastName}`.trim().replace(/\s+/, ' ');
      const res = await dbQuery(
        'INSERT INTO "irUser" (id, name, email, role, title, "firstName", "lastName", "isDeleted", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
        [id, name, data.email, data.role, title, firstName, lastName]
      );
      const r = res.rows[0];
      const result = mapUserRoles({
        ...r,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
      });
      await writeRealAuditLog('irUser', id, 'CREATE', null, result, performedBy);
      return result;
    },
    update: async (id: string, data: any, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irUser" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw new Error('User not found');
      
      const title = data.title !== undefined ? data.title : current.title;
      const firstName = data.firstName !== undefined ? data.firstName : current.firstName;
      const lastName = data.lastName !== undefined ? data.lastName : current.lastName;
      const name = data.name || `${title} ${firstName} ${lastName}`.trim().replace(/\s+/, ' ');
      const email = data.email !== undefined ? data.email : current.email;
      const role = data.role !== undefined ? data.role : current.role;
      const isDeleted = data.isDeleted !== undefined ? (data.isDeleted ? 1 : 0) : (current.isDeleted === 1 || current.isDeleted === true || current.isDeleted === '1' ? 1 : 0);

      const res = await dbQuery(
        'UPDATE "irUser" SET name = $1, email = $2, role = $3, title = $4, "firstName" = $5, "lastName" = $6, "isDeleted" = $7, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
        [name, email, role, title, firstName, lastName, isDeleted, id]
      );
      const r = res.rows[0];
      const result = mapUserRoles({
        ...r,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
      });
      await writeRealAuditLog('irUser', id, 'UPDATE', current, result, performedBy);
      return result;
    },
    delete: async (id: string, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irUser" WHERE id = $1 AND ("isDeleted" = 0 OR "isDeleted" IS NULL)', [id]);
      const current = currentRes.rows[0];
      if (!current) return null;

      // Check if user has active projects (status APPROVED or ONGOING and isDeleted = 0)
      const activeProjRes = await dbQuery(
        'SELECT id FROM "irResearchProject" WHERE "leaderId" = $1 AND ("isDeleted" = 0 OR "isDeleted" IS NULL) AND (status = \'APPROVED\' OR status = \'ONGOING\') LIMIT 1',
        [id]
      );
      if (activeProjRes.rows.length > 0) {
        throw new Error('ไม่สามารถลบนักวิจัยรายนี้ได้ เนื่องจากยังมีโครงการวิจัยที่กำลังดำเนินงานอยู่ กรุณาทำการโอนย้ายโครงการวิจัยให้ผู้อื่นดูแลแทนก่อนลบ');
      }

      const res = await dbQuery('UPDATE "irUser" SET "isDeleted" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
      const r = res.rows[0];
      const result = mapUserRoles({
        ...r,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
      });
      await writeRealAuditLog('irUser', id, 'DELETE', current, null, performedBy);
      return result;
    },
  },
  projects: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      await ensureMigrations();
      const includeDeleted = options?.includeDeleted ?? false;
      const sql = `
        SELECT p.*, 
               u.name as "leaderName", u.email as "leaderEmail", u.role as "leaderRole", u."isDeleted" as "leaderIsDeleted"
        FROM "irResearchProject" p
        LEFT JOIN "irUser" u ON p."leaderId" = u.id
        ${includeDeleted ? '' : 'WHERE p."isDeleted" = 0 OR p."isDeleted" IS NULL'}
        ORDER BY p."createdAt" DESC
      `;
      const res = await dbQuery(sql);
      return res.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        status: row.status,
        budgetInitial: row.budgetInitial,
        budgetSpent: row.budgetSpent,
        startDate: toIsoString(row.startDate),
        endDate: toIsoString(row.endDate),
        ceuConsultDate: toIsoString(row.ceuConsultDate),
        irbNo: row.irbNo,
        approvedDate: toIsoString(row.approvedDate),
        department: row.department,
        leaderId: row.leaderId,
        isDeleted: row.isDeleted === 1 || row.isDeleted === true || row.isDeleted === '1',
        ceuConsultId: row.ceuConsultId || null,
        ceuBypassReason: row.ceuBypassReason || null,
        attachmentName: row.attachmentName || null,
        attachmentData: row.attachmentData || null,
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        leader: mapUserRoles({
          id: row.leaderId,
          name: row.leaderName,
          email: row.leaderEmail,
          role: row.leaderRole,
          isDeleted: row.leaderIsDeleted
        })
      }));
    },
    findUnique: async (id: string) => {
      await ensureMigrations();
      const sql = `
        SELECT p.*, 
               u.name as "leaderName", u.email as "leaderEmail", u.role as "leaderRole", u."isDeleted" as "leaderIsDeleted"
        FROM "irResearchProject" p
        LEFT JOIN "irUser" u ON p."leaderId" = u.id
        WHERE p.id = $1
      `;
      const res = await dbQuery(sql, [id]);
      const row = res.rows[0];
      if (!row) return null;
      return {
        id: row.id,
        title: row.title,
        status: row.status,
        budgetInitial: row.budgetInitial,
        budgetSpent: row.budgetSpent,
        startDate: toIsoString(row.startDate),
        endDate: toIsoString(row.endDate),
        ceuConsultDate: toIsoString(row.ceuConsultDate),
        irbNo: row.irbNo,
        approvedDate: toIsoString(row.approvedDate),
        department: row.department,
        leaderId: row.leaderId,
        isDeleted: row.isDeleted === 1 || row.isDeleted === true || row.isDeleted === '1',
        ceuConsultId: row.ceuConsultId || null,
        ceuBypassReason: row.ceuBypassReason || null,
        attachmentName: row.attachmentName || null,
        attachmentData: row.attachmentData || null,
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        leader: mapUserRoles({
          id: row.leaderId,
          name: row.leaderName,
          email: row.leaderEmail,
          role: row.leaderRole,
          isDeleted: row.leaderIsDeleted
        })
      };
    },
    create: async (data: any, performedBy?: string | null) => {
      await ensureMigrations();
      const id = data.id || crypto.randomUUID();
      const sql = `
        INSERT INTO "irResearchProject" (
          id, title, status, "budgetInitial", "budgetSpent", 
          "startDate", "endDate", "ceuConsultDate", "irbNo", 
          "approvedDate", department, "leaderId", "ceuConsultId", "ceuBypassReason", "attachmentName", "attachmentData", "isDeleted", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const res = await dbQuery(sql, [
        id, data.title, data.status, data.budgetInitial, data.budgetSpent || 0,
        data.startDate ? new Date(data.startDate).toISOString() : new Date().toISOString(),
        data.endDate ? new Date(data.endDate).toISOString() : new Date().toISOString(),
        data.ceuConsultDate ? new Date(data.ceuConsultDate).toISOString() : null,
        data.irbNo || null,
        data.approvedDate ? new Date(data.approvedDate).toISOString() : null,
        data.department || null,
        data.leaderId,
        data.ceuConsultId || null,
        data.ceuBypassReason || null,
        data.attachmentName || null,
        data.attachmentData || null
      ]);
      const result = await realDbHandlers.projects.findUnique(id);
      await writeRealAuditLog('irResearchProject', id, 'CREATE', null, result, performedBy);
      return result;
    },
    update: async (id: string, data: any, performedBy?: string | null) => {
      await ensureMigrations();
      const currentRes = await dbQuery('SELECT * FROM "irResearchProject" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw new Error('Project not found');
 
      const title = data.title !== undefined ? data.title : current.title;
      const status = data.status !== undefined ? data.status : current.status;
      const budgetInitial = data.budgetInitial !== undefined ? data.budgetInitial : current.budgetInitial;
      const budgetSpent = data.budgetSpent !== undefined ? data.budgetSpent : current.budgetSpent;
      const startDate = data.startDate !== undefined ? new Date(data.startDate).toISOString() : current.startDate;
      const endDate = data.endDate !== undefined ? new Date(data.endDate).toISOString() : current.endDate;
      const ceuConsultDate = data.ceuConsultDate !== undefined ? (data.ceuConsultDate ? new Date(data.ceuConsultDate).toISOString() : null) : current.ceuConsultDate;
      const irbNo = data.irbNo !== undefined ? data.irbNo : current.irbNo;
      const approvedDate = data.approvedDate !== undefined ? (data.approvedDate ? new Date(data.approvedDate).toISOString() : null) : current.approvedDate;
      const department = data.department !== undefined ? data.department : current.department;
      const leaderId = data.leaderId !== undefined ? data.leaderId : current.leaderId;
      const isDeleted = data.isDeleted !== undefined ? (data.isDeleted ? 1 : 0) : (current.isDeleted === 1 || current.isDeleted === true || current.isDeleted === '1' ? 1 : 0);
      const ceuConsultId = data.ceuConsultId !== undefined ? data.ceuConsultId : current.ceuConsultId;
      const ceuBypassReason = data.ceuBypassReason !== undefined ? data.ceuBypassReason : current.ceuBypassReason;
      const attachmentName = data.attachmentName !== undefined ? data.attachmentName : current.attachmentName;
      const attachmentData = data.attachmentData !== undefined ? data.attachmentData : current.attachmentData;
 
      await dbQuery(`
        UPDATE "irResearchProject" SET
          title = $1, status = $2, "budgetInitial" = $3, "budgetSpent" = $4,
          "startDate" = $5, "endDate" = $6, "ceuConsultDate" = $7, "irbNo" = $8,
          "approvedDate" = $9, department = $10, "leaderId" = $11, "isDeleted" = $12,
          "ceuConsultId" = $13, "ceuBypassReason" = $14, "attachmentName" = $15, "attachmentData" = $16, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $17
      `, [
        title, status, budgetInitial, budgetSpent, startDate, endDate, ceuConsultDate, irbNo, approvedDate, department, leaderId, isDeleted, ceuConsultId || null, ceuBypassReason || null, attachmentName || null, attachmentData || null, id
      ]);
      const result = await realDbHandlers.projects.findUnique(id);
      await writeRealAuditLog('irResearchProject', id, 'UPDATE', current, result, performedBy);
      return result;
    },
    delete: async (id: string, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irResearchProject" WHERE id = $1 AND ("isDeleted" = 0 OR "isDeleted" IS NULL)', [id]);
      const current = currentRes.rows[0];
      if (!current) return null;

      const res = await dbQuery('UPDATE "irResearchProject" SET "isDeleted" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
      await writeRealAuditLog('irResearchProject', id, 'DELETE', current, null, performedBy);
      return res.rows[0];
    }
  },
  publications: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const includeDeleted = options?.includeDeleted ?? false;
      const sql = `
        SELECT pub.*, 
               p.title as "projectTitle", p.status as "projectStatus", p."budgetInitial" as "projectBudgetInitial", p."budgetSpent" as "projectBudgetSpent", p."startDate" as "projectStartDate", p."endDate" as "projectEndDate", p.department as "projectDepartment", p."leaderId" as "projectLeaderId", p."isDeleted" as "projectIsDeleted",
               u.name as "authorName", u.email as "authorEmail", u.role as "authorRole", u."isDeleted" as "authorIsDeleted"
        FROM "irPublication" pub
        LEFT JOIN "irResearchProject" p ON pub."projectId" = p.id
        LEFT JOIN "irUser" u ON pub."authorId" = u.id
        ${includeDeleted ? '' : 'WHERE pub."isDeleted" = 0 OR pub."isDeleted" IS NULL'}
        ORDER BY pub."createdAt" DESC
      `;
      const res = await dbQuery(sql);
      return res.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        journal: row.journal,
        quartile: row.quartile,
        rewardStatus: row.rewardStatus,
        rewardAmount: row.rewardAmount,
        status: row.status,
        projectId: row.projectId,
        authorId: row.authorId,
        isDeleted: row.isDeleted === 1 || row.isDeleted === true || row.isDeleted === '1',
        attachmentName: row.attachmentName || null,
        attachmentData: row.attachmentData || null,
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        project: row.projectId ? {
          id: row.projectId,
          title: row.projectTitle,
          status: row.projectStatus,
          budgetInitial: row.projectBudgetInitial,
          budgetSpent: row.projectBudgetSpent,
          startDate: toIsoString(row.projectStartDate),
          endDate: toIsoString(row.projectEndDate),
          department: row.projectDepartment,
          leaderId: row.projectLeaderId,
          isDeleted: row.projectIsDeleted === 1 || row.projectIsDeleted === true || row.projectIsDeleted === '1'
        } : null,
        author: mapUserRoles({
          id: row.authorId,
          name: row.authorName,
          email: row.authorEmail,
          role: row.authorRole,
          isDeleted: row.authorIsDeleted
        })
      }));
    },
    findUnique: async (id: string) => {
      const sql = `
        SELECT pub.*, 
               p.title as "projectTitle", p.status as "projectStatus", p."budgetInitial" as "projectBudgetInitial", p."budgetSpent" as "projectBudgetSpent", p."startDate" as "projectStartDate", p."endDate" as "projectEndDate", p.department as "projectDepartment", p."leaderId" as "projectLeaderId", p."isDeleted" as "projectIsDeleted",
               u.name as "authorName", u.email as "authorEmail", u.role as "authorRole", u."isDeleted" as "authorIsDeleted"
        FROM "irPublication" pub
        LEFT JOIN "irResearchProject" p ON pub."projectId" = p.id
        LEFT JOIN "irUser" u ON pub."authorId" = u.id
        WHERE pub.id = $1
      `;
      const res = await dbQuery(sql, [id]);
      const row = res.rows[0];
      if (!row) return null;
      return {
        id: row.id,
        title: row.title,
        journal: row.journal,
        quartile: row.quartile,
        rewardStatus: row.rewardStatus,
        rewardAmount: row.rewardAmount,
        status: row.status,
        projectId: row.projectId,
        authorId: row.authorId,
        isDeleted: row.isDeleted === 1 || row.isDeleted === true || row.isDeleted === '1',
        attachmentName: row.attachmentName || null,
        attachmentData: row.attachmentData || null,
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        project: row.projectId ? {
          id: row.projectId,
          title: row.projectTitle,
          status: row.projectStatus,
          budgetInitial: row.projectBudgetInitial,
          budgetSpent: row.projectBudgetSpent,
          startDate: toIsoString(row.projectStartDate),
          endDate: toIsoString(row.projectEndDate),
          department: row.projectDepartment,
          leaderId: row.projectLeaderId,
          isDeleted: row.projectIsDeleted === 1 || row.projectIsDeleted === true || row.projectIsDeleted === '1'
        } : null,
        author: mapUserRoles({
          id: row.authorId,
          name: row.authorName,
          email: row.authorEmail,
          role: row.authorRole,
          isDeleted: row.authorIsDeleted
        })
      };
    },
    create: async (data: any, performedBy?: string | null) => {
      const id = data.id || crypto.randomUUID();
      const sql = `
        INSERT INTO "irPublication" (
          id, title, journal, quartile, "rewardStatus", 
          "rewardAmount", status, "projectId", "authorId", "attachmentName", "attachmentData", "isDeleted",
          "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const res = await dbQuery(sql, [
        id, data.title, data.journal, data.quartile, data.rewardStatus || 'PENDING',
        data.rewardAmount || 0, data.status || 'WRITING', data.projectId || null, data.authorId,
        data.attachmentName || null, data.attachmentData || null
      ]);
      const result = await realDbHandlers.publications.findUnique(res.rows[0].id);
      await writeRealAuditLog('irPublication', id, 'CREATE', null, result, performedBy);
      return result;
    },
    update: async (id: string, data: any, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irPublication" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw new Error('Publication not found');

      const title = data.title !== undefined ? data.title : current.title;
      const journal = data.journal !== undefined ? data.journal : current.journal;
      const quartile = data.quartile !== undefined ? data.quartile : current.quartile;
      const rewardStatus = data.rewardStatus !== undefined ? data.rewardStatus : current.rewardStatus;
      const rewardAmount = data.rewardAmount !== undefined ? data.rewardAmount : current.rewardAmount;
      const status = data.status !== undefined ? data.status : current.status;
      const projectId = data.projectId !== undefined ? data.projectId : current.projectId;
      const authorId = data.authorId !== undefined ? data.authorId : current.authorId;
      const isDeleted = data.isDeleted !== undefined ? (data.isDeleted ? 1 : 0) : (current.isDeleted === 1 || current.isDeleted === true || current.isDeleted === '1' ? 1 : 0);
      const attachmentName = data.attachmentName !== undefined ? data.attachmentName : current.attachmentName;
      const attachmentData = data.attachmentData !== undefined ? data.attachmentData : current.attachmentData;

      await dbQuery(`
        UPDATE "irPublication" SET
          title = $1, journal = $2, quartile = $3, "rewardStatus" = $4,
          "rewardAmount" = $5, status = $6, "projectId" = $7, "authorId" = $8,
          "attachmentName" = $9, "attachmentData" = $10, "isDeleted" = $11, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $12
      `, [
        title, journal, quartile, rewardStatus, rewardAmount, status, projectId || null, authorId, attachmentName || null, attachmentData || null, isDeleted, id
      ]);
      const result = await realDbHandlers.publications.findUnique(id);
      await writeRealAuditLog('irPublication', id, 'UPDATE', current, result, performedBy);
      return result;
    },
    delete: async (id: string, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irPublication" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) return null;

      const res = await dbQuery('UPDATE "irPublication" SET "isDeleted" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
      await writeRealAuditLog('irPublication', id, 'DELETE', current, null, performedBy);
      return res.rows[0];
    }
  },
  presentations: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const includeDeleted = options?.includeDeleted ?? false;
      const sql = `
        SELECT pres.*, 
               p.title as "projectTitle", p.status as "projectStatus", p."budgetInitial" as "projectBudgetInitial", p."budgetSpent" as "projectBudgetSpent", p."startDate" as "projectStartDate", p."endDate" as "projectEndDate", p.department as "projectDepartment", p."leaderId" as "projectLeaderId",
               u.name as "presenterName", u.email as "presenterEmail", u.role as "presenterRole", u."isDeleted" as "presenterIsDeleted"
        FROM "irPresentation" pres
        LEFT JOIN "irResearchProject" p ON pres."projectId" = p.id
        LEFT JOIN "irUser" u ON pres."presenterId" = u.id
        ${includeDeleted ? '' : 'WHERE pres."isDeleted" = 0 OR pres."isDeleted" IS NULL'}
        ORDER BY pres."createdAt" DESC
      `;
      const res = await dbQuery(sql);
      return res.rows.map((row: any) => ({
        id: row.id,
        title: row.title,
        conference: row.conference,
        type: row.type,
        status: row.status,
        projectId: row.projectId,
        presenterId: row.presenterId,
        isDeleted: row.isDeleted === 1 || row.isDeleted === true || row.isDeleted === '1',
        attachmentName: row.attachmentName || null,
        attachmentData: row.attachmentData || null,
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        project: row.projectId ? {
          id: row.projectId,
          title: row.projectTitle,
          status: row.projectStatus,
          budgetInitial: row.projectBudgetInitial,
          budgetSpent: row.projectBudgetSpent,
          startDate: toIsoString(row.projectStartDate),
          endDate: toIsoString(row.projectEndDate),
          department: row.projectDepartment,
          leaderId: row.projectLeaderId
        } : null,
        presenter: mapUserRoles({
          id: row.presenterId,
          name: row.presenterName,
          email: row.presenterEmail,
          role: row.presenterRole,
          isDeleted: row.presenterIsDeleted
        })
      }));
    },
    findUnique: async (id: string) => {
      const sql = `
        SELECT pres.*, 
               p.title as "projectTitle", p.status as "projectStatus", p."budgetInitial" as "projectBudgetInitial", p."budgetSpent" as "projectBudgetSpent", p."startDate" as "projectStartDate", p."endDate" as "projectEndDate", p.department as "projectDepartment", p."leaderId" as "projectLeaderId",
               u.name as "presenterName", u.email as "presenterEmail", u.role as "presenterRole", u."isDeleted" as "presenterIsDeleted"
        FROM "irPresentation" pres
        LEFT JOIN "irResearchProject" p ON pres."projectId" = p.id
        LEFT JOIN "irUser" u ON pres."presenterId" = u.id
        WHERE pres.id = $1
      `;
      const res = await dbQuery(sql, [id]);
      const row = res.rows[0];
      if (!row) return null;
      return {
        id: row.id,
        title: row.title,
        conference: row.conference,
        type: row.type,
        status: row.status,
        projectId: row.projectId,
        presenterId: row.presenterId,
        isDeleted: row.isDeleted === 1 || row.isDeleted === true || row.isDeleted === '1',
        attachmentName: row.attachmentName || null,
        attachmentData: row.attachmentData || null,
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        project: row.projectId ? {
          id: row.projectId,
          title: row.projectTitle,
          status: row.projectStatus,
          budgetInitial: row.projectBudgetInitial,
          budgetSpent: row.projectBudgetSpent,
          startDate: toIsoString(row.projectStartDate),
          endDate: toIsoString(row.projectEndDate),
          department: row.projectDepartment,
          leaderId: row.projectLeaderId
        } : null,
        presenter: mapUserRoles({
          id: row.presenterId,
          name: row.presenterName,
          email: row.presenterEmail,
          role: row.presenterRole,
          isDeleted: row.presenterIsDeleted
        })
      };
    },
    create: async (data: any, performedBy?: string | null) => {
      const id = data.id || crypto.randomUUID();
      const sql = `
        INSERT INTO "irPresentation" (
          id, title, conference, type, status, "projectId", 
          "presenterId", "attachmentName", "attachmentData", "isDeleted", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const res = await dbQuery(sql, [
        id, data.title, data.conference, data.type, data.status || 'PENDING',
        data.projectId || null, data.presenterId,
        data.attachmentName || null, data.attachmentData || null
      ]);
      const result = await realDbHandlers.presentations.findUnique(res.rows[0].id);
      await writeRealAuditLog('irPresentation', id, 'CREATE', null, result, performedBy);
      return result;
    },
    update: async (id: string, data: any, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irPresentation" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw new Error('Presentation not found');

      const title = data.title !== undefined ? data.title : current.title;
      const conference = data.conference !== undefined ? data.conference : current.conference;
      const type = data.type !== undefined ? data.type : current.type;
      const status = data.status !== undefined ? data.status : current.status;
      const projectId = data.projectId !== undefined ? data.projectId : current.projectId;
      const presenterId = data.presenterId !== undefined ? data.presenterId : current.presenterId;
      const isDeleted = data.isDeleted !== undefined ? (data.isDeleted ? 1 : 0) : (current.isDeleted === 1 || current.isDeleted === true || current.isDeleted === '1' ? 1 : 0);
      const attachmentName = data.attachmentName !== undefined ? data.attachmentName : current.attachmentName;
      const attachmentData = data.attachmentData !== undefined ? data.attachmentData : current.attachmentData;

      await dbQuery(`
        UPDATE "irPresentation" SET
          title = $1, conference = $2, type = $3, status = $4,
          "projectId" = $5, "presenterId" = $6, "attachmentName" = $7, "attachmentData" = $8, "isDeleted" = $9, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $10
      `, [
        title, conference, type, status, projectId || null, presenterId, attachmentName || null, attachmentData || null, isDeleted, id
      ]);
      const result = await realDbHandlers.presentations.findUnique(id);
      await writeRealAuditLog('irPresentation', id, 'UPDATE', current, result, performedBy);
      return result;
    },
    delete: async (id: string, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irPresentation" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) return null;

      const res = await dbQuery('UPDATE "irPresentation" SET "isDeleted" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
      await writeRealAuditLog('irPresentation', id, 'DELETE', current, null, performedBy);
      return res.rows[0];
    }
  },
  consultations: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const includeDeleted = options?.includeDeleted ?? false;
      const sql = `
        SELECT c.*, 
               u1.name as "advisorName", u1.email as "advisorEmail", u1.role as "advisorRole", u1."isDeleted" as "advisorIsDeleted",
               u2.name as "requesterName", u2.email as "requesterEmail", u2.role as "requesterRole", u2."isDeleted" as "requesterIsDeleted"
        FROM "irConsultation" c
        LEFT JOIN "irUser" u1 ON c."advisorId" = u1.id
        LEFT JOIN "irUser" u2 ON c."requesterId" = u2.id
        ${includeDeleted ? '' : 'WHERE c."isDeleted" = 0 OR c."isDeleted" IS NULL'}
        ORDER BY c."appointmentTime" ASC
      `;
      const res = await dbQuery(sql);
      return res.rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        appointmentTime: toIsoString(row.appointmentTime),
        status: row.status,
        advisorId: row.advisorId,
        requesterId: row.requesterId,
        isDeleted: row.isDeleted === 1 || row.isDeleted === true || row.isDeleted === '1',
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        advisor: mapUserRoles({
          id: row.advisorId,
          name: row.advisorName,
          email: row.advisorEmail,
          role: row.advisorRole,
          isDeleted: row.advisorIsDeleted
        }),
        requester: mapUserRoles({
          id: row.requesterId,
          name: row.requesterName,
          email: row.requesterEmail,
          role: row.requesterRole,
          isDeleted: row.requesterIsDeleted
        })
      }));
    },
    findUnique: async (id: string) => {
      const sql = `
        SELECT c.*, 
               u1.name as "advisorName", u1.email as "advisorEmail", u1.role as "advisorRole", u1."isDeleted" as "advisorIsDeleted",
               u2.name as "requesterName", u2.email as "requesterEmail", u2.role as "requesterRole", u2."isDeleted" as "requesterIsDeleted"
        FROM "irConsultation" c
        LEFT JOIN "irUser" u1 ON c."advisorId" = u1.id
        LEFT JOIN "irUser" u2 ON c."requesterId" = u2.id
        WHERE c.id = $1
      `;
      const res = await dbQuery(sql, [id]);
      const row = res.rows[0];
      if (!row) return null;
      return {
        id: row.id,
        type: row.type,
        appointmentTime: toIsoString(row.appointmentTime),
        status: row.status,
        advisorId: row.advisorId,
        requesterId: row.requesterId,
        isDeleted: row.isDeleted === 1 || row.isDeleted === true || row.isDeleted === '1',
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        advisor: mapUserRoles({
          id: row.advisorId,
          name: row.advisorName,
          email: row.advisorEmail,
          role: row.advisorRole,
          isDeleted: row.advisorIsDeleted
        }),
        requester: mapUserRoles({
          id: row.requesterId,
          name: row.requesterName,
          email: row.requesterEmail,
          role: row.requesterRole,
          isDeleted: row.requesterIsDeleted
        })
      };
    },
    create: async (data: any, performedBy?: string | null) => {
      const id = data.id || crypto.randomUUID();
      const sql = `
        INSERT INTO "irConsultation" (
          id, type, "appointmentTime", status, "advisorId", 
          "requesterId", "isDeleted", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const res = await dbQuery(sql, [
        id, data.type, new Date(data.appointmentTime).toISOString(), data.status || 'SCHEDULED',
        data.advisorId, data.requesterId
      ]);
      const result = await realDbHandlers.consultations.findUnique(res.rows[0].id);
      await writeRealAuditLog('irConsultation', id, 'CREATE', null, result, performedBy);
      return result;
    },
    update: async (id: string, data: any, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irConsultation" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw new Error('Consultation not found');

      const type = data.type !== undefined ? data.type : current.type;
      const appointmentTime = data.appointmentTime !== undefined ? new Date(data.appointmentTime).toISOString() : current.appointmentTime;
      const status = data.status !== undefined ? data.status : current.status;
      const advisorId = data.advisorId !== undefined ? data.advisorId : current.advisorId;
      const requesterId = data.requesterId !== undefined ? data.requesterId : current.requesterId;
      const isDeleted = data.isDeleted !== undefined ? (data.isDeleted ? 1 : 0) : (current.isDeleted === 1 || current.isDeleted === true || current.isDeleted === '1' ? 1 : 0);

      await dbQuery(`
        UPDATE "irConsultation" SET
          type = $1, "appointmentTime" = $2, status = $3,
          "advisorId" = $4, "requesterId" = $5, "isDeleted" = $6, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $7
      `, [
        type, appointmentTime, status, advisorId, requesterId, isDeleted, id
      ]);
      const result = await realDbHandlers.consultations.findUnique(id);
      await writeRealAuditLog('irConsultation', id, 'UPDATE', current, result, performedBy);
      return result;
    },
    delete: async (id: string, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irConsultation" WHERE id = $1 AND ("isDeleted" = 0 OR "isDeleted" IS NULL)', [id]);
      const current = currentRes.rows[0];
      if (!current) return null;

      const res = await dbQuery('UPDATE "irConsultation" SET "isDeleted" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [id]);
      await writeRealAuditLog('irConsultation', id, 'DELETE', current, null, performedBy);
      return res.rows[0];
    }
  },
  evaluations: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const includeDeleted = options?.includeDeleted ?? false;
      const sql = `
        SELECT 
          e.*,
          p.title as "projectTitle", p.status as "projectStatus",
          u.name as "evaluatorName", u.email as "evaluatorEmail", u.role as "evaluatorRole"
        FROM "irProposalEvaluation" e
        LEFT JOIN "irResearchProject" p ON e."projectId" = p.id
        LEFT JOIN "irUser" u ON e."evaluatorId" = u.id
        WHERE ${includeDeleted ? '1=1' : '(e."isDeleted" = 0 OR e."isDeleted" IS NULL)'}
        ORDER BY e."createdAt" DESC
      `;
      const res = await dbQuery(sql);
      return res.rows.map((row: any) => ({
        id: row.id,
        projectId: row.projectId,
        evaluatorId: row.evaluatorId,
        evaluatorType: row.evaluatorType,
        feedbackResearchProcess: row.feedbackResearchProcess,
        feedbackOriginality: row.feedbackOriginality,
        feedbackExpectedOutput: row.feedbackExpectedOutput,
        feedbackBudgetAppropriate: row.feedbackBudgetAppropriate,
        scoreOverallQuality: row.scoreOverallQuality,
        bankAccountName: row.bankAccountName,
        bankName: row.bankName,
        bankBranch: row.bankBranch,
        bankAccountNumber: row.bankAccountNumber,
        bankBookAttachmentName: row.bankBookAttachmentName,
        bankBookAttachmentData: row.bankBookAttachmentData,
        status: row.status,
        isDeleted: row.isDeleted === 1 || row.isDeleted === true || row.isDeleted === '1',
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        project: row.projectId ? {
          id: row.projectId,
          title: row.projectTitle,
          status: row.projectStatus
        } : null,
        evaluator: row.evaluatorId ? mapUserRoles({
          id: row.evaluatorId,
          name: row.evaluatorName,
          email: row.evaluatorEmail,
          role: row.evaluatorRole
        }) : null
      }));
    },
    findUnique: async (id: string) => {
      const sql = `
        SELECT 
          e.*,
          p.title as "projectTitle", p.status as "projectStatus",
          u.name as "evaluatorName", u.email as "evaluatorEmail", u.role as "evaluatorRole"
        FROM "irProposalEvaluation" e
        LEFT JOIN "irResearchProject" p ON e."projectId" = p.id
        LEFT JOIN "irUser" u ON e."evaluatorId" = u.id
        WHERE e.id = $1
      `;
      const res = await dbQuery(sql, [id]);
      const row = res.rows[0];
      if (!row) return null;
      return {
        id: row.id,
        projectId: row.projectId,
        evaluatorId: row.evaluatorId,
        evaluatorType: row.evaluatorType,
        feedbackResearchProcess: row.feedbackResearchProcess,
        feedbackOriginality: row.feedbackOriginality,
        feedbackExpectedOutput: row.feedbackExpectedOutput,
        feedbackBudgetAppropriate: row.feedbackBudgetAppropriate,
        scoreOverallQuality: row.scoreOverallQuality,
        bankAccountName: row.bankAccountName,
        bankName: row.bankName,
        bankBranch: row.bankBranch,
        bankAccountNumber: row.bankAccountNumber,
        bankBookAttachmentName: row.bankBookAttachmentName,
        bankBookAttachmentData: row.bankBookAttachmentData,
        status: row.status,
        isDeleted: row.isDeleted === 1 || row.isDeleted === true || row.isDeleted === '1',
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        project: row.projectId ? {
          id: row.projectId,
          title: row.projectTitle,
          status: row.projectStatus
        } : null,
        evaluator: row.evaluatorId ? mapUserRoles({
          id: row.evaluatorId,
          name: row.evaluatorName,
          email: row.evaluatorEmail,
          role: row.evaluatorRole
        }) : null
      };
    },
    create: async (data: any, performedBy?: string | null) => {
      const id = data.id || crypto.randomUUID();
      const sql = `
        INSERT INTO "irProposalEvaluation" (
          id, "projectId", "evaluatorId", "evaluatorType",
          "feedbackResearchProcess", "feedbackOriginality", "feedbackExpectedOutput", "feedbackBudgetAppropriate",
          "scoreOverallQuality", "bankAccountName", "bankName", "bankBranch", "bankAccountNumber",
          "bankBookAttachmentName", "bankBookAttachmentData", "status", "isDeleted", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const res = await dbQuery(sql, [
        id, data.projectId, data.evaluatorId, data.evaluatorType || 'INTERNAL',
        data.feedbackResearchProcess || null, data.feedbackOriginality || null, data.feedbackExpectedOutput || null, data.feedbackBudgetAppropriate || null,
        data.scoreOverallQuality !== undefined ? Number(data.scoreOverallQuality) : null,
        data.bankAccountName || null, data.bankName || null, data.bankBranch || null, data.bankAccountNumber || null,
        data.bankBookAttachmentName || null, data.bankBookAttachmentData || null, data.status || 'DRAFT'
      ]);
      const result = await realDbHandlers.evaluations.findUnique(res.rows[0].id);
      await writeRealAuditLog('irProposalEvaluation', id, 'CREATE', null, result, performedBy);
      return result;
    },
    update: async (id: string, data: any, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irProposalEvaluation" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw new Error('Evaluation not found');

      const projectId = data.projectId !== undefined ? data.projectId : current.projectId;
      const evaluatorId = data.evaluatorId !== undefined ? data.evaluatorId : current.evaluatorId;
      const evaluatorType = data.evaluatorType !== undefined ? data.evaluatorType : current.evaluatorType;
      const feedbackResearchProcess = data.feedbackResearchProcess !== undefined ? data.feedbackResearchProcess : current.feedbackResearchProcess;
      const feedbackOriginality = data.feedbackOriginality !== undefined ? data.feedbackOriginality : current.feedbackOriginality;
      const feedbackExpectedOutput = data.feedbackExpectedOutput !== undefined ? data.feedbackExpectedOutput : current.feedbackExpectedOutput;
      const feedbackBudgetAppropriate = data.feedbackBudgetAppropriate !== undefined ? data.feedbackBudgetAppropriate : current.feedbackBudgetAppropriate;
      const scoreOverallQuality = data.scoreOverallQuality !== undefined ? (data.scoreOverallQuality !== null ? Number(data.scoreOverallQuality) : null) : current.scoreOverallQuality;
      const bankAccountName = data.bankAccountName !== undefined ? data.bankAccountName : current.bankAccountName;
      const bankName = data.bankName !== undefined ? data.bankName : current.bankName;
      const bankBranch = data.bankBranch !== undefined ? data.bankBranch : current.bankBranch;
      const bankAccountNumber = data.bankAccountNumber !== undefined ? data.bankAccountNumber : current.bankAccountNumber;
      const bankBookAttachmentName = data.bankBookAttachmentName !== undefined ? data.bankBookAttachmentName : current.bankBookAttachmentName;
      const bankBookAttachmentData = data.bankBookAttachmentData !== undefined ? data.bankBookAttachmentData : current.bankBookAttachmentData;
      const status = data.status !== undefined ? data.status : current.status;
      const isDeleted = data.isDeleted !== undefined ? (data.isDeleted ? 1 : 0) : (current.isDeleted === 1 || current.isDeleted === true || current.isDeleted === '1' ? 1 : 0);

      await dbQuery(`
        UPDATE "irProposalEvaluation" SET
          "projectId" = $1, "evaluatorId" = $2, "evaluatorType" = $3,
          "feedbackResearchProcess" = $4, "feedbackOriginality" = $5, "feedbackExpectedOutput" = $6, "feedbackBudgetAppropriate" = $7,
          "scoreOverallQuality" = $8, "bankAccountName" = $9, "bankName" = $10, "bankBranch" = $11, "bankAccountNumber" = $12,
          "bankBookAttachmentName" = $13, "bankBookAttachmentData" = $14, "status" = $15, "isDeleted" = $16, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $17
      `, [
        projectId, evaluatorId, evaluatorType,
        feedbackResearchProcess, feedbackOriginality, feedbackExpectedOutput, feedbackBudgetAppropriate,
        scoreOverallQuality, bankAccountName, bankName, bankBranch, bankAccountNumber,
        bankBookAttachmentName, bankBookAttachmentData, status, isDeleted, id
      ]);
      const result = await realDbHandlers.evaluations.findUnique(id);
      await writeRealAuditLog('irProposalEvaluation', id, 'UPDATE', current, result, performedBy);
      return result;
    },
    delete: async (id: string, performedBy?: string | null) => {
      const currentRes = await dbQuery('SELECT * FROM "irProposalEvaluation" WHERE id = $1 AND ("isDeleted" = 0 OR "isDeleted" IS NULL)', [id]);
      const current = currentRes.rows[0];
      if (!current) return null;

      await dbQuery('UPDATE "irProposalEvaluation" SET "isDeleted" = 1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1', [id]);
      await writeRealAuditLog('irProposalEvaluation', id, 'DELETE', current, null, performedBy);
      return current;
    }
  },
  auditLogs: {
    findMany: async () => {
      const res = await dbQuery('SELECT * FROM "irAuditLog" ORDER BY timestamp DESC LIMIT 200');
      return res.rows.map((r: any) => ({
        ...r,
        timestamp: toIsoString(r.timestamp),
      }));
    }
  }
};

/**
 * Dynamic Proxy API Layer
 * Automatically selects between Mock (development) and D1 (production) handlers
 * 
 * Usage:
 *   const users = await apiDb.users.findMany();
 *   const project = await apiDb.projects.findUnique(id);
 *   const newUser = await apiDb.users.create({ name, email, role });
 *   const logs = await apiDb.auditLogs.findMany();
 */
export const apiDb = new Proxy({} as any, {
  get(target, prop) {
    let d1 = null;
    try {
      const ctx = safeGetRequestContext();
      if (ctx && ctx.env && (ctx.env as any).DB) {
        d1 = (ctx.env as any).DB;
      }
    } catch (e) {
      // Ignore - return mock db
    }
    
    // Use real DB handlers if D1 is available, otherwise use mockDb
    const handler = d1 ? realDbHandlers : mockDb;
    return (handler as any)[prop];
  }
});
