// Types matching Prisma models
export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'RESEARCHER' | 'STAFF' | 'EXECUTIVE';
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
  createdAt: string;
  updatedAt: string;
}

interface DBStructure {
  users: MockUser[];
  projects: MockProject[];
  publications: MockPublication[];
  presentations: MockPresentation[];
  consultations: MockConsultation[];
}

const defaultData: DBStructure = {
  users: [
    {
      id: 'user-1',
      name: 'ศ.ดร. สมเกียรติ รักเรียน (นักวิจัย)',
      email: 'somkiat.r@iram.edu',
      role: 'RESEARCHER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user-2',
      name: 'ดร. วิภา จิตวิทยา (นักวิจัย)',
      email: 'wipa.j@iram.edu',
      role: 'RESEARCHER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user-3',
      name: 'คุณ วันดี ทำงานดี (เจ้าหน้าที่)',
      email: 'wandee.w@iram.edu',
      role: 'STAFF',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'user-4',
      name: 'รศ.นพ. ทรงพล บริหาร (ผู้บริหาร)',
      email: 'songpol.s@iram.edu',
      role: 'EXECUTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  projects: [
    {
      id: 'project-1',
      title: 'โครงการวิจัยการวิเคราะห์ปัญญาประดิษฐ์เพื่อทำนายโรคหัวใจระยะแรก',
      status: 'ONGOING',
      budgetInitial: 500000,
      budgetSpent: 120000,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: '2026-12-31T23:59:59.000Z',
      ceuConsultDate: '2025-11-12T10:00:00.000Z',
      irbNo: 'IRB-2025-0987',
      approvedDate: '2025-12-15T09:00:00.000Z',
      department: 'คณะแพทยศาสตร์',
      leaderId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'project-2',
      title: 'โครงการศึกษาระบาดวิทยาของไวรัสชนิดใหม่ในเขตร้อนชื้น',
      status: 'APPROVED',
      budgetInitial: 350000,
      budgetSpent: 0,
      startDate: '2026-06-01T00:00:00.000Z',
      endDate: '2027-05-31T23:59:59.000Z',
      ceuConsultDate: '2026-04-10T13:30:00.000Z',
      irbNo: 'IRB-2026-0112',
      approvedDate: '2026-05-20T11:00:00.000Z',
      department: 'คณะวิทยาศาสตร์',
      leaderId: 'user-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'project-3',
      title: 'การศึกษาสมุนไพรไทยต้านอนุมูลอิสระเพื่อพัฒนาเป็นเวชสำอาง',
      status: 'COMPLETED',
      budgetInitial: 600000,
      budgetSpent: 590000,
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-12-31T23:59:59.000Z',
      ceuConsultDate: '2024-11-05T09:00:00.000Z',
      irbNo: 'IRB-2024-0012',
      approvedDate: '2024-12-10T14:00:00.000Z',
      department: 'คณะเภสัชศาสตร์',
      leaderId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  publications: [
    {
      id: 'pub-1',
      title: 'Deep Learning Application in Early Detection of Coronary Artery Disease',
      journal: 'Journal of Medical Systems',
      quartile: 'Q1',
      rewardStatus: 'APPROVED',
      rewardAmount: 50000,
      status: 'REWARDED',
      projectId: 'project-1',
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pub-2',
      title: 'Antioxidant activities of Thai traditional herbs for skincare application',
      journal: 'Cosmetics & Dermatology Research',
      quartile: 'Q2',
      rewardStatus: 'PENDING',
      rewardAmount: 30000,
      status: 'PUBLISHED',
      projectId: 'project-3',
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pub-3',
      title: 'Novel tropical virus structures analysis in Southeast Asia',
      journal: 'Asia-Pacific Journal of Virology',
      quartile: 'Q1',
      rewardStatus: 'PENDING',
      rewardAmount: 50000,
      status: 'UNDER_REVIEW',
      projectId: 'project-2',
      authorId: 'user-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  presentations: [
    {
      id: 'pres-1',
      title: 'AI model predicting early coronary artery disease',
      conference: 'International Conference on Medical AI (ICMAI 2026)',
      type: 'ORAL',
      status: 'PRESENTED',
      projectId: 'project-1',
      presenterId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'pres-2',
      title: 'Epidemiology of new tropical viruses in East Asia',
      conference: 'Asean Virology Summit 2026',
      type: 'POSTER',
      status: 'PENDING',
      projectId: 'project-2',
      presenterId: 'user-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  consultations: [
    {
      id: 'consult-1',
      type: 'PROTOCOL',
      appointmentTime: '2026-05-15T10:00:00.000Z',
      status: 'COMPLETED',
      advisorId: 'user-3',
      requesterId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'consult-2',
      type: 'STATISTICAL',
      appointmentTime: '2026-05-18T14:00:00.000Z',
      status: 'COMPLETED',
      advisorId: 'user-3',
      requesterId: 'user-2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'consult-3',
      type: 'PROTOCOL',
      appointmentTime: '2026-06-20T09:30:00.000Z',
      status: 'SCHEDULED',
      advisorId: 'user-3',
      requesterId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};

// In-memory database state
let dbState: DBStructure = { ...defaultData };

function readDb(): DBStructure {
  return dbState;
}

function writeDb(data: DBStructure) {
  dbState = data;
}

export const mockDb = {
  // Users CRUD
  users: {
    findMany: async () => {
      return readDb().users;
    },
    findUnique: async (id: string) => {
      return readDb().users.find((u) => u.id === id) || null;
    },
    create: async (data: Omit<MockUser, 'id' | 'createdAt' | 'updatedAt'>) => {
      const db = readDb();
      const newUser: MockUser = {
        ...data,
        id: 'user-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      writeDb(db);
      return newUser;
    },
    update: async (id: string, data: Partial<Omit<MockUser, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const db = readDb();
      const idx = db.users.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error('User not found');
      db.users[idx] = {
        ...db.users[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      return db.users[idx];
    },
    delete: async (id: string) => {
      const db = readDb();
      const idx = db.users.findIndex((u) => u.id === id);
      if (idx === -1) throw new Error('User not found');
      const deleted = db.users[idx];
      db.users.splice(idx, 1);
      writeDb(db);
      return deleted;
    },
  },

  // Projects CRUD
  projects: {
    findMany: async () => {
      const db = readDb();
      return db.projects.map((p) => ({
        ...p,
        leader: db.users.find((u) => u.id === p.leaderId),
      }));
    },
    findUnique: async (id: string) => {
      const db = readDb();
      const p = db.projects.find((x) => x.id === id);
      if (!p) return null;
      return {
        ...p,
        leader: db.users.find((u) => u.id === p.leaderId),
      };
    },
    create: async (data: Omit<MockProject, 'id' | 'createdAt' | 'updatedAt'>) => {
      const db = readDb();
      const newProj: MockProject = {
        ...data,
        id: 'project-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.projects.push(newProj);
      writeDb(db);
      return {
        ...newProj,
        leader: db.users.find((u) => u.id === newProj.leaderId),
      };
    },
    update: async (id: string, data: Partial<Omit<MockProject, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const db = readDb();
      const idx = db.projects.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Project not found');
      db.projects[idx] = {
        ...db.projects[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      return {
        ...db.projects[idx],
        leader: db.users.find((u) => u.id === db.projects[idx].leaderId),
      };
    },
    delete: async (id: string) => {
      const db = readDb();
      const idx = db.projects.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Project not found');
      const deleted = db.projects[idx];
      db.projects.splice(idx, 1);
      writeDb(db);
      return deleted;
    },
  },

  // Publications CRUD
  publications: {
    findMany: async () => {
      const db = readDb();
      return db.publications.map((p) => ({
        ...p,
        project: db.projects.find((proj) => proj.id === p.projectId) || null,
        author: db.users.find((u) => u.id === p.authorId),
      }));
    },
    findUnique: async (id: string) => {
      const db = readDb();
      const p = db.publications.find((x) => x.id === id);
      if (!p) return null;
      return {
        ...p,
        project: db.projects.find((proj) => proj.id === p.projectId) || null,
        author: db.users.find((u) => u.id === p.authorId),
      };
    },
    create: async (data: Omit<MockPublication, 'id' | 'createdAt' | 'updatedAt'>) => {
      const db = readDb();
      const newPub: MockPublication = {
        ...data,
        id: 'pub-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.publications.push(newPub);
      writeDb(db);
      return {
        ...newPub,
        project: db.projects.find((proj) => proj.id === newPub.projectId) || null,
        author: db.users.find((u) => u.id === newPub.authorId),
      };
    },
    update: async (id: string, data: Partial<Omit<MockPublication, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const db = readDb();
      const idx = db.publications.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Publication not found');
      db.publications[idx] = {
        ...db.publications[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      return {
        ...db.publications[idx],
        project: db.projects.find((proj) => proj.id === db.publications[idx].projectId) || null,
        author: db.users.find((u) => u.id === db.publications[idx].authorId),
      };
    },
    delete: async (id: string) => {
      const db = readDb();
      const idx = db.publications.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Publication not found');
      const deleted = db.publications[idx];
      db.publications.splice(idx, 1);
      writeDb(db);
      return deleted;
    },
  },

  // Presentations CRUD
  presentations: {
    findMany: async () => {
      const db = readDb();
      return db.presentations.map((p) => ({
        ...p,
        project: db.projects.find((proj) => proj.id === p.projectId) || null,
        presenter: db.users.find((u) => u.id === p.presenterId),
      }));
    },
    findUnique: async (id: string) => {
      const db = readDb();
      const p = db.presentations.find((x) => x.id === id);
      if (!p) return null;
      return {
        ...p,
        project: db.projects.find((proj) => proj.id === p.projectId) || null,
        presenter: db.users.find((u) => u.id === p.presenterId),
      };
    },
    create: async (data: Omit<MockPresentation, 'id' | 'createdAt' | 'updatedAt'>) => {
      const db = readDb();
      const newPres: MockPresentation = {
        ...data,
        id: 'pres-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.presentations.push(newPres);
      writeDb(db);
      return {
        ...newPres,
        project: db.projects.find((proj) => proj.id === newPres.projectId) || null,
        presenter: db.users.find((u) => u.id === newPres.presenterId),
      };
    },
    update: async (id: string, data: Partial<Omit<MockPresentation, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const db = readDb();
      const idx = db.presentations.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Presentation not found');
      db.presentations[idx] = {
        ...db.presentations[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      return {
        ...db.presentations[idx],
        project: db.projects.find((proj) => proj.id === db.presentations[idx].projectId) || null,
        presenter: db.users.find((u) => u.id === db.presentations[idx].presenterId),
      };
    },
    delete: async (id: string) => {
      const db = readDb();
      const idx = db.presentations.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Presentation not found');
      const deleted = db.presentations[idx];
      db.presentations.splice(idx, 1);
      writeDb(db);
      return deleted;
    },
  },

  // Consultations CRUD
  consultations: {
    findMany: async () => {
      const db = readDb();
      return db.consultations.map((c) => ({
        ...c,
        advisor: db.users.find((u) => u.id === c.advisorId),
        requester: db.users.find((u) => u.id === c.requesterId),
      }));
    },
    findUnique: async (id: string) => {
      const db = readDb();
      const c = db.consultations.find((x) => x.id === id);
      if (!c) return null;
      return {
        ...c,
        advisor: db.users.find((u) => u.id === c.advisorId),
        requester: db.users.find((u) => u.id === c.requesterId),
      };
    },
    create: async (data: Omit<MockConsultation, 'id' | 'createdAt' | 'updatedAt'>) => {
      const db = readDb();
      const newConsult: MockConsultation = {
        ...data,
        id: 'consult-' + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.consultations.push(newConsult);
      writeDb(db);
      return {
        ...newConsult,
        advisor: db.users.find((u) => u.id === newConsult.advisorId),
        requester: db.users.find((u) => u.id === newConsult.requesterId),
      };
    },
    update: async (id: string, data: Partial<Omit<MockConsultation, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const db = readDb();
      const idx = db.consultations.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Consultation not found');
      db.consultations[idx] = {
        ...db.consultations[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      return {
        ...db.consultations[idx],
        advisor: db.users.find((u) => u.id === db.consultations[idx].advisorId),
        requester: db.users.find((u) => u.id === db.consultations[idx].requesterId),
      };
    },
    delete: async (id: string) => {
      const db = readDb();
      const idx = db.consultations.findIndex((x) => x.id === id);
      if (idx === -1) throw new Error('Consultation not found');
      const deleted = db.consultations[idx];
      db.consultations.splice(idx, 1);
      writeDb(db);
      return deleted;
    },
  },
};
