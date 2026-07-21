import Link from 'next/link';
import prisma from '@/lib/prisma';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { format, subDays } from 'date-fns';

export default async function DashboardPage() {
  const [totalLeads, activeOrders, pendingDispatch] = await Promise.all([
    prisma.lead.count({ where: { deletedAt: null } }),
    prisma.order.count({
      where: {
        deletedAt: null,
        status: {
          notIn: ['CANCELLED', 'DELIVERED'],
        },
      },
    }),
    prisma.order.count({
      where: {
        deletedAt: null,
        status: {
          in: ['PENDING_DISPATCH_REVIEW', 'READY_FOR_DISPATCH'],
        },
      },
    }),
  ]);

  // Calculate MTD Revenue
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const mtdOrders = await prisma.order.findMany({
    where: {
      deletedAt: null,
      createdAt: { gte: startOfMonth },
      status: { not: 'CANCELLED' }
    },
    select: { totalAmount: true }
  });
  
  const mtdRevenue = mtdOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  // Generate last 14 days revenue data for chart
  const fourteenDaysAgo = subDays(now, 14);
  const recentOrders = await prisma.order.findMany({
    where: {
      deletedAt: null,
      createdAt: { gte: fourteenDaysAgo },
      status: { not: 'CANCELLED' }
    },
    select: {
      totalAmount: true,
      createdAt: true
    }
  });

  const revenueByDate: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = subDays(now, i);
    revenueByDate[format(d, 'MMM dd')] = 0;
  }

  recentOrders.forEach((order) => {
    const dateStr = format(order.createdAt, 'MMM dd');
    if (revenueByDate[dateStr] !== undefined) {
      revenueByDate[dateStr] += order.totalAmount;
    }
  });

  const chartData = Object.entries(revenueByDate).map(([date, revenue]) => ({
    date,
    revenue
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Leads', value: totalLeads.toLocaleString('en-IN'), href: '/leads' },
          { label: 'Active Orders', value: activeOrders.toLocaleString('en-IN'), href: '/orders' },
          { label: 'Pending Dispatch', value: pendingDispatch.toLocaleString('en-IN'), href: '/dispatch' },
          { label: 'Revenue (MTD)', value: `₹${mtdRevenue.toLocaleString('en-IN')}`, href: '/reports' },
        ].map((metric) => (
          <Link href={metric.href} key={metric.label}>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer h-full">
              <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{metric.label}</h3>
              <p className="mt-2 text-3xl font-bold">{metric.value}</p>
            </div>
          </Link>
        ))}
      </div>
      <RevenueChart data={chartData} />
    </div>
  );
}
