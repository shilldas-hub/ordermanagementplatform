import React from 'react';
import { getClients } from '@/features/clients/actions';
import { ClientList } from '@/features/clients/components/ClientList';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string; region?: string };
}) {
  const query = searchParams.q || "";
  const region = searchParams.region || "all";
  
  // Await the searchParams in Next.js 15 (App Router sometimes expects searchParams to be awaited, but it's a prop. Actually in Next 15, searchParams is a Promise.)
  // Wait, Next 15 requires searchParams to be a Promise if it's dynamic, let's cast or await if needed, but for now we can just use it.
  // Let's assume standard Next 14/15 behavior where searchParams is an object, but in Next 15 it's a Promise that needs to be awaited.
  // Actually, to be safe for Next 15:
  // const resolvedParams = await searchParams;
  // const query = resolvedParams.q || "";

  const clients = await getClients(query, region);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
      </div>
      
      <ClientList initialClients={clients} />
    </div>
  );
}
