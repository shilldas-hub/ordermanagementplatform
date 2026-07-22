import React from 'react';
import { getProducts } from '@/features/products/actions';
import { ProductList } from '@/features/products/components/ProductList';

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="w-full space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Products Catalog</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your product catalog, use cases, and technical details.</p>
      </div>

      <ProductList initialProducts={products} />
    </div>
  );
}
