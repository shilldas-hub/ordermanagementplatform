import React from 'react';

const mockDispatch = [
  { id: 'ORD-2023-003', client: 'Initech', destination: 'Austin, TX', status: 'READY', date: 'Oct 22, 2023', carrier: '-' },
  { id: 'ORD-2023-004', client: 'MegaCorp', destination: 'Seattle, WA', status: 'DISPATCHED', date: 'Oct 20, 2023', carrier: 'FedEx Freight' },
];

const statusColors: Record<string, string> = {
  READY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  DISPATCHED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
  DELIVERED: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
};

export function DispatchList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dispatch Management</h2>
      </div>
      
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
            <tr>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Order ID</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Destination</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Carrier</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockDispatch.map((dispatch) => (
              <tr key={dispatch.id} className="border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="p-4 font-medium">{dispatch.id}</td>
                <td className="p-4">{dispatch.destination}</td>
                <td className="p-4 text-zinc-500">{dispatch.carrier}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[dispatch.status]}`}>
                    {dispatch.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-blue-600 hover:underline">Update</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
