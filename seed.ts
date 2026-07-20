import prisma from "./src/lib/prisma";

async function main() {
  // Seed Regions
  const regions = ['Mumbai', 'Nashik', 'Ahmedabad', 'Madurai', 'Bengaluru'];
  
  for (const regionName of regions) {
    await prisma.region.upsert({
      where: { name: regionName },
      update: {},
      create: { name: regionName },
    });
  }
  console.log('Seeded Regions');

  // Seed Pipeline Stages
  const stages = [
    { name: 'New', order: 1, color: 'blue' },
    { name: 'Contacted', order: 2, color: 'yellow' },
    { name: 'Qualified', order: 3, color: 'green' },
    { name: 'Proposal Sent', order: 4, color: 'purple' },
    { name: 'Negotiation', order: 5, color: 'orange' },
    { name: 'Closed Won', order: 6, color: 'emerald' },
    { name: 'Closed Lost', order: 7, color: 'red' },
  ];

  for (const stage of stages) {
    await prisma.pipelineStage.upsert({
      where: { name: stage.name },
      update: { order: stage.order, color: stage.color },
      create: { name: stage.name, order: stage.order, color: stage.color },
    });
  }
  console.log('Seeded Pipeline Stages');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
