"use client";

import React, { useState, useTransition } from 'react';
import { updateOrderStatus } from '../actions';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

type OrderType = any; 

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800',
  PENDING_ACCOUNT_CREATION: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500 border-orange-200 dark:border-orange-800',
  PENDING_DISPATCH_REVIEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500 border-blue-200 dark:border-blue-800',
  READY_FOR_DISPATCH: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500 border-green-200 dark:border-green-800',
  BACKORDERED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500 border-red-200 dark:border-red-800',
  DISPATCHED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500 border-purple-200 dark:border-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500 border-emerald-200 dark:border-emerald-800',
  CANCELLED: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
};

const STAGES = Object.keys(statusColors);

export function OrdersKanban({ orders: initialOrders }: { orders: OrderType[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [isPending, startTransition] = useTransition();

  React.useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (!orderId) return;

    const order = orders.find(o => o.id === orderId);
    if (!order || order.status === targetStatus) return;

    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: targetStatus } : o));

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, targetStatus);
      if (res.error) {
        console.error(res.error);
        setOrders(initialOrders);
      }
    });
  };

  return (
    <div className="flex-1 flex gap-4 overflow-x-auto pb-4 min-h-[600px] h-full">
      {STAGES.map((status) => {
        const stageOrders = orders.filter(o => o.status === status);
        const colorClass = statusColors[status];
        
        return (
          <div 
            key={status} 
            className="flex-shrink-0 w-80 bg-zinc-50 dark:bg-zinc-900/30 rounded-lg flex flex-col border border-zinc-200 dark:border-zinc-800"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className={`p-3 font-medium text-sm border-b flex justify-between items-center bg-white dark:bg-zinc-900 rounded-t-lg ${colorClass.split(' ').filter(c => c.startsWith('border-')).join(' ')}`}>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass.split(' ').filter(c => !c.startsWith('border-')).join(' ')}`}>
                {status.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-2">
                {isPending && <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />}
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full text-xs">
                  {stageOrders.length}
                </span>
              </div>
            </div>
            
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {stageOrders.map((order) => (
                <div
                  key={order.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <div className="bg-white dark:bg-zinc-900 p-3 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">#{order.orderNumber}</span>
                      <span className="text-[10px] text-zinc-500">{format(new Date(order.createdAt), "MMM d")}</span>
                    </div>
                    
                    <div className="text-sm font-medium mb-1 truncate">
                      {order.client?.companyName || 'Unknown Client'}
                    </div>
                    
                    {order.items && order.items.length > 0 ? (
                      <div className="text-xs text-zinc-500 mb-3 truncate">
                        {order.items.length} item(s) • {order.items.map((i: any) => i.product?.name).join(', ')}
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-500 mb-3">No items</div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">
                        ₹{order.totalAmount?.toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {stageOrders.length === 0 && (
                <div className="text-center p-4 text-xs text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-md">
                  Drop orders here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
