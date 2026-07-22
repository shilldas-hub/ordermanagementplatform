"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, MoreVertical, Edit, Trash2, Eye, Building2, MapPin, List, LayoutGrid } from 'lucide-react';
import { LeadForm } from './LeadForm';
import { LeadsKanban } from './LeadsKanban';
import { createLead, updateLead, deleteLead } from '../actions';
import { LeadFormValues } from '../schema';


interface LeadListProps {
  initialLeads: any[];
  clients: any[];
  stages: any[];
  users: any[];
  regions: any[];
}

const priorityColors: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  HIGH: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
};

export function LeadList({ initialLeads, clients, stages, users, regions }: LeadListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [leads, setLeads] = useState(initialLeads);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [sortBy, setSortBy] = useState("NEWEST");
  const [filterStage, setFilterStage] = useState("ALL");

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.client.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === "ALL" || l.stageId === filterStage;
    return matchesSearch && matchesStage;
  }).sort((a, b) => {
    if (sortBy === "TITLE_ASC") return a.title.localeCompare(b.title);
    if (sortBy === "TITLE_DESC") return b.title.localeCompare(a.title);
    if (sortBy === "VALUE_DESC") return (b.expectedValue || 0) - (a.expectedValue || 0);
    if (sortBy === "VALUE_ASC") return (a.expectedValue || 0) - (b.expectedValue || 0);
    if (sortBy === "NEWEST") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortBy === "OLDEST") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    return 0;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled via client-side filtering for simplicity here
  };

  const onSubmit = async (data: LeadFormValues) => {
    setIsLoading(true);
    let res;
    // Map 'unassigned' and 'none' to null
    const cleanData = {
      ...data,
      assignedToId: data.assignedToId === 'unassigned' ? null : data.assignedToId,
      regionId: data.regionId === 'none' ? null : data.regionId,
    };

    if (cleanData.id) {
      res = await updateLead(cleanData);
    } else {
      res = await createLead(cleanData);
    }
    
    setIsLoading(false);
    
    if (res.success) {
      setIsDialogOpen(false);
      setEditingLead(null);
      // In a real app we might rely on Server Action revalidation to refresh data,
      // but if we are passing data as props, we'd trigger a router.refresh() 
      window.location.reload(); 
    }
    return res;
  };

  const openEdit = (lead: any) => {
    setEditingLead(lead);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to archive this lead?")) {
      const res = await deleteLead(id);
      if (res.success) {
        setLeads(leads.filter(l => l.id !== id));
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            type="search" 
            placeholder="Search leads..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stages</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
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
              <SelectItem value="VALUE_DESC">Highest Value</SelectItem>
              <SelectItem value="VALUE_ASC">Lowest Value</SelectItem>
              <SelectItem value="TITLE_ASC">Title A-Z</SelectItem>
              <SelectItem value="TITLE_DESC">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'board' ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingLead(null);
        }}>
          <DialogTrigger className={buttonVariants({ className: "shrink-0 gap-2 w-full sm:w-auto" })}>
            <Plus className="h-4 w-4" />
            Add Lead
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
            </DialogHeader>
            <LeadForm 
              initialData={editingLead || {}} 
              onSubmit={onSubmit} 
              isLoading={isLoading} 
              clients={clients}
              stages={stages}
              users={users}
              regions={regions}
            />
          </DialogContent>
        </Dialog>
      </div>

      {viewMode === 'board' ? (
        <LeadsKanban leads={filteredLeads} stages={stages} />
      ) : (
        <>
          <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-medium border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Value</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-medium">{lead.title}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-zinc-400" />
                        {lead.client.companyName}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                        {lead.stage.name}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">₹{lead.expectedValue?.toLocaleString('en-IN') || '0'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${priorityColors[lead.priority]}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link href={`/leads/${lead.id}`}>
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => openEdit(lead)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => handleDelete(lead.id)}>
                            <Trash2 className="h-4 w-4 mr-2" /> Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                      No leads found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{lead.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${priorityColors[lead.priority]} mt-1 inline-block`}>
                        {lead.priority}
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "-mr-2 -mt-2" })}>
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/leads/${lead.id}`}>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={() => openEdit(lead)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(lead.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-2 mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> Client:</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{lead.client.companyName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">Value:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">₹{lead.expectedValue?.toLocaleString('en-IN') || '0'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">Stage:</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                        {lead.stage.name}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
