"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ProductList({ initialProducts }: { initialProducts: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  // Get unique categories for the filter dropdown
  const categories = React.useMemo(() => {
    const cats = new Set(initialProducts.map(p => p.category));
    return Array.from(cats);
  }, [initialProducts]);

  const filteredAndSortedProducts = React.useMemo(() => {
    let result = [...initialProducts];

    // Search filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerTerm) || 
        (p.description && p.description.toLowerCase().includes(lowerTerm)) ||
        (p.useCase && p.useCase.toLowerCase().includes(lowerTerm))
      );
    }

    // Category filter
    if (filterCategory !== "ALL") {
      result = result.filter(p => p.category === filterCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "NAME_ASC") return a.name.localeCompare(b.name);
      if (sortBy === "NAME_DESC") return b.name.localeCompare(a.name);
      if (sortBy === "NEWEST") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "OLDEST") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

    return result;
  }, [initialProducts, searchTerm, filterCategory, sortBy]);

  return (
    <div className="space-y-4">
      {/* Top Bar: Search & Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            type="search" 
            placeholder="Search products by name or description..." 
            className="pl-9 bg-white dark:bg-zinc-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterCategory} onValueChange={(val) => setFilterCategory(val || "")}>
            <SelectTrigger className="w-[200px] h-9 bg-white dark:bg-zinc-900">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(val) => setSortBy(val || "")}>
            <SelectTrigger className="w-[160px] h-9 bg-white dark:bg-zinc-900">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest First</SelectItem>
              <SelectItem value="OLDEST">Oldest First</SelectItem>
              <SelectItem value="NAME_ASC">Name A-Z</SelectItem>
              <SelectItem value="NAME_DESC">Name Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center p-8 text-zinc-500 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-800">
            No products found matching your criteria.
          </div>
        ) : (
          filteredAndSortedProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-lg shadow-sm">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <Badge variant="outline" className="ml-2">{product.category}</Badge>
                    <Badge variant="secondary" className="ml-auto font-bold text-green-600 dark:text-green-400">
                      ₹{product.price?.toLocaleString('en-IN') || '0'}
                    </Badge>
                  </div>
                  
                  {product.useCase && (
                    <div>
                      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Use Case</span>
                      <p className="text-sm mt-0.5">{product.useCase}</p>
                    </div>
                  )}

                  {product.description && (
                    <div className="pt-1">
                      <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</span>
                      <p className="text-sm mt-0.5 text-zinc-700 dark:text-zinc-300">{product.description}</p>
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                <div className="md:text-right text-xs text-zinc-500 space-y-1 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-md shrink-0">
                  <div>Created: <span className="text-zinc-900 dark:text-zinc-100 font-medium">{format(new Date(product.createdAt), "MMM d, yyyy")}</span></div>
                  <div>Modified: <span className="text-zinc-900 dark:text-zinc-100 font-medium">{format(new Date(product.updatedAt), "MMM d, yyyy")}</span></div>
                </div>

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
