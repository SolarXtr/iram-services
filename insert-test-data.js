const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const connectionString = "postgresql://postgres:pwd4Iram!@34.21.180.83:5432/iram_services_db?schema=public";

async function main() {
  console.log("Starting DB insertion test via PrismaPg adapter...");
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Check if user already exists
    let user = await prisma.user.findFirst({
      where: { name: "รศ.นพ.ปิติ รัตนปรีชาเวช" }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "รศ.นพ.ปิติ รัตนปรีชาเวช",
          email: "piti.r@iram.edu",
          role: "RESEARCHER",
        }
      });
      console.log("Created User:", user);
    } else {
      console.log("User already exists:", user);
    }

    // 2. Create Research Project
    const project = await prisma.researchProject.create({
      data: {
        title: "ปัจจัยแก้ปัญหาราคาเครื่องมือผ่าตัด",
        status: "ONGOING",
        budgetInitial: 450000,
        budgetSpent: 50000,
        startDate: new Date("2026-06-01T00:00:00.000Z"),
        endDate: new Date("2027-05-31T23:59:59.000Z"),
        department: "คณะแพทยศาสตร์",
        leaderId: user.id
      }
    });
    console.log("Created Project:", project);

    // 3. Create Publication (Article)
    const publication = await prisma.publication.create({
      data: {
        title: "การตัดต่อข้อเข่า",
        journal: "Thai Journal of Surgery",
        quartile: "Q2",
        rewardStatus: "PENDING",
        rewardAmount: 20000,
        status: "PUBLISHED",
        projectId: project.id,
        authorId: user.id
      }
    });
    console.log("Created Publication:", publication);
    console.log("Insertion test completed successfully!");
  } catch (error) {
    console.error("Insertion failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
