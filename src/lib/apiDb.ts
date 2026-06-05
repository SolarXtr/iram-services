import { db } from './db';
import { mockDb } from './mockDb';

const connectionString = process.env.DATABASE_URL;
let isDbMockActive = !connectionString || 
                     connectionString.includes('localhost:51213') || 
                     connectionString.startsWith('prisma+postgres://') || 
                     connectionString.startsWith('mock:');

// Helper to determine if we should report mock status
export { isDbMockActive as isMock };

const realDbHandlers = {
  users: {
    findMany: async () => db.user.findMany({ orderBy: { createdAt: 'desc' } }),
    findUnique: async (id: string) => db.user.findUnique({ where: { id } }),
    create: async (data: any) => db.user.create({ data }),
    update: async (id: string, data: any) => db.user.update({ where: { id }, data }),
    delete: async (id: string) => db.user.delete({ where: { id } })
  },
  projects: {
    findMany: async () => db.researchProject.findMany({ include: { leader: true }, orderBy: { createdAt: 'desc' } }),
    findUnique: async (id: string) => db.researchProject.findUnique({ where: { id }, include: { leader: true } }),
    create: async (data: any) => db.researchProject.create({ data, include: { leader: true } }),
    update: async (id: string, data: any) => db.researchProject.update({ where: { id }, data, include: { leader: true } }),
    delete: async (id: string) => db.researchProject.delete({ where: { id } })
  },
  publications: {
    findMany: async () => db.publication.findMany({ include: { project: true, author: true }, orderBy: { createdAt: 'desc' } }),
    findUnique: async (id: string) => db.publication.findUnique({ where: { id }, include: { project: true, author: true } }),
    create: async (data: any) => db.publication.create({ data, include: { project: true, author: true } }),
    update: async (id: string, data: any) => db.publication.update({ where: { id }, data, include: { project: true, author: true } }),
    delete: async (id: string) => db.publication.delete({ where: { id } })
  },
  presentations: {
    findMany: async () => db.presentation.findMany({ include: { project: true, presenter: true }, orderBy: { createdAt: 'desc' } }),
    findUnique: async (id: string) => db.presentation.findUnique({ where: { id }, include: { project: true, presenter: true } }),
    create: async (data: any) => db.presentation.create({ data, include: { project: true, presenter: true } }),
    update: async (id: string, data: any) => db.presentation.update({ where: { id }, data, include: { project: true, presenter: true } }),
    delete: async (id: string) => db.presentation.delete({ where: { id } })
  },
  consultations: {
    findMany: async () => db.consultation.findMany({ include: { advisor: true, requester: true }, orderBy: { appointmentTime: 'asc' } }),
    findUnique: async (id: string) => db.consultation.findUnique({ where: { id }, include: { advisor: true, requester: true } }),
    create: async (data: any) => db.consultation.create({ data, include: { advisor: true, requester: true } }),
    update: async (id: string, data: any) => db.consultation.update({ where: { id }, data, include: { advisor: true, requester: true } }),
    delete: async (id: string) => db.consultation.delete({ where: { id } })
  }
};

// Create a safe Proxy that routes to real database but falls back to mockDb if there's any database error
export const apiDb = new Proxy({} as typeof realDbHandlers, {
  get(target, prop) {
    if (typeof prop === 'string') {
      return new Proxy({}, {
        get(subTarget, subProp) {
          if (typeof subProp === 'string') {
            return async (...args: any[]) => {
              if (isDbMockActive) {
                return (mockDb as any)[prop][subProp](...args);
              }
              try {
                return await (realDbHandlers as any)[prop][subProp](...args);
              } catch (error) {
                console.error(`Database error in ${prop}.${subProp}, falling back to Mock Database:`, error);
                isDbMockActive = true;
                return (mockDb as any)[prop][subProp](...args);
              }
            };
          }
        }
      });
    }
  }
});
