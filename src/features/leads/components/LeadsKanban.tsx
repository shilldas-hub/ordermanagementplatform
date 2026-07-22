"use client";

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { updateLeadStage } from '../actions';
import { Loader2 } from 'lucide-react';

type LeadType = any; // We'll refine this later
type StageType = { id: string; name: string; color?: string | null };

export function LeadsKanban({ leads: initialLeads, stages }: { leads: LeadType[], stages: StageType[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [isPending, startTransition] = useTransition();

  // Sync state if initialLeads prop changes (e.g. server revalidation)
  React.useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.stageId === targetStageId) return;

    // Optimistic UI Update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stageId: targetStageId } : l));

    // Server Update
    startTransition(async () => {
      const res = await updateLeadStage(leadId, targetStageId);
      if (res.error) {
        // Revert on error (could add toast notification here)
        console.error(res.error);
        setLeads(initialLeads);
      }
    });
  };

  return (
    <div className="flex-1 flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-16rem)] min-h-[500px]">
      {stages.map((stage) => {
        const stageLeads = leads.filter(l => l.stageId === stage.id);
        
        return (
          <div 
            key={stage.id} 
            className="flex-shrink-0 w-80 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div className="p-3 font-medium text-sm border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <span>{stage.name}</span>
              <div className="flex items-center gap-2">
                {isPending && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full text-xs">
                  {stageLeads.length}
                </span>
              </div>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {stageLeads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <Link href={`/leads/${lead.id}`} className="block" onClick={(e) => {
                    // Prevent navigation if the user is just finishing a drag (though usually click doesn't trigger on drag)
                  }}>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                      <div className="font-medium text-sm">{lead.title}</div>
                      <div className="text-xs text-zinc-500 mt-1">{lead.client?.companyName || 'Unknown Client'}</div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                          ₹{lead.expectedValue?.toLocaleString('en-IN') || '0'}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px]" title={lead.assignedTo?.name || 'Unassigned'}>
                          {lead.assignedTo?.name ? lead.assignedTo.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
              {stageLeads.length === 0 && (
                <div className="text-center p-4 text-xs text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-md">
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
