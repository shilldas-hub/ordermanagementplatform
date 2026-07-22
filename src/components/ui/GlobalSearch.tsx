"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, User, Briefcase, ShoppingCart, X } from 'lucide-react';
import { globalSearch } from '@/features/search/actions';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ leads: any[], clients: any[], orders: any[] }>({ leads: [], clients: [], orders: [] });
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setIsSearching(true);
      globalSearch(debouncedQuery).then((res) => {
        setResults(res);
        setIsSearching(false);
      });
    } else {
      setResults({ leads: [], clients: [], orders: [] });
    }
  }, [debouncedQuery]);

  const handleNavigate = (url: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(url);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div 
        className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-md text-sm text-zinc-500 cursor-text w-64 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <Search className="w-4 h-4" />
        <span className="flex-1">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-zinc-200 bg-zinc-100 px-1.5 font-mono text-[10px] font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full sm:w-[400px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center p-3 border-b border-zinc-100 dark:border-zinc-800">
            <Search className="w-4 h-4 text-zinc-500 mr-2 shrink-0" />
            <input
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-zinc-500"
              placeholder="Search leads, clients, orders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
            ) : (
              <button onClick={() => { setIsOpen(false); setQuery(""); }} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-1">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {query.length > 0 && query.length < 2 && (
              <div className="p-4 text-center text-sm text-zinc-500">Type at least 2 characters...</div>
            )}
            
            {query.length >= 2 && !isSearching && results.clients.length === 0 && results.leads.length === 0 && results.orders.length === 0 && (
              <div className="p-4 text-center text-sm text-zinc-500">No results found for "{query}"</div>
            )}

            {results.clients.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Clients</div>
                {results.clients.map((client) => (
                  <button
                    key={client.id}
                    className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    onClick={() => handleNavigate(`/clients`)}
                  >
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded text-blue-600 dark:text-blue-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{client.companyName}</div>
                      {client.email && <div className="text-xs text-zinc-500">{client.email}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.leads.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Leads</div>
                {results.leads.map((lead) => (
                  <button
                    key={lead.id}
                    className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    onClick={() => handleNavigate(`/leads`)}
                  >
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded text-amber-600 dark:text-amber-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{lead.title}</div>
                      <div className="text-xs text-zinc-500">{lead.client.companyName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.orders.length > 0 && (
              <div>
                <div className="px-2 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Orders</div>
                {results.orders.map((order) => (
                  <button
                    key={order.id}
                    className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    onClick={() => handleNavigate(`/orders`)}
                  >
                    <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded text-green-600 dark:text-green-400">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-xs text-zinc-500">{order.client.companyName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
