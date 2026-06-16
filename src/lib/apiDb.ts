import { mockDb } from './mockDb';
import { dbQuery } from './db';
import { getRequestContext } from '@cloudflare/next-on-pages';

/**
 * Determine if we should use Mock database
 * Returns true when D1 is not available (development/local)
 * Returns false when D1 is available (production on Cloudflare Pages/Workers)
 */
export const getIsMock = () => {
  try {
    const ctx = getRequestContext();
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

// Database handlers for D1 (Production)
const realDbHandlers = {
  users: {
    findMany: async () => {
      const res = await dbQuery('SELECT id, name, email, role, "createdAt", "updatedAt" FROM "irUser" ORDER BY "createdAt" DESC');
      return res.rows.map((r: any) => ({
        ...r,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
      }));
    },
    findUnique: async (id: string) => {
      const res = await dbQuery('SELECT id, name, email, role, "createdAt", "updatedAt" FROM "irUser" WHERE id = $1', [id]);
      const r = res.rows[0];
      if (!r) return null;
      return {
        ...r,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
      };
    },
    create: async (data: any) => {
      const id = data.id || crypto.randomUUID();
      const res = await dbQuery(
        'INSERT INTO "irUser" (id, name, email, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
        [id, data.name, data.email, data.role]
      );
      const r = res.rows[0];
      return {
        ...r,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
      };
    },
    update: async (id: string, data: any) => {
      const currentRes = await dbQuery('SELECT * FROM "irUser" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw new Error('User not found');
      
      const name = data.name !== undefined ? data.name : current.name;
      const email = data.email !== undefined ? data.email : current.email;
      const role = data.role !== undefined ? data.role : current.role;

      const res = await dbQuery(
        'UPDATE "irUser" SET name = $1, email = $2, role = $3, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
        [name, email, role, id]
      );
      const r = res.rows[0];
      return {
        ...r,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
      };
    },
    delete: async (id: string) => {
      const res = await dbQuery('DELETE FROM "irUser" WHERE id = $1 RETURNING *', [id]);
      const r = res.rows[0];
      if (!r) return null;
      return {
        ...r,
        createdAt: toIsoString(r.createdAt),
        updatedAt: toIsoString(r.updatedAt),
      };
    }
  },
  projects: {
    findMany: async () => {
      const sql = `
        SELECT p.*, 
               u.name as "leaderName", u.email as "leaderEmail", u.role as "leaderRole"
        FROM "irResearchProject" p
        LEFT JOIN "irUser" u ON p."leaderId" = u.id
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
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        leader: {
          id: row.leaderId,
          name: row.leaderName,
          email: row.leaderEmail,
          role: row.leaderRole
        }
      }));
    },
    findUnique: async (id: string) => {
      const sql = `
        SELECT p.*, 
               u.name as "leaderName", u.email as "leaderEmail", u.role as "leaderRole"
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
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        leader: {
          id: row.leaderId,
          name: row.leaderName,
          email: row.leaderEmail,
          role: row.leaderRole
        }
      };
    },
    create: async (data: any) => {
      const id = data.id || crypto.randomUUID();
      const sql = `
        INSERT INTO "irResearchProject" (
          id, title, status, "budgetInitial", "budgetSpent", 
          "startDate", "endDate", "ceuConsultDate", "irbNo", 
          "approvedDate", department, "leaderId", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const res = await dbQuery(sql, [
        id, data.title, data.status, data.budgetInitial, data.budgetSpent || 0,
        data.startDate ? new Date(data.startDate) : new Date(),
        data.endDate ? new Date(data.endDate) : new Date(),
        data.ceuConsultDate ? new Date(data.ceuConsultDate) : null,
        data.irbNo || null,
        data.approvedDate ? new Date(data.approvedDate) : null,
        data.department || null,
        data.leaderId
      ]);
      return realDbHandlers.projects.findUnique(res.rows[0].id);
    },
    update: async (id: string, data: any) => {
      const currentRes = await dbQuery('SELECT * FROM "irResearchProject" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw new Error('Project not found');

      const title = data.title !== undefined ? data.title : current.title;
      const status = data.status !== undefined ? data.status : current.status;
      const budgetInitial = data.budgetInitial !== undefined ? data.budgetInitial : current.budgetInitial;
      const budgetSpent = data.budgetSpent !== undefined ? data.budgetSpent : current.budgetSpent;
      const startDate = data.startDate !== undefined ? new Date(data.startDate) : current.startDate;
      const endDate = data.endDate !== undefined ? new Date(data.endDate) : current.endDate;
      const ceuConsultDate = data.ceuConsultDate !== undefined ? (data.ceuConsultDate ? new Date(data.ceuConsultDate) : null) : current.ceuConsultDate;
      const irbNo = data.irbNo !== undefined ? data.irbNo : current.irbNo;
      const approvedDate = data.approvedDate !== undefined ? (data.approvedDate ? new Date(data.approvedDate) : null) : current.approvedDate;
      const department = data.department !== undefined ? data.department : current.department;
      const leaderId = data.leaderId !== undefined ? data.leaderId : current.leaderId;

      await dbQuery(`
        UPDATE "irResearchProject" SET
          title = $1, status = $2, "budgetInitial" = $3, "budgetSpent" = $4,
          "startDate" = $5, "endDate" = $6, "ceuConsultDate" = $7, "irbNo" = $8,
          "approvedDate" = $9, department = $10, "leaderId" = $11, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $12
      `, [
        title, status, budgetInitial, budgetSpent, startDate, endDate, ceuConsultDate, irbNo, approvedDate, department, leaderId, id
      ]);
      return realDbHandlers.projects.findUnique(id);
    },
    delete: async (id: string) => {
      const res = await dbQuery('DELETE FROM "irResearchProject" WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    }
  },
  publications: {
    findMany: async () => {
      const sql = `
        SELECT pub.*, 
               p.title as "projectTitle", p.status as "projectStatus", p."budgetInitial" as "projectBudgetInitial", p."budgetSpent" as "projectBudgetSpent", p."startDate" as "projectStartDate", p."endDate" as "projectEndDate", p.department as "projectDepartment", p."leaderId" as "projectLeaderId",
               u.name as "authorName", u.email as "authorEmail", u.role as "authorRole"
        FROM "irPublication" pub
        LEFT JOIN "irResearchProject" p ON pub."projectId" = p.id
        LEFT JOIN "irUser" u ON pub."authorId" = u.id
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
        author: {
          id: row.authorId,
          name: row.authorName,
          email: row.authorEmail,
          role: row.authorRole
        }
      }));
    },
    findUnique: async (id: string) => {
      const sql = `
        SELECT pub.*, 
               p.title as "projectTitle", p.status as "projectStatus", p."budgetInitial" as "projectBudgetInitial", p."budgetSpent" as "projectBudgetSpent", p."startDate" as "projectStartDate", p."endDate" as "projectEndDate", p.department as "projectDepartment", p."leaderId" as "projectLeaderId",
               u.name as "authorName", u.email as "authorEmail", u.role as "authorRole"
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
        author: {
          id: row.authorId,
          name: row.authorName,
          email: row.authorEmail,
          role: row.authorRole
        }
      };
    },
    create: async (data: any) => {
      const id = data.id || crypto.randomUUID();
      const sql = `
        INSERT INTO "irPublication" (
          id, title, journal, quartile, "rewardStatus", 
          "rewardAmount", status, "projectId", "authorId", 
          "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const res = await dbQuery(sql, [
        id, data.title, data.journal, data.quartile, data.rewardStatus || 'PENDING',
        data.rewardAmount || 0, data.status || 'WRITING', data.projectId || null, data.authorId
      ]);
      return realDbHandlers.publications.findUnique(res.rows[0].id);
    },
    update: async (id: string, data: any) => {
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

      await dbQuery(`
        UPDATE "irPublication" SET
          title = $1, journal = $2, quartile = $3, "rewardStatus" = $4,
          "rewardAmount" = $5, status = $6, "projectId" = $7, "authorId" = $8,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $9
      `, [
        title, journal, quartile, rewardStatus, rewardAmount, status, projectId || null, authorId, id
      ]);
      return realDbHandlers.publications.findUnique(id);
    },
    delete: async (id: string) => {
      const res = await dbQuery('DELETE FROM "irPublication" WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    }
  },
  presentations: {
    findMany: async () => {
      const sql = `
        SELECT pres.*, 
               p.title as "projectTitle", p.status as "projectStatus", p."budgetInitial" as "projectBudgetInitial", p."budgetSpent" as "projectBudgetSpent", p."startDate" as "projectStartDate", p."endDate" as "projectEndDate", p.department as "projectDepartment", p."leaderId" as "projectLeaderId",
               u.name as "presenterName", u.email as "presenterEmail", u.role as "presenterRole"
        FROM "irPresentation" pres
        LEFT JOIN "irResearchProject" p ON pres."projectId" = p.id
        LEFT JOIN "irUser" u ON pres."presenterId" = u.id
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
        presenter: {
          id: row.presenterId,
          name: row.presenterName,
          email: row.presenterEmail,
          role: row.presenterRole
        }
      }));
    },
    findUnique: async (id: string) => {
      const sql = `
        SELECT pres.*, 
               p.title as "projectTitle", p.status as "projectStatus", p."budgetInitial" as "projectBudgetInitial", p."budgetSpent" as "projectBudgetSpent", p."startDate" as "projectStartDate", p."endDate" as "projectEndDate", p.department as "projectDepartment", p."leaderId" as "projectLeaderId",
               u.name as "presenterName", u.email as "presenterEmail", u.role as "presenterRole"
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
        presenter: {
          id: row.presenterId,
          name: row.presenterName,
          email: row.presenterEmail,
          role: row.presenterRole
        }
      };
    },
    create: async (data: any) => {
      const id = data.id || crypto.randomUUID();
      const sql = `
        INSERT INTO "irPresentation" (
          id, title, conference, type, status, "projectId", 
          "presenterId", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const res = await dbQuery(sql, [
        id, data.title, data.conference, data.type, data.status || 'PENDING',
        data.projectId || null, data.presenterId
      ]);
      return realDbHandlers.presentations.findUnique(res.rows[0].id);
    },
    update: async (id: string, data: any) => {
      const currentRes = await dbQuery('SELECT * FROM "irPresentation" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw new Error('Presentation not found');

      const title = data.title !== undefined ? data.title : current.title;
      const conference = data.conference !== undefined ? data.conference : current.conference;
      const type = data.type !== undefined ? data.type : current.type;
      const status = data.status !== undefined ? data.status : current.status;
      const projectId = data.projectId !== undefined ? data.projectId : current.projectId;
      const presenterId = data.presenterId !== undefined ? data.presenterId : current.presenterId;

      await dbQuery(`
        UPDATE "irPresentation" SET
          title = $1, conference = $2, type = $3, status = $4,
          "projectId" = $5, "presenterId" = $6, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $7
      `, [
        title, conference, type, status, projectId || null, presenterId, id
      ]);
      return realDbHandlers.presentations.findUnique(id);
    },
    delete: async (id: string) => {
      const res = await dbQuery('DELETE FROM "irPresentation" WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    }
  },
  consultations: {
    findMany: async () => {
      const sql = `
        SELECT c.*, 
               a.name as "advisorName", a.email as "advisorEmail", a.role as "advisorRole",
               r.name as "requesterName", r.email as "requesterEmail", r.role as "requesterRole"
        FROM "irConsultation" c
        LEFT JOIN "irUser" a ON c."advisorId" = a.id
        LEFT JOIN "irUser" r ON c."requesterId" = r.id
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
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        advisor: {
          id: row.advisorId,
          name: row.advisorName,
          email: row.advisorEmail,
          role: row.advisorRole
        },
        requester: {
          id: row.requesterId,
          name: row.requesterName,
          email: row.requesterEmail,
          role: row.requesterRole
        }
      }));
    },
    findUnique: async (id: string) => {
      const sql = `
        SELECT c.*, 
               a.name as "advisorName", a.email as "advisorEmail", a.role as "advisorRole",
               r.name as "requesterName", r.email as "requesterEmail", r.role as "requesterRole"
        FROM "irConsultation" c
        LEFT JOIN "irUser" a ON c."advisorId" = a.id
        LEFT JOIN "irUser" r ON c."requesterId" = r.id
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
        createdAt: toIsoString(row.createdAt),
        updatedAt: toIsoString(row.updatedAt),
        advisor: {
          id: row.advisorId,
          name: row.advisorName,
          email: row.advisorEmail,
          role: row.advisorRole
        },
        requester: {
          id: row.requesterId,
          name: row.requesterName,
          email: row.requesterEmail,
          role: row.requesterRole
        }
      };
    },
    create: async (data: any) => {
      const id = data.id || crypto.randomUUID();
      const sql = `
        INSERT INTO "irConsultation" (
          id, type, "appointmentTime", status, "advisorId", 
          "requesterId", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      const res = await dbQuery(sql, [
        id, data.type, new Date(data.appointmentTime), data.status || 'SCHEDULED',
        data.advisorId, data.requesterId
      ]);
      return realDbHandlers.consultations.findUnique(res.rows[0].id);
    },
    update: async (id: string, data: any) => {
      const currentRes = await dbQuery('SELECT * FROM "irConsultation" WHERE id = $1', [id]);
      const current = currentRes.rows[0];
      if (!current) throw new Error('Consultation not found');

      const type = data.type !== undefined ? data.type : current.type;
      const appointmentTime = data.appointmentTime !== undefined ? new Date(data.appointmentTime) : current.appointmentTime;
      const status = data.status !== undefined ? data.status : current.status;
      const advisorId = data.advisorId !== undefined ? data.advisorId : current.advisorId;
      const requesterId = data.requesterId !== undefined ? data.requesterId : current.requesterId;

      await dbQuery(`
        UPDATE "irConsultation" SET
          type = $1, "appointmentTime" = $2, status = $3,
          "advisorId" = $4, "requesterId" = $5, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $6
      `, [
        type, appointmentTime, status, advisorId, requesterId, id
      ]);
      return realDbHandlers.consultations.findUnique(id);
    },
    delete: async (id: string) => {
      const res = await dbQuery('DELETE FROM "irConsultation" WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
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
 */
export const apiDb = new Proxy({} as any, {
  get(target, prop) {
    let d1 = null;
    try {
      const ctx = getRequestContext();
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
