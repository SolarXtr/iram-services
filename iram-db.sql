PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO "d1_migrations" ("id","name","applied_at") VALUES(1,'0001_create_comments_table.sql','2026-06-11 10:04:46');
CREATE TABLE comments (
    id INTEGER PRIMARY KEY NOT NULL,
    author TEXT NOT NULL,
    content TEXT NOT NULL
);
INSERT INTO "comments" ("id","author","content") VALUES(1,'Kristian','Congrats!');
INSERT INTO "comments" ("id","author","content") VALUES(2,'Serena','Great job!');
INSERT INTO "comments" ("id","author","content") VALUES(3,'Max','Keep up the good work!');
INSERT INTO "comments" ("id","author","content") VALUES(4,'Tony','good work!');
CREATE TABLE IF NOT EXISTS "irUser" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "role" TEXT NOT NULL, -- 'RESEARCHER', 'STAFF', 'EXECUTIVE'
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
, isDeleted INTEGER DEFAULT 0);
INSERT INTO "irUser" ("id","name","email","role","createdAt","updatedAt","isDeleted") VALUES('user-1','ศ.ดร. สมเกียรติ รักเรียน (นักวิจัย)','somkiat.r@iram.edu','RESEARCHER','2026-06-16T04:24:29.295Z','2026-06-16T04:24:29.295Z',0);
INSERT INTO "irUser" ("id","name","email","role","createdAt","updatedAt","isDeleted") VALUES('user-2','ดร. วิภา จิตวิทยา (นักวิจัย)','wipa.j@iram.edu','RESEARCHER','2026-06-16T04:24:29.295Z','2026-06-16T04:24:29.295Z',0);
INSERT INTO "irUser" ("id","name","email","role","createdAt","updatedAt","isDeleted") VALUES('user-3','คุณ วันดี ทำงานดี (เจ้าหน้าที่)','wandee.w@iram.edu','STAFF','2026-06-16T04:24:29.295Z','2026-06-16T04:24:29.295Z',0);
INSERT INTO "irUser" ("id","name","email","role","createdAt","updatedAt","isDeleted") VALUES('user-4','รศ.นพ. ทรงพล บริหาร (ผู้บริหาร)','songpol.s@iram.edu','EXECUTIVE','2026-06-16T04:24:29.295Z','2026-06-16T04:24:29.295Z',0);
INSERT INTO "irUser" ("id","name","email","role","createdAt","updatedAt","isDeleted") VALUES('f33ec67d-d1a6-4384-b977-f89ff6f49219','admin','admin@iram.nu.ac.th','STAFF','2026-06-16 09:49:33','2026-06-16 09:49:33',0);
INSERT INTO "irUser" ("id","name","email","role","createdAt","updatedAt","isDeleted") VALUES('ad4dad7c-d461-4ade-8e92-452bd8b2702e','รศ.นพ. อาทิตย์ เหล่าเรืองธนา','artitl@nu.ac.th','RESEARCHER','2026-06-17 04:02:35','2026-06-17 07:20:54',0);
INSERT INTO "irUser" ("id","name","email","role","createdAt","updatedAt","isDeleted") VALUES('user-5','รศ.นพ. ปิติ รัตนปรีชาเวช','pitir@nu.ac.th','RESEARCHER','2026-06-17T09:55:35.926Z','2026-06-17T09:55:35.926Z',0);
INSERT INTO "irUser" ("id","name","email","role","createdAt","updatedAt","isDeleted") VALUES('2fffa0ff-d27f-4bed-8a0c-915cf414a335','แพทย์หญิงณิชาภัทร เกษมวงศ์','nichaphatk@nu.ac.th','RESEARCHER','2026-06-26 04:02:15','2026-06-26 04:02:15',0);
CREATE TABLE IF NOT EXISTS "irResearchProject" (
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
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), isDeleted INTEGER DEFAULT 0,
    FOREIGN KEY ("leaderId") REFERENCES "irUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "irResearchProject" ("id","title","status","budgetInitial","budgetSpent","startDate","endDate","ceuConsultDate","irbNo","approvedDate","department","leaderId","createdAt","updatedAt","isDeleted") VALUES('project-1','โครงการวิจัยการวิเคราะห์ปัญญาประดิษฐ์เพื่อทำนายโรคหัวใจระยะแรก','ONGOING',500000,120000,'2026-01-01T00:00:00.000Z','2026-12-31T23:59:59.000Z','2025-11-12T10:00:00.000Z','IRB-2025-0987','2025-12-15T09:00:00.000Z','คณะแพทยศาสตร์','user-1','2026-06-16T04:24:29.295Z','2026-06-16T04:24:29.295Z',0);
