"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { format } from 'date-fns';
import type { FinancialRecord } from '@prisma/client';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function FinancialDashboard({ records }: { records: FinancialRecord[] }) {
  const kpis = useMemo(() => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    records.forEach(r => {
      totalRevenue += r.revenue;
      totalExpenses += r.expenses;
    });
    const totalProfit = totalRevenue - totalExpenses;
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return { totalRevenue, totalExpenses, totalProfit, avgMargin };
  }, [records]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { month: string; revenue: number; expenses: number; profit: number }>();
    
    // Sort by period
    const sorted = [...records].sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
    
    sorted.forEach(r => {
      const monthStr = format(new Date(r.period), 'MMM yyyy');
      if (!map.has(monthStr)) {
        map.set(monthStr, { month: monthStr, revenue: 0, expenses: 0, profit: 0 });
      }
      const data = map.get(monthStr)!;
      data.revenue += r.revenue;
      data.expenses += r.expenses;
      data.profit += r.profit;
    });

    return Array.from(map.values());
  }, [records]);

  const regionalData = useMemo(() => {
    const map = new Map<string, number>();
    records.forEach(r => {
      map.set(r.location, (map.get(r.location) || 0) + r.revenue);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [records]);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50">
        <Activity className="h-10 w-10 text-zinc-400 mb-4" />
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No Financial Data</h3>
        <p className="text-zinc-500 text-sm mt-1">Add manual records or wait for the ERP sync to populate the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-50 dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{kpis.totalRevenue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50 dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{kpis.totalExpenses.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50 dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">
              ₹{kpis.totalProfit.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50 dark:bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Avg Margin</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.avgMargin.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs Expenses (Monthly)</CardTitle>
            <CardDescription>Consolidated P&L trends across all regions.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.2} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Region</CardTitle>
            <CardDescription>Top performing locations.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {regionalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
