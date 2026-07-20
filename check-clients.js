const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.client.count();
  const allClients = await prisma.client.findMany();
  console.log("CLIENTS COUNT:", count);
  console.log("CLIENTS:", JSON.stringify(allClients, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