INSERT INTO "irResearchProject" ("id","title","status","budgetInitial","budgetSpent","startDate","endDate","ceuConsultDate","irbNo","approvedDate","department","leaderId","createdAt","updatedAt","isDeleted") VALUES('project-3','การศึกษาสมุนไพรไทยต้านอนุมูลอิสระเพื่อพัฒนาเป็นเวชสำอาง','COMPLETED',600000,590000,'2025-01-01T00:00:00.000Z','2025-12-31T23:59:59.000Z','2024-11-05T09:00:00.000Z','IRB-2024-0012','2024-12-10T14:00:00.000Z','คณะเภสัชศาสตร์','user-1','2026-06-16T04:24:29.295Z','2026-06-16T04:24:29.295Z',0);
INSERT INTO "irResearchProject" ("id","title","status","budgetInitial","budgetSpent","startDate","endDate","ceuConsultDate","irbNo","approvedDate","department","leaderId","createdAt","updatedAt","isDeleted") VALUES('332a2d22-9840-41ba-a261-b37dec8c51a1','ผลการตรวจภูมิแพ้ทางผิวหนังและปัจจัยที่เกี่ยวข้องในผู้ป่วยเด็กโรคจมูกอักเสบจากภูมิแพ้และโรคผิวหนังอักเสบจากภูมิแพ้  ของโรงพยาบาลมหาวิทยาลัยนเรศวร','PROPOSED',50000,0,'2026-05-22T00:00:00.000Z','2027-05-21T00:00:00.000Z','2025-09-22T00:00:00.000Z','P3-0030/2569','2026-04-22T00:00:00.000Z','คณะแพทยศาสตร์','2fffa0ff-d27f-4bed-8a0c-915cf414a335','2026-06-26 04:16:14','2026-06-26 04:17:08',0);
CREATE TABLE IF NOT EXISTS "irPublication" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "journal" TEXT NOT NULL,
    "quartile" TEXT NOT NULL, -- 'Q1', 'Q2', 'Q3', 'Q4'
    "rewardStatus" TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    "rewardAmount" REAL DEFAULT 0.0,
    "status" TEXT NOT NULL, -- 'WRITING', 'SUBMITTED', 'UNDER_REVIEW', 'PUBLISHED', 'REWARDED'
    "projectId" TEXT,
    "authorId" TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), isDeleted INTEGER DEFAULT 0,
    FOREIGN KEY ("projectId") REFERENCES "irResearchProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("authorId") REFERENCES "irUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "irPublication" ("id","title","journal","quartile","rewardStatus","rewardAmount","status","projectId","authorId","createdAt","updatedAt","isDeleted") VALUES('pub-1','Deep Learning Application in Early Detection of Coronary Artery Disease','Journal of Medical Systems','Q1','APPROVED',50000,'REWARDED','project-1','user-1','2026-06-16T04:24:29.295Z','2026-06-16T04:24:29.295Z',0);
