"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { createOrder, updateOrder } from '../actions';
import { OrderForm } from './OrderForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  PENDING_ACCOUNT_CREATION: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500',
  PENDING_DISPATCH_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
  READY_FOR_DISPATCH: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  BACKORDERED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
  DISPATCHED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500',
  DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500',
  CANCELLED: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400',
};

export function OrderList({ initialOrders = [], clients = [] }: { initialOrders?: any[], clients?: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openEdit = (order: any) => {
    setEditingOrder(order);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    let res;
    if (editingOrder) {
      res = await updateOrder(editingOrder.id, data);
    } else {
      res = await createOrder(data);
    }
    
    if (res.success && res.order) {
      if (editingOrder) {
        setOrders(orders.map(o => o.id === res.order.id ? { ...o, ...res.order, client: clients.find(c => c.id === res.order.clientId) } : o));
      } else {
        setOrders([{ ...res.order, client: clients.find(c => c.id === res.order.clientId) }, ...orders]);
      }
      setIsDialogOpen(false);
      setEditingOrder(null);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        
        <Button onClick={() => { setEditingOrder(null); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Order
        </Button>
      </div>
      
      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
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
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer"
                onClick={() => openEdit(order)}
              >
                <td className="p-4 font-medium text-blue-600 dark:text-blue-400">{order.orderNumber}</td>
                <td className="p-4">{order.client?.companyName || 'Unknown'}</td>
                <td className="p-4 text-zinc-500">{format(new Date(order.createdAt), "MMM dd, yyyy")}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider ${statusColors[order.status] || statusColors.PENDING}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4 text-right font-medium text-green-600 dark:text-green-400">
                  ₹{order.totalAmount?.toLocaleString('en-IN') || '0'}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">No orders found. Create your first order!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingOrder(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingOrder ? 'Edit Order' : 'Create New Order'}</DialogTitle>
          </DialogHeader>
          <OrderForm 
            initialData={editingOrder || {}} 
            onSubmit={onSubmit} 
            isLoading={isLoading} 
            clients={clients}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
