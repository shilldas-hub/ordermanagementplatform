import prisma from '../src/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  // First clear existing products to avoid duplicates
  console.log('Clearing existing products...');
  await prisma.product.deleteMany({});

  const filePath = path.join(__dirname, '..', 'RRChem.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const lines = content.split('\n');
  
  let currentCategory = 'Uncategorized';
  let isTable = false;

  for (let line of lines) {
    line = line.trim();
    
    // Check for headings
    if (line === 'SPINNING & LUBRICANTING AGENTS FOR TEXTILES') currentCategory = 'Spinning & Lubricating Agents';
    else if (line === 'PRETREAMENTS & DYEING CHEMICALS') currentCategory = 'Pretreatments & Dyeing Chemicals';
    else if (line === 'SOFTNERS & FINSIHING AGENTS') currentCategory = 'Softeners & Finishing Agents';
    else if (line === 'SPECIALITY CHEMICALS/ ESTERS') currentCategory = 'Speciality Chemicals & Esters';
    
    // Check for table start/end
    if (line.startsWith('| ITEM NAME')) {
      isTable = true;
      continue;
    }
    if (line.startsWith('| ---')) {
      continue;
    }
    
    if (isTable && line.startsWith('|')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length >= 4) {
        const name = parts[1];
        const useCase = parts[2];
        const description = parts[3];
        
        if (name && name !== '&nbsp;') {
          console.log(`Seeding: ${name}`);
          
          // Generate a random price between 50 and 5000
          const randomPrice = Math.floor(Math.random() * (5000 - 50 + 1) + 50);
          
          await prisma.product.create({
            data: {
              name,
              category: currentCategory,
              useCase: useCase === '&nbsp;' ? null : useCase,
              description: description === '&nbsp;' ? null : description,
              price: randomPrice,
            }
          });
        }
      }
    } else if (line === '') {
      isTable = false;
    }
  }
  
  console.log('Product seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
