import React from 'react';
import { getDispatchOrders } from '@/features/dispatch/actions';
import { DispatchDashboard } from '@/features/dispatch/components/DispatchDashboard';

export default async function DispatchPage() {
  const orders = await getDispatchOrders();

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dispatch Review</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Review pending orders, verify ERP mapping, and coordinate dispatch.</p>
      </div>

      <DispatchDashboard initialOrders={orders} />
    </div>
  );
}
