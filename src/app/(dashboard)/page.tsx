import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric Cards Placeholders */}
        {[
          { label: 'Total Leads', value: '1,234', href: '/leads' },
          { label: 'Active Orders', value: '56', href: '/orders' },
          { label: 'Pending Dispatch', value: '12', href: '/dispatch' },
          { label: 'Revenue (MTD)', value: '₹45,231', href: '/reports/financials' },
        ].map((metric) => (
          <Link href={metric.href} key={metric.label}>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer h-full">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{metric.label}</h3>
              <p className="mt-2 text-3xl font-bold">{metric.value}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="h-96 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500">
        Recharts Graph Placeholder
      </div>
    </div>
  );
}
