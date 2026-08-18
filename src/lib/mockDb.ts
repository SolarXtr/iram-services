// Types matching database models
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  title?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockProject {
  id: string;
  title: string;
  status: 'PROPOSED' | 'APPROVED' | 'ONGOING' | 'COMPLETED' | 'TERMINATED';
  budgetInitial: number;
  budgetSpent: number;
  startDate: string;
  endDate: string;
  ceuConsultDate?: string | null;
  irbNo?: string | null;
  approvedDate?: string | null;
  department?: string | null;
  leaderId: string;
  ceuConsultId?: string | null;
  ceuBypassReason?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockPublication {
  id: string;
  title: string;
  journal: string;
  quartile: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  rewardStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rewardAmount: number;
  status: 'WRITING' | 'UNDER_REVIEW' | 'PUBLISHED' | 'REWARDED';
  projectId?: string | null;
  authorId: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockPresentation {
  id: string;
  title: string;
  conference: string;
  type: 'ORAL' | 'POSTER';
  status: 'PENDING' | 'PRESENTED';
  projectId?: string | null;
  presenterId: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockConsultation {
  id: string;
  type: 'PROTOCOL' | 'STATISTICAL';
  appointmentTime: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  advisorId: string;
  requesterId: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockAuditLog {
  id: string;
  tableName: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  oldData?: string | null;
  newData?: string | null;
  performedBy?: string | null;
  timestamp: string;
}

export interface MockProposalEvaluation {
  id: string;
  projectId: string;
  evaluatorId: string;
  evaluatorType?: string | null;
  feedbackResearchProcess?: string | null;
  feedbackOriginality?: string | null;
  feedbackExpectedOutput?: string | null;
  feedbackBudgetAppropriate?: string | null;
  scoreOverallQuality?: number | null;
  bankAccountName?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  bankAccountNumber?: string | null;
  bankBookAttachmentName?: string | null;
  bankBookAttachmentData?: string | null;
  status: 'DRAFT' | 'SUBMITTED';
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DBStructure {
  users: MockUser[];
  projects: MockProject[];
  publications: MockPublication[];
  presentations: MockPresentation[];
  consultations: MockConsultation[];
  auditLogs: MockAuditLog[];
  evaluations?: MockProposalEvaluation[];
}

import mockDbData from '../../mock-db.json';

const defaultData: DBStructure = mockDbData as any;

// In-memory database state
let dbState: DBStructure = { ...defaultData };

function readDb(): DBStructure {
  if (!dbState.evaluations) {
    dbState.evaluations = [];
  }
  return dbState;
}

function writeDb(data: DBStructure) {
  dbState = data;
}

const splitThaiName = (fullName: string) => {
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

// Global helper to write audit logs in mock DB
const logAction = (tableName: string, recordId: string, action: 'CREATE' | 'UPDATE' | 'DELETE', oldData: any, newData: any, performedBy?: string | null) => {
  const db = readDb();
  if (!db.auditLogs) {
    db.auditLogs = [];
  }
  let actor = performedBy;
  if (!actor) {
    actor = getPerformedByFromHeaders();
  }
  db.auditLogs.push({
    id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    tableName,
    recordId,
    action,
    oldData: oldData ? JSON.stringify(oldData) : null,
    newData: newData ? JSON.stringify(newData) : null,
    performedBy: actor || 'system',
    timestamp: new Date().toISOString(),
  });
  writeDb(db);
};

// Helper to map and decode user roles
const mapUserRoles = (u: any): MockUser => {
  if (!u) return u;
  return {
    ...u,
    roles: u.role ? u.role.split(',') : [],
  };
};

export const mockDb = {
  // Users CRUD
  users: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const includeDeleted = options?.includeDeleted ?? false;
      const users = readDb().users.filter((u) => includeDeleted || !u.isDeleted);
      return users.map((u) => {
        if (!u.firstName) {
          const parsed = splitThaiName(u.name);
          u.title = parsed.title;
          u.firstName = parsed.firstName;
          u.lastName = parsed.lastName;
        }
        return mapUserRoles(u);
      }).sort((a, b) => (a.firstName || '').localeCompare(b.firstName || '', 'th'));
    },
    findUnique: async (id: string) => {
      const u = readDb().users.find((u) => u.id === id);
      if (!u) return null;
      if (!u.firstName) {
        const parsed = splitThaiName(u.name);
        u.title = parsed.title;
        u.firstName = parsed.firstName;
        u.lastName = parsed.lastName;
      }
      return mapUserRoles(u);
    },
    create: async (data: Omit<MockUser, 'id' | 'createdAt' | 'updatedAt'>, performedBy?: string | null) => {
      const db = readDb();
      const title = data.title || '';
      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      const name = data.name || `${title} ${firstName} ${lastName}`.trim().replace(/\s+/, ' ');
      const newUser: MockUser = {
        ...data,
        name,
        title,
        firstName,
        lastName,
        id: 'user-' + Date.now(),
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      writeDb(db);
      logAction('irUser', newUser.id, 'CREATE', null, newUser, performedBy);
      return mapUserRoles(newUser);
    },
    update: async (id: string, data: Partial<Omit<MockUser, 'id' | 'createdAt' | 'updatedAt'>>, performedBy?: string | null) => {
      const db = readDb();
      const idx = db.users.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error('User not found');
      const oldVal = { ...db.users[idx] };
      const title = data.title !== undefined ? data.title : oldVal.title;
      const firstName = data.firstName !== undefined ? data.firstName : oldVal.firstName;
      const lastName = data.lastName !== undefined ? data.lastName : oldVal.lastName;
      const name = data.name || `${title} ${firstName} ${lastName}`.trim().replace(/\s+/, ' ');
      db.users[idx] = {
        ...db.users[idx],
        ...data,
        name,
        title,
        firstName,
        lastName,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      logAction('irUser', id, 'UPDATE', oldVal, db.users[idx], performedBy);
      return mapUserRoles(db.users[idx]);
    },
    delete: async (id: string, performedBy?: string | null) => {
      const db = readDb();
      const idx = db.users.findIndex((u) => u.id === id && !u.isDeleted);
      if (idx === -1) throw new Error('User not found');

      // Check if user has active projects (APPROVED or ONGOING)
      const hasActiveProject = db.projects.some(
        (p) => p.leaderId === id && !p.isDeleted && (p.status === 'APPROVED' || p.status === 'ONGOING')
      );
      if (hasActiveProject) {
        throw new Error('ไม่สามารถลบนักวิจัยรายนี้ได้ เนื่องจากยังมีโครงการวิจัยที่กำลังดำเนินงานอยู่ กรุณาทำการโอนย้ายโครงการวิจัยให้ผู้อื่นดูแลแทนก่อนลบ');
      }

      const oldVal = { ...db.users[idx] };
      
      // Perform soft delete
      db.users[idx].isDeleted = true;
      db.users[idx].updatedAt = new Date().toISOString();
      writeDb(db);
      
      logAction('irUser', id, 'DELETE', oldVal, null, performedBy);
      return mapUserRoles(oldVal);
    },
  },

  // Projects CRUD
  projects: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const db = readDb();
      const includeDeleted = options?.includeDeleted ?? false;
      return db.projects
        .filter((p) => includeDeleted || !p.isDeleted)
        .map((p) => ({
          ...p,
          leader: mapUserRoles(db.users.find((u) => u.id === p.leaderId)),
        }));
    },
    findUnique: async (id: string) => {
      const db = readDb();
      const p = db.projects.find((x) => x.id === id);
      if (!p) return null;
      return {
        ...p,
        leader: mapUserRoles(db.users.find((u) => u.id === p.leaderId)),
      };
    },
    create: async (data: Omit<MockProject, 'id' | 'createdAt' | 'updatedAt'>, performedBy?: string | null) => {
      const db = readDb();
      const newProj: MockProject = {
        ...data,
        id: 'project-' + Date.now(),
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.projects.push(newProj);
      writeDb(db);
      logAction('irResearchProject', newProj.id, 'CREATE', null, newProj, performedBy);
      return {
        ...newProj,
        leader: mapUserRoles(db.users.find((u) => u.id === newProj.leaderId)),
      };
    },
    update: async (id: string, data: Partial<Omit<MockProject, 'id' | 'createdAt' | 'updatedAt'>>, performedBy?: string | null) => {
      const db = readDb();
      const idx = db.projects.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Project not found');
      const oldVal = { ...db.projects[idx] };
      db.projects[idx] = {
        ...db.projects[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      logAction('irResearchProject', id, 'UPDATE', oldVal, db.projects[idx], performedBy);
      return {
        ...db.projects[idx],
        leader: mapUserRoles(db.users.find((u) => u.id === db.projects[idx].leaderId)),
      };
    },
    delete: async (id: string, performedBy?: string | null) => {
      const db = readDb();
      const idx = db.projects.findIndex((x) => x.id === id && !x.isDeleted);
      if (idx === -1) throw new Error('Project not found');
      const oldVal = { ...db.projects[idx] };
      
      // Perform soft delete
      db.projects[idx].isDeleted = true;
      db.projects[idx].updatedAt = new Date().toISOString();
      writeDb(db);
      
      logAction('irResearchProject', id, 'DELETE', oldVal, null, performedBy);
      return oldVal;
    },
  },

  // Publications CRUD
  publications: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const db = readDb();
      const includeDeleted = options?.includeDeleted ?? false;
      return db.publications
        .filter((p) => includeDeleted || !p.isDeleted)
        .map((p) => ({
          ...p,
          project: db.projects.find((proj) => proj.id === p.projectId) || null,
          author: mapUserRoles(db.users.find((u) => u.id === p.authorId)),
        }));
    },
    findUnique: async (id: string) => {
      const db = readDb();
      const p = db.publications.find((x) => x.id === id);
      if (!p) return null;
      return {
        ...p,
        project: db.projects.find((proj) => proj.id === p.projectId) || null,
        author: mapUserRoles(db.users.find((u) => u.id === p.authorId)),
      };
    },
    create: async (data: Omit<MockPublication, 'id' | 'createdAt' | 'updatedAt'>, performedBy?: string | null) => {
      const db = readDb();
      const newPub: MockPublication = {
        ...data,
        id: 'pub-' + Date.now(),
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.publications.push(newPub);
      writeDb(db);
      logAction('irPublication', newPub.id, 'CREATE', null, newPub, performedBy);
      return {
        ...newPub,
        project: db.projects.find((proj) => proj.id === newPub.projectId) || null,
        author: mapUserRoles(db.users.find((u) => u.id === newPub.authorId)),
      };
    },
    update: async (id: string, data: Partial<Omit<MockPublication, 'id' | 'createdAt' | 'updatedAt'>>, performedBy?: string | null) => {
      const db = readDb();
      const idx = db.publications.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Publication not found');
      const oldVal = { ...db.publications[idx] };
      db.publications[idx] = {
        ...db.publications[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      logAction('irPublication', id, 'UPDATE', oldVal, db.publications[idx], performedBy);
      return {
        ...db.publications[idx],
        project: db.projects.find((proj) => proj.id === db.publications[idx].projectId) || null,
        author: mapUserRoles(db.users.find((u) => u.id === db.publications[idx].authorId)),
      };
    },
    delete: async (id: string, performedBy?: string | null) => {
      const db = readDb();
      const idx = db.publications.findIndex((x) => x.id === id && !x.isDeleted);
      if (idx === -1) throw new Error('Publication not found');
      const oldVal = { ...db.publications[idx] };
      
      // Perform soft delete
      db.publications[idx].isDeleted = true;
      db.publications[idx].updatedAt = new Date().toISOString();
      writeDb(db);
      
      logAction('irPublication', id, 'DELETE', oldVal, null, performedBy);
      return oldVal;
    },
  },

  // Presentations CRUD
  presentations: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const db = readDb();
      const includeDeleted = options?.includeDeleted ?? false;
      return db.presentations
        .filter((p) => includeDeleted || !p.isDeleted)
        .map((p) => ({
          ...p,
          project: db.projects.find((proj) => proj.id === p.projectId) || null,
          presenter: mapUserRoles(db.users.find((u) => u.id === p.presenterId)),
        }));
    },
    findUnique: async (id: string) => {
      const db = readDb();
      const p = db.presentations.find((x) => x.id === id);
      if (!p) return null;
      return {
        ...p,
        project: db.projects.find((proj) => proj.id === p.projectId) || null,
        presenter: mapUserRoles(db.users.find((u) => u.id === p.presenterId)),
      };
    },
    create: async (data: Omit<MockPresentation, 'id' | 'createdAt' | 'updatedAt'>, performedBy?: string | null) => {
      const db = readDb();
      const newPres: MockPresentation = {
        ...data,
        id: 'pres-' + Date.now(),
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.presentations.push(newPres);
      writeDb(db);
      logAction('irPresentation', newPres.id, 'CREATE', null, newPres, performedBy);
      return {
        ...newPres,
        project: db.projects.find((proj) => proj.id === newPres.projectId) || null,
        presenter: mapUserRoles(db.users.find((u) => u.id === newPres.presenterId)),
      };
    },
    update: async (id: string, data: Partial<Omit<MockPresentation, 'id' | 'createdAt' | 'updatedAt'>>, performedBy?: string | null) => {
      const db = readDb();
      const idx = db.presentations.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Presentation not found');
      const oldVal = { ...db.presentations[idx] };
      db.presentations[idx] = {
        ...db.presentations[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      logAction('irPresentation', id, 'UPDATE', oldVal, db.presentations[idx], performedBy);
      return {
        ...db.presentations[idx],
        project: db.projects.find((proj) => proj.id === db.presentations[idx].projectId) || null,
        presenter: mapUserRoles(db.users.find((u) => u.id === db.presentations[idx].presenterId)),
      };
    },
    delete: async (id: string, performedBy?: string | null) => {
      const db = readDb();
      const idx = db.presentations.findIndex((x) => x.id === id && !x.isDeleted);
      if (idx === -1) throw new Error('Presentation not found');
      const oldVal = { ...db.presentations[idx] };
      
      // Perform soft delete
      db.presentations[idx].isDeleted = true;
      db.presentations[idx].updatedAt = new Date().toISOString();
      writeDb(db);
      
      logAction('irPresentation', id, 'DELETE', oldVal, null, performedBy);
      return oldVal;
    },
  },

  // Consultations CRUD
  consultations: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const db = readDb();
      const includeDeleted = options?.includeDeleted ?? false;
      return db.consultations
        .filter((c) => includeDeleted || !c.isDeleted)
        .map((c) => ({
          ...c,
          advisor: mapUserRoles(db.users.find((u) => u.id === c.advisorId)),
          requester: mapUserRoles(db.users.find((u) => u.id === c.requesterId)),
        }));
    },
    findUnique: async (id: string) => {
      const db = readDb();
      const c = db.consultations.find((x) => x.id === id);
      if (!c) return null;
      return {
        ...c,
        advisor: mapUserRoles(db.users.find((u) => u.id === c.advisorId)),
        requester: mapUserRoles(db.users.find((u) => u.id === c.requesterId)),
      };
    },
    create: async (data: Omit<MockConsultation, 'id' | 'createdAt' | 'updatedAt'>, performedBy?: string | null) => {
      const db = readDb();
      const newConsult: MockConsultation = {
        ...data,
        id: 'consult-' + Date.now(),
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.consultations.push(newConsult);
      writeDb(db);
      logAction('irConsultation', newConsult.id, 'CREATE', null, newConsult, performedBy);
      return {
        ...newConsult,
        advisor: mapUserRoles(db.users.find((u) => u.id === newConsult.advisorId)),
        requester: mapUserRoles(db.users.find((u) => u.id === newConsult.requesterId)),
      };
    },
    update: async (id: string, data: Partial<Omit<MockConsultation, 'id' | 'createdAt' | 'updatedAt'>>, performedBy?: string | null) => {
      const db = readDb();
      const idx = db.consultations.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Consultation not found');
      const oldVal = { ...db.consultations[idx] };
      db.consultations[idx] = {
        ...db.consultations[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      logAction('irConsultation', id, 'UPDATE', oldVal, db.consultations[idx], performedBy);
      return {
        ...db.consultations[idx],
        advisor: mapUserRoles(db.users.find((u) => u.id === db.consultations[idx].advisorId)),
        requester: mapUserRoles(db.users.find((u) => u.id === db.consultations[idx].requesterId)),
      };
    },
    delete: async (id: string, performedBy?: string | null) => {
      const db = readDb();
      const idx = db.consultations.findIndex((x) => x.id === id && !x.isDeleted);
      if (idx === -1) throw new Error('Consultation not found');
      const oldVal = { ...db.consultations[idx] };
      
      // Perform soft delete
      db.consultations[idx].isDeleted = true;
      db.consultations[idx].updatedAt = new Date().toISOString();
      writeDb(db);
      
      logAction('irConsultation', id, 'DELETE', oldVal, null, performedBy);
      return oldVal;
    },
  },
  
  // Evaluations CRUD
  evaluations: {
    findMany: async (options?: { includeDeleted?: boolean }) => {
      const db = readDb();
      const includeDeleted = options?.includeDeleted ?? false;
      return (db.evaluations || [])
        .filter((e) => includeDeleted || !e.isDeleted)
        .map((e) => ({
          ...e,
          project: db.projects.find((p) => p.id === e.projectId) || null,
          evaluator: mapUserRoles(db.users.find((u) => u.id === e.evaluatorId)) || null,
        }));
    },
    findUnique: async (id: string) => {
      const db = readDb();
      const e = (db.evaluations || []).find((x) => x.id === id);
      if (!e) return null;
      return {
        ...e,
        project: db.projects.find((p) => p.id === e.projectId) || null,
        evaluator: mapUserRoles(db.users.find((u) => u.id === e.evaluatorId)) || null,
      };
    },
    create: async (data: Omit<MockProposalEvaluation, 'id' | 'createdAt' | 'updatedAt'>, performedBy?: string | null) => {
      const db = readDb();
      const newEval: MockProposalEvaluation = {
        ...data,
        id: 'eval-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!db.evaluations) db.evaluations = [];
      db.evaluations.push(newEval);
      writeDb(db);
      logAction('irProposalEvaluation', newEval.id, 'CREATE', null, newEval, performedBy);
      return {
        ...newEval,
        project: db.projects.find((p) => p.id === newEval.projectId) || null,
        evaluator: mapUserRoles(db.users.find((u) => u.id === newEval.evaluatorId)) || null,
      };
    },
    update: async (id: string, data: Partial<Omit<MockProposalEvaluation, 'id' | 'createdAt' | 'updatedAt'>>, performedBy?: string | null) => {
      const db = readDb();
      const idx = (db.evaluations || []).findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Evaluation not found');
      const oldVal = { ...db.evaluations![idx] };
      db.evaluations![idx] = {
        ...db.evaluations![idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      logAction('irProposalEvaluation', id, 'UPDATE', oldVal, db.evaluations![idx], performedBy);
      return {
        ...db.evaluations![idx],
        project: db.projects.find((p) => p.id === db.evaluations![idx].projectId) || null,
        evaluator: mapUserRoles(db.users.find((u) => u.id === db.evaluations![idx].evaluatorId)) || null,
      };
    },
    delete: async (id: string, performedBy?: string | null) => {
      const db = readDb();
      const idx = (db.evaluations || []).findIndex((x) => x.id === id && !x.isDeleted);
      if (idx === -1) throw new Error('Evaluation not found');
      const oldVal = { ...db.evaluations![idx] };
      db.evaluations![idx].isDeleted = true;
      db.evaluations![idx].updatedAt = new Date().toISOString();
      writeDb(db);
      logAction('irProposalEvaluation', id, 'DELETE', oldVal, null, performedBy);
      return oldVal;
    }
  },
  
  // Audit Logs Read
  auditLogs: {
    findMany: async () => {
      return readDb().auditLogs || [];
    },
    findHistory: async () => {
      return [];
    }
  }
};
