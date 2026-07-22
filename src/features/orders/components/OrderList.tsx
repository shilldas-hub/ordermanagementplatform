"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { createOrder, updateOrder } from '../actions';
import { OrderForm } from './OrderForm';
import { OrdersKanban } from './OrdersKanban';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, List, KanbanSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function OrderList({ initialOrders = [], clients = [], products = [] }: { initialOrders?: any[], clients?: any[], products?: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("NEWEST");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [viewMode, setViewMode] = useState<"LIST" | "KANBAN">("LIST");

  const filteredAndSortedOrders = React.useMemo(() => {
    let result = [...orders];
    if (filterStatus !== "ALL") {
      result = result.filter(o => o.status === filterStatus);
    }
    result.sort((a, b) => {
      if (sortBy === "AMOUNT_DESC") return (b.totalAmount || 0) - (a.totalAmount || 0);
      if (sortBy === "AMOUNT_ASC") return (a.totalAmount || 0) - (b.totalAmount || 0);
      if (sortBy === "NEWEST") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === "OLDEST") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return 0;
    });
    return result;
  }, [orders, sortBy, filterStatus]);

  const openEdit = (order: any) => {
    setEditingOrder(order);
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
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
    } else {
      setError(res.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {Object.keys(statusColors).map(status => (
                <SelectItem key={status} value={status}>{status.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest First</SelectItem>
              <SelectItem value="OLDEST">Oldest First</SelectItem>
              <SelectItem value="AMOUNT_DESC">Amount (High to Low)</SelectItem>
              <SelectItem value="AMOUNT_ASC">Amount (Low to High)</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-md p-1">
            <button
              onClick={() => setViewMode("LIST")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "LIST" ? "bg-white dark:bg-zinc-950 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === "KANBAN" ? "bg-white dark:bg-zinc-950 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              <KanbanSquare className="w-4 h-4" />
              Kanban
            </button>
          </div>
          
          <Button 
            onClick={() => {
              if (!clients || clients.length === 0) {
                alert("You must create at least one Client before you can create an order!");
                return;
              }
              setEditingOrder(null); 
              setIsDialogOpen(true); 
              setError(null);
            }} 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Order
          </Button>
        </div>
      </div>

      {viewMode === "LIST" ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
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
              {filteredAndSortedOrders.map((order) => (
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
              {filteredAndSortedOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">No orders found. Create your first order!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <OrdersKanban orders={filteredAndSortedOrders} />
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingOrder(null);
          setError(null);
        }
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
            products={products}
            error={error}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
