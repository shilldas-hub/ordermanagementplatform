import React from 'react';
import prisma from '@/lib/prisma';
import { PipelineStageSettings } from '@/features/settings/components/PipelineStageSettings';

export default async function SettingsPage() {
  const stages = await prisma.pipelineStage.findMany({
    where: { deletedAt: null },
    orderBy: { order: 'asc' }
  });

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-6">
        <PipelineStageSettings initialStages={stages} />
      </div>
    </div>
  );
}
