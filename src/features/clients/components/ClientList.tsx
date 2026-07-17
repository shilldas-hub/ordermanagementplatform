"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClientFormValues } from '../schema';
import { ClientForm } from './ClientForm';
import { createClient, updateClient, deleteClient } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MapPin, Mail, Phone, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Type from Prisma (omitting relations for simplicity in props)
type ClientType = any;

export function ClientList({ initialClients }: { initialClients: ClientType[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) params.set("q", searchTerm);
    else params.delete("q");
    router.push(`?${params.toString()}`);
  };

  const onSubmit = async (data: ClientFormValues) => {
    setIsLoading(true);
    try {
      if (editingClient) {
        await updateClient({ ...data, id: editingClient.id });
      } else {
        await createClient(data);
      }
      setIsDialogOpen(false);
      setEditingClient(null);
      router.refresh(); // Refresh RSC data
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      await deleteClient(id);
      router.refresh();
    }
  };

  const openEdit = (client: ClientType) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
    INACTIVE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
    BLACKLISTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Search and Create */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            type="search" 
            placeholder="Search company name..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingClient(null);
        }}>
          <DialogTrigger asChild>
            <Button className="shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            </DialogHeader>
            <ClientForm 
              initialData={editingClient || {}} 
              onSubmit={onSubmit} 
              isLoading={isLoading} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
            <tr>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Company</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Contact</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
              <th className="h-12 px-4 font-medium text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialClients.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-500">No clients found.</td>
              </tr>
            ) : initialClients.map((client) => (
              <tr key={client.id} className="border-b border-zinc-200 dark:border-zinc-800 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="p-4">
                  <div className="font-medium text-zinc-900 dark:text-zinc-50">{client.companyName}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {client.region?.name || client.address || 'No region assigned'}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-zinc-700 dark:text-zinc-300">{client.contactPerson || '-'}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-3 mt-1">
                    {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3"/> {client.email}</span>}
                    {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3"/> {client.phone}</span>}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusColors[client.status]}`}>
                    {client.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(client)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(client.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {initialClients.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            No clients found.
          </div>
        ) : initialClients.map((client) => (
          <Card key={client.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{client.companyName}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusColors[client.status]} mt-1 inline-block`}>
                    {client.status}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(client)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(client.id)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-2 mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                {client.contactPerson && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">Contact:</span> 
                    {client.contactPerson}
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> 
                    {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> 
                    {client.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> 
                  {client.region?.name || client.address || 'No location'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
