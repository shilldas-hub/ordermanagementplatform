import prisma from "./src/lib/prisma";

async function main() {
  await prisma.user.updateMany({
    data: { role: 'SUPER_ADMIN' }
  });
  console.log("Upgraded all users to SUPER_ADMIN");
}

main().catch(console.error).finally(() => prisma.$disconnect());
