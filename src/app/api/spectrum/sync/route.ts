import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { MappingStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate secret token for the incoming webhook
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.SPECTRUM_SYNC_SECRET || 'dev-secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceLocation, clients = [], financials = [] } = data;

    if (!sourceLocation) {
      return NextResponse.json({ error: 'Missing sourceLocation' }, { status: 400 });
    }

    // 1. Process Client Mappings (Flag for Admin Review)
    let clientsProcessed = 0;
    for (const erpClient of clients) {
      // Find if we already have a mapping for this ERP client
      const existingMapping = await prisma.clientMapping.findFirst({
        where: {
          spectrumClientId: erpClient.id,
          sourceLocation: sourceLocation
        }
      });

      if (!existingMapping) {
        // We don't have a mapping. Try auto-matching by GST Number or exact company name
        const match = await prisma.client.findFirst({
          where: {
            OR: [
              { gstNumber: erpClient.gstNumber },
              { companyName: { equals: erpClient.name, mode: 'insensitive' } }
            ],
            deletedAt: null
          }
        });

        await prisma.clientMapping.create({
          data: {
            spectrumClientId: erpClient.id,
            sourceLocation: sourceLocation,
            unifiedClientId: match ? match.id : null,
            status: match ? MappingStatus.MAPPED : MappingStatus.PENDING
          }
        });
      }
      clientsProcessed++;
    }

    // 2. Process Financial Data
    let financialsProcessed = 0;
    for (const record of financials) {
      await prisma.financialRecord.create({
        data: {
          location: sourceLocation,
          period: new Date(record.period),
          revenue: record.revenue || 0,
          expenses: record.expenses || 0,
          profit: record.profit || 0,
          source: 'API'
        }
      });
      financialsProcessed++;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sync successful for ${sourceLocation}`,
      stats: {
        clientsProcessed,
        financialsProcessed
      }
    });

  } catch (error: any) {
    console.error("Spectrum Sync Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
