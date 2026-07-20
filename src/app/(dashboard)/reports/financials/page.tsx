import React from 'react';
import { getFinancialRecords } from '@/features/financials/actions';
import { FinancialDashboard } from '@/features/financials/components/FinancialDashboard';

export default async function FinancialsPage() {
  const records = await getFinancialRecords();

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Financial Consolidation</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">View synchronized location profit/loss data and add manual fallback records.</p>
      </div>

      <FinancialDashboard initialRecords={records} />
    </div>
  );
}
