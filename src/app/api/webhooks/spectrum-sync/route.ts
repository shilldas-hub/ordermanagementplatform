import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Secret key for securing the webhook
const WEBHOOK_SECRET = process.env.SPECTRUM_SYNC_SECRET || 'dev-secret-key-123';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('x-api-key');
    if (authHeader !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sourceLocation, clients = [], skus = [], financials } = body;

    if (!sourceLocation) {
      return NextResponse.json({ error: 'Missing sourceLocation' }, { status: 400 });
    }

    const results = {
      clientsProcessed: 0,
      skusProcessed: 0,
      financialsProcessed: false
    };

    // 1. Process Clients
    for (const client of clients) {
      if (!client.spectrumClientId) continue;
      
      await prisma.clientMapping.upsert({
        where: {
          spectrumClientId_sourceLocation: {
            spectrumClientId: client.spectrumClientId.toString(),
            sourceLocation: sourceLocation
          }
        },
        update: {
          sourceName: client.companyName || client.name,
          rawData: client,
        },
        create: {
          spectrumClientId: client.spectrumClientId.toString(),
          sourceLocation: sourceLocation,
          sourceName: client.companyName || client.name,
          rawData: client,
          status: 'PENDING'
        }
      });
      results.clientsProcessed++;
    }

    // 2. Process SKUs
    for (const sku of skus) {
      if (!sku.spectrumSku) continue;
      
      await prisma.skuMapping.upsert({
        where: {
          spectrumSku_sourceLocation: {
            spectrumSku: sku.spectrumSku.toString(),
            sourceLocation: sourceLocation
          }
        },
        update: {
          sourceName: sku.name || sku.description,
          rawData: sku,
        },
        create: {
          spectrumSku: sku.spectrumSku.toString(),
          sourceLocation: sourceLocation,
          sourceName: sku.name || sku.description,
          rawData: sku,
          status: 'PENDING'
        }
      });
      results.skusProcessed++;
    }

    // 3. Process Financials
    if (financials && financials.period) {
      // Find if we already have a record for this location and period (naive check by month)
      const periodDate = new Date(financials.period);
      const startOfMonth = new Date(periodDate.getFullYear(), periodDate.getMonth(), 1);
      const endOfMonth = new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0);

      const existingRecord = await prisma.financialRecord.findFirst({
        where: {
          location: sourceLocation,
          period: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      if (existingRecord) {
        await prisma.financialRecord.update({
          where: { id: existingRecord.id },
          data: {
            revenue: financials.revenue,
            expenses: financials.expenses,
            profit: financials.revenue - financials.expenses,
            source: 'SPECTRUM_SYNC'
          }
        });
      } else {
        await prisma.financialRecord.create({
          data: {
            location: sourceLocation,
            period: startOfMonth,
            revenue: financials.revenue,
            expenses: financials.expenses,
            profit: financials.revenue - financials.expenses,
            source: 'SPECTRUM_SYNC'
          }
        });
      }
      results.financialsProcessed = true;
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
