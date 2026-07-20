import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const regions = ['Mumbai', 'Nashik', 'Ahmedabad', 'Madurai', 'Bengaluru'];
    
    for (const regionName of regions) {
      await prisma.region.upsert({
        where: { name: regionName },
        update: {},
        create: { name: regionName },
      });
    }

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

    return NextResponse.json({ success: true, message: 'Seeded regions and stages' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
