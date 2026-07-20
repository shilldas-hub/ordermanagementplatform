import React from 'react';
import { getClients } from '@/features/clients/actions';
import { ClientList } from '@/features/clients/components/ClientList';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams?.q as string) || "";
  const region = (resolvedParams?.region as string) || "all";
  
  const clients = await getClients(query, region);
  console.log("Total clients fetched for UI:", clients.length);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
      </div>
      
      <ClientList initialClients={clients} />
    </div>
  );
}
