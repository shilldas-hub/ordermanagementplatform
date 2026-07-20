"use client";

import React, { useState } from 'react';
import { addManualFinancialRecord } from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, DollarSign, Plus } from 'lucide-react';
import type { FinancialRecord } from '@prisma/client';

export function FinancialDashboard({ initialRecords }: { initialRecords: FinancialRecord[] }) {
  const [records, setRecords] = useState(initialRecords);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    location: '',
    period: format(new Date(), 'yyyy-MM'),
    revenue: '',
    expenses: ''
  });

  const totalRevenue = records.reduce((acc, r) => acc + r.revenue, 0);
  const totalExpenses = records.reduce((acc, r) => acc + r.expenses, 0);
  const totalProfit = records.reduce((acc, r) => acc + r.profit, 0);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const revenue = parseFloat(formData.revenue);
    const expenses = parseFloat(formData.expenses);
    const profit = revenue - expenses;

    const res = await addManualFinancialRecord({
      location: formData.location,
      period: formData.period + "-01", // Append day for Date parsing
      revenue,
      expenses,
      profit
    });

    if (res.success && res.record) {
      setRecords([res.record, ...records].sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime()));
      setIsDialogOpen(false);
      setFormData({ location: '', period: format(new Date(), 'yyyy-MM'), revenue: '', expenses: '' });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-zinc-50 dark:bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-zinc-500">Total Revenue</p>
              <DollarSign className="h-5 w-5 text-zinc-400" />
            </div>
            <p className="text-3xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-50 dark:bg-zinc-900/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-zinc-500">Total Expenses</p>
              <TrendingDown className="h-5 w-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold">₹{totalExpenses.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-green-600">Net Profit</p>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-700 dark:text-green-500">₹{totalProfit.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium tracking-tight">Consolidated Location Data</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3">
            <Plus className="h-4 w-4 mr-2" /> Manual Entry
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Manual Financial Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input required placeholder="e.g. Hyderabad Branch" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Period (Month)</label>
                <Input required type="month" value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Revenue (₹)</label>
                  <Input required type="number" min="0" value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expenses (₹)</label>
                  <Input required type="number" min="0" value={formData.expenses} onChange={e => setFormData({...formData, expenses: e.target.value})} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>Save Record</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="p-4 font-medium">Period</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium text-right">Revenue</th>
              <th className="p-4 font-medium text-right">Expenses</th>
              <th className="p-4 font-medium text-right">Profit</th>
              <th className="p-4 font-medium">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="p-4 font-medium">{format(new Date(record.period), 'MMMM yyyy')}</td>
                <td className="p-4">{record.location}</td>
                <td className="p-4 text-right text-zinc-900 dark:text-zinc-100">₹{record.revenue.toLocaleString('en-IN')}</td>
                <td className="p-4 text-right text-red-600 dark:text-red-400">₹{record.expenses.toLocaleString('en-IN')}</td>
                <td className="p-4 text-right font-semibold text-green-600 dark:text-green-500">₹{record.profit.toLocaleString('en-IN')}</td>
                <td className="p-4">
                  <Badge variant="outline" className={record.source === 'API' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}>
                    {record.source}
                  </Badge>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500">No financial records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