INSERT INTO "irPublication" ("id","title","journal","quartile","rewardStatus","rewardAmount","status","projectId","authorId","createdAt","updatedAt","isDeleted") VALUES('pub-2','Antioxidant activities of Thai traditional herbs for skincare application','Cosmetics & Dermatology Research','Q2','PENDING',30000,'PUBLISHED','project-3','user-1','2026-06-16T04:24:29.295Z','2026-06-24 02:03:38',0);
INSERT INTO "irPublication" ("id","title","journal","quartile","rewardStatus","rewardAmount","status","projectId","authorId","createdAt","updatedAt","isDeleted") VALUES('pub-3','Novel tropical virus structures analysis in Southeast Asia','Asia-Pacific Journal of Virology','Q1','PENDING',50000,'UNDER_REVIEW',NULL,'user-2','2026-06-16T04:24:29.295Z','2026-06-16T04:24:29.295Z',0);
INSERT INTO "irPublication" ("id","title","journal","quartile","rewardStatus","rewardAmount","status","projectId","authorId","createdAt","updatedAt","isDeleted") VALUES('745d43e1-cf43-47fe-bcf3-ba7dda0ff023','ads','IEEE','Q1','PENDING',25000,'PUBLISHED',NULL,'ad4dad7c-d461-4ade-8e92-452bd8b2702e','2026-06-17 08:52:37','2026-06-17 08:52:48',0);
CREATE TABLE IF NOT EXISTS "irPresentation" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "conference" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- 'ORAL', 'POSTER'
    "status" TEXT DEFAULT 'PENDING', -- 'PENDING', 'PRESENTED', 'CANCELLED'
    "projectId" TEXT,
    "presenterId" TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), isDeleted INTEGER DEFAULT 0,
    FOREIGN KEY ("projectId") REFERENCES "irResearchProject" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("presenterId") REFERENCES "irUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "irPresentation" ("id","title","conference","type","status","projectId","presenterId","createdAt","updatedAt","isDeleted") VALUES('pres-1','AI model predicting early coronary artery disease','International Conference on Medical AI (ICMAI 2026)','ORAL','PRESENTED','project-1','user-1','2026-06-16T04:24:29.295Z','2026-06-24 02:02:29',0);
INSERT INTO "irPresentation" ("id","title","conference","type","status","projectId","presenterId","createdAt","updatedAt","isDeleted") VALUES('pres-2','Epidemiology of new tropical viruses in East Asia','Asean Virology Summit 2026','POSTER','PENDING',NULL,'user-2','2026-06-16T04:24:29.295Z','2026-06-16T04:24:29.295Z',0);
INSERT INTO "irPresentation" ("id","title","conference","type","status","projectId","presenterId","createdAt","updatedAt","isDeleted") VALUES('e254b33a-99df-4c21-a966-4a677b48de5e','total of knee in hospital','knee integation','ORAL','PRESENTED',NULL,'ad4dad7c-d461-4ade-8e92-452bd8b2702e','2026-06-17 08:54:27','2026-06-17 08:54:27',0);
CREATE TABLE IF NOT EXISTS "irConsultation" (
    "id" TEXT PRIMARY KEY,
    "type" TEXT NOT NULL, -- 'PROTOCOL', 'STATISTICAL'
    "appointmentTime" TEXT NOT NULL,
    "status" TEXT DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'COMPLETED', 'CANCELLED'
    "advisorId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "createdAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    "updatedAt" TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')), isDeleted INTEGER DEFAULT 0,
    FOREIGN KEY ("advisorId") REFERENCES "irUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("requesterId") REFERENCES "irUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "irConsultation" ("id","type","appointmentTime","status","advisorId","requesterId","createdAt","updatedAt","isDeleted") VALUES('consult-3','PROTOCOL','2026-06-25T09:30:00.000Z','SCHEDULED','user-3','user-1','2026-06-16T04:24:29.295Z','2026-06-24 02:03:13',0);
INSERT INTO "irConsultation" ("id","type","appointmentTime","status","advisorId","requesterId","createdAt","updatedAt","isDeleted") VALUES('66eb3ecc-6431-48a9-ba07-4bc32ba197d3','STATISTICAL','2026-06-29T15:59:00.000Z','COMPLETED','f33ec67d-d1a6-4384-b977-f89ff6f49219','ad4dad7c-d461-4ade-8e92-452bd8b2702e','2026-06-17 08:53:21','2026-06-26 04:21:22',0);
INSERT INTO "irConsultation" ("id","type","appointmentTime","status","advisorId","requesterId","createdAt","updatedAt","isDeleted") VALUES('2304b8b3-ecfb-4e10-8208-f4703c479245','PROTOCOL','2025-09-22T09:20:00.000Z','COMPLETED','f33ec67d-d1a6-4384-b977-f89ff6f49219','2fffa0ff-d27f-4bed-8a0c-915cf414a335','2026-06-26 04:18:17','2026-06-26 04:21:09',0);
CREATE TABLE irAuditLog (id TEXT PRIMARY KEY, tableName TEXT NOT NULL, recordId TEXT NOT NULL, action TEXT NOT NULL, oldData TEXT, newData TEXT, performedBy TEXT, timestamp TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')));
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('d1_migrations',1);
