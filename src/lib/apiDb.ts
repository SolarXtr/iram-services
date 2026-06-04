import { db } from './db';
import { mockDb } from './mockDb';

const connectionString = process.env.DATABASE_URL;
const isMock = !connectionString || 
               connectionString.includes('localhost:51213') || 
               connectionString.startsWith('prisma+postgres://') || 
               connectionString.startsWith('mock:');

export const apiDb = isMock ? mockDb : {
  users: {
    findMany: async () => {
      return db.user.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    findUnique: async (id: string) => {
      return db.user.findUnique({
        where: { id }
      });
    },
    create: async (data: any) => {
      return db.user.create({
        data
      });
    },
    update: async (id: string, data: any) => {
      return db.user.update({
        where: { id },
        data
      });
    },
    delete: async (id: string) => {
      return db.user.delete({
        where: { id }
      });
    }
  },
  projects: {
    findMany: async () => {
      return db.researchProject.findMany({
        include: { leader: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    findUnique: async (id: string) => {
      return db.researchProject.findUnique({
        where: { id },
        include: { leader: true }
      });
    },
    create: async (data: any) => {
      return db.researchProject.create({
        data,
        include: { leader: true }
      });
    },
    update: async (id: string, data: any) => {
      return db.researchProject.update({
        where: { id },
        data,
        include: { leader: true }
      });
    },
    delete: async (id: string) => {
      return db.researchProject.delete({
        where: { id }
      });
    }
  },
  publications: {
    findMany: async () => {
      return db.publication.findMany({
        include: { project: true, author: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    findUnique: async (id: string) => {
      return db.publication.findUnique({
        where: { id },
        include: { project: true, author: true }
      });
    },
    create: async (data: any) => {
      return db.publication.create({
        data,
        include: { project: true, author: true }
      });
    },
    update: async (id: string, data: any) => {
      return db.publication.update({
        where: { id },
        data,
        include: { project: true, author: true }
      });
    },
    delete: async (id: string) => {
      return db.publication.delete({
        where: { id }
      });
    }
  },
  presentations: {
    findMany: async () => {
      return db.presentation.findMany({
        include: { project: true, presenter: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    findUnique: async (id: string) => {
      return db.presentation.findUnique({
        where: { id },
        include: { project: true, presenter: true }
      });
    },
    create: async (data: any) => {
      return db.presentation.create({
        data,
        include: { project: true, presenter: true }
      });
    },
    update: async (id: string, data: any) => {
      return db.presentation.update({
        where: { id },
        data,
        include: { project: true, presenter: true }
      });
    },
    delete: async (id: string) => {
      return db.presentation.delete({
        where: { id }
      });
    }
  },
  consultations: {
    findMany: async () => {
      return db.consultation.findMany({
        include: { advisor: true, requester: true },
        orderBy: { appointmentTime: 'asc' }
      });
    },
    findUnique: async (id: string) => {
      return db.consultation.findUnique({
        where: { id },
        include: { advisor: true, requester: true }
      });
    },
    create: async (data: any) => {
      return db.consultation.create({
        data,
        include: { advisor: true, requester: true }
      });
    },
    update: async (id: string, data: any) => {
      return db.consultation.update({
        where: { id },
        data,
        include: { advisor: true, requester: true }
      });
    },
    delete: async (id: string) => {
      return db.consultation.delete({
        where: { id }
      });
    }
  }
};

export { isMock };
