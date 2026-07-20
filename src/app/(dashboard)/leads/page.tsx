import React from "react";
import { getLeads } from "@/features/leads/actions";
import { LeadList } from "@/features/leads/components/LeadList";
import prisma from "@/lib/prisma";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : '';
  const stageId = typeof resolvedParams.stage === 'string' ? resolvedParams.stage : undefined;

  const leads = await getLeads(search, stageId);

  // Fetch reference data for the form dropdowns
  const [clients, stages, users, regions] = await Promise.all([
    prisma.client.findMany({ where: { deletedAt: null }, select: { id: true, companyName: true }, orderBy: { companyName: 'asc' } }),
    prisma.pipelineStage.findMany({ where: { deletedAt: null }, select: { id: true, name: true, order: true }, orderBy: { order: 'asc' } }),
    prisma.user.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.region.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your sales pipeline and track potential opportunities.</p>
      </div>
      <LeadList 
        initialLeads={leads} 
        clients={clients} 
        stages={stages} 
        users={users} 
        regions={regions} 
      />
    </div>
  );
}
