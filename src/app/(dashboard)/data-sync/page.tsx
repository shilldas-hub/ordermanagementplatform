import React from 'react';
import prisma from '@/lib/prisma';
import { getPendingClientMappings } from '@/features/sync/actions';
import { DataHarmonizer } from '@/features/sync/components/DataHarmonizer';

export default async function DataSyncPage() {
  const pendingClients = await getPendingClientMappings();
  const allClients = await prisma.client.findMany({
    where: { deletedAt: null },
    select: { id: true, companyName: true },
    orderBy: { companyName: 'asc' }
  });

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Harmonization</h2>
          <p className="text-zinc-500">Resolve pending record merges from regional ERP syncs.</p>
        </div>
      </div>

      <DataHarmonizer pendingClients={pendingClients} allClients={allClients} />
    </div>
  );
}
