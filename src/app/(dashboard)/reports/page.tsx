import React from 'react';
import { getFinancialRecords } from '@/features/financials/actions';
import { FinancialDashboard } from '@/features/financials/components/FinancialDashboard';
import { ManualFallbackForm } from '@/features/financials/components/ManualFallbackForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default async function ReportsPage() {
  const records = await getFinancialRecords();

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-zinc-500">Consolidated financial overview across all regions.</p>
        </div>

        <Dialog>
          <DialogTrigger render={<Button />}>
            <Plus className="w-4 h-4 mr-2" />
            Manual Fallback Entry
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Manual Financial Record</DialogTitle>
              <DialogDescription>
                Use this form to input top-line numbers if the ERP sync is unavailable.
              </DialogDescription>
            </DialogHeader>
            <ManualFallbackForm />
          </DialogContent>
        </Dialog>
      </div>

      <FinancialDashboard records={records} />
    </div>
  );
}
