const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  await prisma.financialRecord.deleteMany();
  
  const locations = ['Mumbai', 'Nashik', 'Ahmedabad', 'Madurai', 'Bengaluru'];
  const months = ['2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01', '2026-05-01', '2026-06-01'];
  
  const records = [];
  for (const month of months) {
    for (const loc of locations) {
      const rev = Math.floor(Math.random() * 5000000) + 1000000;
      const exp = Math.floor(rev * (Math.random() * 0.4 + 0.4)); // 40-80% expenses
      records.push({
        location: loc,
        period: new Date(month),
        revenue: rev,
        expenses: exp,
        profit: rev - exp,
        source: 'MOCK_SEED'
      });
    }
  }

  await prisma.financialRecord.createMany({ data: records });
  console.log('Seeded financial data');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
