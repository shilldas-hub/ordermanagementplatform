"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ShoppingCart, 
  Truck, 
  BarChart3, 
  Settings,
  Package,
  Server
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Leads', href: '/leads', icon: Briefcase },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Dispatch', href: '/dispatch', icon: Truck },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Data Sync', href: '/data-sync', icon: Server },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: any;
}

export function Sidebar({ className, user, ...props }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn("w-64 border-r border-zinc-200 dark:border-zinc-800 h-screen bg-white dark:bg-zinc-950 flex flex-col", className)}>
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded-md flex items-center justify-center">
          <span className="text-white dark:text-zinc-900 font-bold text-xl leading-none">R</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight">RRChemicals CRM</h2>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium">
            {user?.name?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name || "Unknown User"}</span>
            <span className="text-xs text-zinc-500">{user?.role?.replace(/_/g, ' ') || "No role"}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
