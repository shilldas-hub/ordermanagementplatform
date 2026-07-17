import React from 'react';

const stages = ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
const mockLeads = [
  { id: 1, title: 'Bulk Order - Widget A', value: '$12,000', stage: 'Discovery', client: 'Acme Corp' },
  { id: 2, title: 'Annual Contract - Part B', value: '$55,000', stage: 'Qualified', client: 'Globex Inc' },
  { id: 3, title: 'Custom Tooling Project', value: '$8,500', stage: 'Proposal', client: 'Initech' },
];

export function LeadsKanban() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Leads Pipeline</h2>
        <button className="bg-zinc-900 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 transition-colors">
          New Lead
        </button>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage} className="flex-shrink-0 w-80 bg-zinc-100 dark:bg-zinc-900/50 rounded-lg flex flex-col">
            <div className="p-3 font-medium text-sm border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <span>{stage}</span>
              <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full text-xs">
                {mockLeads.filter(l => l.stage === stage).length}
              </span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {mockLeads
                .filter((lead) => lead.stage === stage)
                .map((lead) => (
                  <div key={lead.id} className="bg-white dark:bg-zinc-900 p-3 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer">
                    <div className="font-medium text-sm">{lead.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">{lead.client}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400">{lead.value}</span>
                      <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px]">
                        U
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
