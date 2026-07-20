-- ========================================================
-- D1 SQLite Schema to create tables for iRAM Services System
-- ========================================================

-- Drop tables if they exist
DROP TABLE IF EXISTS "irConsultation";
DROP TABLE IF EXISTS "irPresentation";
DROP TABLE IF EXISTS "irPublicationAuthor";
DROP TABLE IF EXISTS "irPublication";
DROP TABLE IF EXISTS "irResearchProject";
DROP TABLE IF EXISTS "irResearcherProfile";
DROP TABLE IF EXISTS "irUser";
DROP TABLE IF EXISTS "irAuditLog";

-- 1. Create "irUser" Table
CREATE TABLE "irUser" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "role" TEXT NOT NULL, -- 'RESEARCHER', 'STAFF', 'EXECUTIVE'
    "isDeleted" INTEGER DEFAULT 0,
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- 2. Create "irResearchProject" Table
CREATE TABLE "irResearchProject" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL, -- 'PROPOSED', 'APPROVED', 'ONGOING', 'COMPLETED', 'TERMINATED'
    "budgetInitial" REAL NOT NULL,
    "budgetSpent" REAL DEFAULT 0.0,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "ceuConsultDate" TEXT,
    "irbNo" TEXT,
    "approvedDate" TEXT,
    "department" TEXT,
    "leaderId" TEXT NOT NULL,
    "isDeleted" INTEGER DEFAULT 0,
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY ("leaderId") REFERENCES "irUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3. Create "irPublication" Table
CREATE TABLE "irPublication" (
    "id" TEXT PRIMARY KEY,
    "doi" TEXT UNIQUE,
    "title" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "year" TEXT,
    "coverDate" TEXT,
    "quartile" TEXT NOT NULL, -- 'Q1', 'Q2', 'Q3', 'Q4'
    "uniRewardStatus" TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    "uniRewardAmount" REAL DEFAULT 0.0,
    "facultyRewardStatus" TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    "facultyRewardAmount" REAL DEFAULT 0.0,
    "status" TEXT NOT NULL, -- 'WRITING', 'SUBMITTED', 'UNDER_REVIEW', 'PUBLISHED', 'REWARDED'
    "projectId" TEXT,
    "claimingAuthorId" TEXT,
    "isDeleted" INTEGER DEFAULT 0,
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY ("projectId") REFERENCES "irResearchProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("claimingAuthorId") REFERENCES "irUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 3.1 Create "irPublicationAuthor" Table
CREATE TABLE "irPublicationAuthor" (
    "id" TEXT PRIMARY KEY,
    "publicationId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "userId" TEXT,
    "authorOrder" INTEGER NOT NULL,
    "isCorresponding" INTEGER DEFAULT 0,
    FOREIGN KEY ("publicationId") REFERENCES "irPublication" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("userId") REFERENCES "irUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 4. Create "irPresentation" Table
CREATE TABLE "irPresentation" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "conference" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'ORAL', 'POSTER'
    "status" TEXT DEFAULT 'PENDING', -- 'PENDING', 'PRESENTED', 'CANCELLED'
    "projectId" TEXT,
    "presenterId" TEXT NOT NULL,
    "isDeleted" INTEGER DEFAULT 0,
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY ("projectId") REFERENCES "irResearchProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("presenterId") REFERENCES "irUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 5. Create "irConsultation" Table
CREATE TABLE "irConsultation" (
    "id" TEXT PRIMARY KEY,
    "type" TEXT NOT NULL, -- 'PROTOCOL', 'STATISTICAL'
    "appointmentTime" TEXT NOT NULL,
    "status" TEXT DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'COMPLETED', 'CANCELLED'
    "advisorId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "isDeleted" INTEGER DEFAULT 0,
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY ("advisorId") REFERENCES "irUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("requesterId") REFERENCES "irUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 6. Create "irAuditLog" Table
CREATE TABLE "irAuditLog" (
    "id" TEXT PRIMARY KEY,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldData" TEXT,
    "newData" TEXT,
    "performedBy" TEXT,
    "timestamp" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ========================================================
-- Seed Initial Mock Data
-- ========================================================

-- Users
INSERT INTO "irUser" ("id", "name", "email", "role") VALUES
('user-1', 'ศ.ดร. สมเกียรติ รักเรียน (นักวิจัย)', 'somkiat.r@iram.edu', 'RESEARCHER'),
('user-2', 'ดร. วิภา จิตวิทยา (นักวิจัย)', 'wipa.j@iram.edu', 'RESEARCHER'),
('user-3', 'คุณ วันดี ทำงานดี (เจ้าหน้าที่)', 'wandee.w@iram.edu', 'STAFF'),
('user-4', 'รศ.นพ. ทรงพล บริหาร (ผู้บริหาร)', 'songpol.s@iram.edu', 'EXECUTIVE');

-- Projects
INSERT INTO "irResearchProject" ("id", "title", "status", "budgetInitial", "budgetSpent", "startDate", "endDate", "ceuConsultDate", "irbNo", "approvedDate", "department", "leaderId") VALUES
('project-1', 'โครงการวิจัยการวิเคราะห์ปัญญาประดิษฐ์เพื่อทำนายโรคหัวใจระยะแรก', 'ONGOING', 500000.0, 120000.0, '2026-01-01T00:00:00.000Z', '2026-12-31T23:59:59.000Z', '2025-11-12T10:00:00.000Z', 'IRB-2025-0987', '2025-12-15T09:00:00.000Z', 'คณะแพทยศาสตร์', 'user-1'),
('project-2', 'โครงการศึกษาระบาดวิทยาของไวรัสชนิดใหม่ในเขตร้อนชื้น', 'APPROVED', 350000.0, 0.0, '2026-06-01T00:00:00.000Z', '2027-05-31T23:59:59.000Z', '2026-04-10T13:30:00.000Z', 'IRB-2026-0112', '2026-05-20T11:00:00.000Z', 'คณะวิทยาศาสตร์', 'user-2'),
('project-3', 'การศึกษาสมุนไพรไทยต้านอนุมูลอิสระเพื่อพัฒนาเป็นเวชสำอาง', 'COMPLETED', 600000.0, 590000.0, '2025-01-01T00:00:00.000Z', '2025-12-31T23:59:59.000Z', '2024-11-05T09:00:00.000Z', 'IRB-2024-0012', '2024-12-10T14:00:00.000Z', 'คณะเภสัชศาสตร์', 'user-1');

-- Publications
INSERT INTO "irPublication" ("id", "title", "journal", "quartile", "uniRewardStatus", "uniRewardAmount", "facultyRewardStatus", "facultyRewardAmount", "status", "projectId", "claimingAuthorId") VALUES
('pub-1', 'Deep Learning Application in Early Detection of Coronary Artery Disease', 'Journal of Medical Systems', 'Q1', 'APPROVED', 50000.0, 'APPROVED', 20000.0, 'REWARDED', 'project-1', 'user-1'),
('pub-2', 'Antioxidant activities of Thai traditional herbs for skincare application', 'Cosmetics & Dermatology Research', 'Q2', 'PENDING', 30000.0, 'PENDING', 10000.0, 'PUBLISHED', 'project-3', 'user-1'),
('pub-3', 'Novel tropical virus structures analysis in Southeast Asia', 'Asia-Pacific Journal of Virology', 'Q1', 'PENDING', 50000.0, 'PENDING', 20000.0, 'UNDER_REVIEW', 'project-2', 'user-2');

-- Publication Authors
INSERT INTO "irPublicationAuthor" ("id", "publicationId", "authorName", "userId", "authorOrder", "isCorresponding") VALUES
('pub-1-auth-1', 'pub-1', 'ศ.ดร. สมเกียรติ รักเรียน', 'user-1', 1, 1),
('pub-2-auth-1', 'pub-2', 'ศ.ดร. สมเกียรติ รักเรียน', 'user-1', 1, 0),
('pub-3-auth-1', 'pub-3', 'ดร. วิภา จิตวิทยา', 'user-2', 2, 1);

-- Presentations
INSERT INTO "irPresentation" ("id", "title", "conference", "type", "status", "projectId", "presenterId") VALUES
('pres-1', 'AI model predicting early coronary artery disease', 'International Conference on Medical AI (ICMAI 2026)', 'ORAL', 'PRESENTED', 'project-1', 'user-1'),
('pres-2', 'Epidemiology of new tropical viruses in East Asia', 'Asean Virology Summit 2026', 'POSTER', 'PENDING', 'project-2', 'user-2');

-- Consultations
INSERT INTO "irConsultation" ("id", "type", "appointmentTime", "status", "advisorId", "requesterId") VALUES
('consult-1', 'PROTOCOL', '2026-05-15T10:00:00.000Z', 'COMPLETED', 'user-3', 'user-1'),
('consult-2', 'STATISTICAL', '2026-05-18T14:00:00.000Z', 'COMPLETED', 'user-3', 'user-2'),
('consult-3', 'PROTOCOL', '2026-06-20T09:30:00.000Z', 'SCHEDULED', 'user-3', 'user-1');

-- ========================================================
-- New Researcher Profile Table
-- ========================================================
CREATE TABLE "irResearcherProfile" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "scopusAuthorId" TEXT UNIQUE,
    "nameTh" TEXT,
    "titleTh" TEXT,
    "department" TEXT,
    "status" TEXT DEFAULT 'Active',
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    FOREIGN KEY ("userId") REFERENCES "irUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
