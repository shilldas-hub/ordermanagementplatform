"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { updateOrderStatus } from '../actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Truck, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export function DispatchDashboard({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [leadTime, setLeadTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [sortBy, setSortBy] = useState("NEWEST");
  const [filterStatus, setFilterStatus] = useState("ALL");

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

  const handleStatusUpdate = async (status: any) => {
    if (!selectedOrder) return;
    setIsLoading(true);
    const res = await updateOrderStatus(selectedOrder.id, status, note, status === 'BACKORDERED' ? leadTime : undefined);
    if (res.success && res.order) {
      setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: res.order.status } : o));
      setSelectedOrder(null);
      setNote("");
      setLeadTime("");
    }
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    if (status === 'PENDING_ACCOUNT_CREATION') return <Clock className="h-5 w-5 text-amber-500" />;
    if (status === 'PENDING_DISPATCH_REVIEW') return <Package className="h-5 w-5 text-blue-500" />;
    if (status === 'READY_FOR_DISPATCH') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'BACKORDERED') return <AlertTriangle className="h-5 w-5 text-red-500" />;
    return <Truck className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {['PENDING_ACCOUNT_CREATION', 'PENDING_DISPATCH_REVIEW', 'READY_FOR_DISPATCH', 'BACKORDERED'].map((status) => (
          <Card key={status} className="bg-zinc-50 dark:bg-zinc-900/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 mb-1">{status.replace(/_/g, ' ')}</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === status).length}</p>
              </div>
              <div className="bg-white dark:bg-zinc-800 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700">
                {getStatusIcon(status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "")}>
          <SelectTrigger className="w-[200px] h-9 bg-white dark:bg-zinc-900">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING_ACCOUNT_CREATION">Pending Account Creation</SelectItem>
            <SelectItem value="PENDING_DISPATCH_REVIEW">Pending Dispatch Review</SelectItem>
            <SelectItem value="READY_FOR_DISPATCH">Ready For Dispatch</SelectItem>
            <SelectItem value="BACKORDERED">Backordered</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={(val) => setSortBy(val || "")}>
          <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-zinc-900">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NEWEST">Newest First</SelectItem>
            <SelectItem value="OLDEST">Oldest First</SelectItem>
            <SelectItem value="AMOUNT_DESC">Highest Amount</SelectItem>
            <SelectItem value="AMOUNT_ASC">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="p-4 font-medium">Order #</th>
              <th className="p-4 font-medium">Client</th>
              <th className="p-4 font-medium">Value</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredAndSortedOrders.map((order) => (
              <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                <td className="p-4 font-medium">{order.orderNumber}</td>
                <td className="p-4">{order.client.companyName}</td>
                <td className="p-4 font-medium text-green-600 dark:text-green-400">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                <td className="p-4">
                  <Badge variant="outline" className="font-semibold tracking-wide flex items-center gap-1.5 w-fit">
                    {getStatusIcon(order.status)}
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
                    Review
                  </Button>
                </td>
              </tr>
            ))}
            {filteredAndSortedOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">No active dispatch orders.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Order {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg">
                <div>
                  <span className="text-zinc-500 block">Client</span>
                  <span className="font-medium">{selectedOrder.client.companyName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Current Status</span>
                  <Badge variant="outline">{selectedOrder.status.replace(/_/g, ' ')}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Add Note (Optional)</label>
                <Textarea 
                  placeholder="e.g., Account created in ERP, Pick list generated..." 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {selectedOrder.status === 'PENDING_DISPATCH_REVIEW' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Expected Lead Time (Required for Backorder)</label>
                  <Input 
                    placeholder="e.g., 2 Weeks, Next Tuesday..." 
                    value={leadTime}
                    onChange={(e) => setLeadTime(e.target.value)}
                  />
                  <p className="text-xs text-zinc-500">
                    If marked as backordered, the Sales Executive will be notified with this lead time.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-2">
                {selectedOrder.status === 'PENDING_ACCOUNT_CREATION' && (
                  <Button onClick={() => handleStatusUpdate('PENDING_DISPATCH_REVIEW')} disabled={isLoading} className="w-full sm:w-auto">
                    Account Created - Proceed to Dispatch
                  </Button>
                )}
                {(selectedOrder.status === 'PENDING_DISPATCH_REVIEW' || selectedOrder.status === 'BACKORDERED') && (
                  <>
                    <Button onClick={() => handleStatusUpdate('READY_FOR_DISPATCH')} disabled={isLoading} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                      Ready for Dispatch
                    </Button>
                    <Button onClick={() => handleStatusUpdate('BACKORDERED')} disabled={isLoading || !leadTime} variant="destructive" className="w-full sm:w-auto">
                      Mark as Backordered
                    </Button>
                  </>
                )}

              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 flex flex-col sm:flex-row justify-between">
                {selectedOrder.createdAt && (
                  <span>Created: {format(new Date(selectedOrder.createdAt), "MMM d, yyyy h:mm a")}</span>
                )}
                {selectedOrder.updatedAt && (
                  <span>Last Modified: {format(new Date(selectedOrder.updatedAt), "MMM d, yyyy h:mm a")}</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
