import React from 'react';
import { getClientMappings, getActiveClients } from '@/features/mapping/actions';
import { MappingDashboard } from '@/features/mapping/components/MappingDashboard';

export default async function MappingsPage() {
  const mappings = await getClientMappings();
  const clients = await getActiveClients();

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ERP Client Mappings</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Review and resolve client identity conflicts from Spectrum ERP synchronization.</p>
      </div>

      <MappingDashboard initialMappings={mappings} clients={clients} />
    </div>
  );
}
