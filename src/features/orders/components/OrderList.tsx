import React from 'react';

const mockOrders = [
  { id: 'ORD-2023-001', client: 'Acme Corp', amount: '$12,000', status: 'PRODUCTION', date: 'Oct 24, 2023' },
  { id: 'ORD-2023-002', client: 'Globex Inc', amount: '$5,500', status: 'PENDING', date: 'Oct 25, 2023' },
  { id: 'ORD-2023-003', client: 'Initech', amount: '$8,500', status: 'READY', date: 'Oct 22, 2023' },
];

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  PRODUCTION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  READY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  DISPATCHED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
};

export function OrderList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Manufacturing Orders</h2>
        <button className="bg-zinc-900 text-zinc-50 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 transition-colors">
          Create Order
        </button>
      </div>
      
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
            <tr>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Order ID</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Client</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Date</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr key={order.id} className="border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="p-4 font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">{order.id}</td>
                <td className="p-4">{order.client}</td>
                <td className="p-4 text-zinc-500">{order.date}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-right font-medium">{order.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
