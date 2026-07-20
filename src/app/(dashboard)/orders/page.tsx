import React from 'react';
import { getOrders } from '@/features/orders/actions';
import { getClients } from '@/features/clients/actions';
import { OrderList } from '@/features/orders/components/OrderList';

export default async function OrdersPage() {
  const orders = await getOrders();
  const clients = await getClients();
  
  return (
    <div className="w-full">
      <OrderList initialOrders={orders} clients={clients} />
    </div>
  );
}
