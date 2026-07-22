import React from 'react';
import { getOrders } from '@/features/orders/actions';
import { getClients } from '@/features/clients/actions';
import { getProducts } from '@/features/products/actions';
import { OrderList } from '@/features/orders/components/OrderList';

export default async function OrdersPage() {
  const orders = await getOrders();
  const clients = await getClients();
  const products = await getProducts();
  
  return (
    <div className="w-full">
      <OrderList initialOrders={orders} clients={clients} products={products} />
    </div>
  );
}
