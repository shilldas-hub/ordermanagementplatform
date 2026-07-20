"use client";

import React, { useState } from 'react';
import { approveClientMapping, rejectClientMapping } from '../actions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, X, Link as LinkIcon, Database } from 'lucide-react';


export function MappingDashboard({ initialMappings, clients }: { initialMappings: any[], clients: any[] }) {
  const [mappings, setMappings] = useState(initialMappings);
  const [selectedClientMap, setSelectedClientMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async (mappingId: string) => {
    const unifiedId = selectedClientMap[mappingId] || mappings.find(m => m.id === mappingId)?.unifiedClientId;
    if (!unifiedId) return;

    setIsLoading(true);
    const res = await approveClientMapping(mappingId, unifiedId);
    if (res.success) {
      setMappings(mappings.map(m => m.id === mappingId ? { ...m, status: "MAPPED", unifiedClientId: unifiedId } : m));
    }
    setIsLoading(false);
  };

  const handleReject = async (mappingId: string) => {
    setIsLoading(true);
    const res = await rejectClientMapping(mappingId);
    if (res.success) {
      setMappings(mappings.map(m => m.id === mappingId ? { ...m, status: "REJECTED", unifiedClientId: null } : m));
    }
    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="text-amber-600 bg-amber-50">Pending Review</Badge>;
      case 'MAPPED': return <Badge variant="outline" className="text-green-600 bg-green-50">Mapped</Badge>;
      case 'CONFLICT': return <Badge variant="outline" className="text-red-600 bg-red-50">Conflict</Badge>;
      case 'IGNORED': return <Badge variant="outline" className="text-zinc-600 bg-zinc-50">Ignored</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-zinc-50 dark:bg-zinc-900/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-1">Total Sync Records</p>
              <p className="text-2xl font-bold">{mappings.length}</p>
            </div>
            <Database className="h-5 w-5 text-zinc-400" />
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">Pending Review</p>
              <p className="text-2xl font-bold text-amber-700">{mappings.filter(m => m.status === 'PENDING').length}</p>
            </div>
            <LinkIcon className="h-5 w-5 text-amber-500" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Successfully MAPPED</p>
              <p className="text-2xl font-bold text-green-700">{mappings.filter(m => m.status === 'MAPPED').length}</p>
            </div>
            <Check className="h-5 w-5 text-green-500" />
          </CardContent>
        </Card>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="p-4 font-medium">Source Location</th>
              <th className="p-4 font-medium">ERP Client ID</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Map to CRM Client</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {mappings.map((mapping) => (
              <tr key={mapping.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <td className="p-4">
                  <Badge variant="secondary">{mapping.sourceLocation}</Badge>
                </td>
                <td className="p-4 font-medium font-mono text-xs">{mapping.spectrumClientId}</td>
                <td className="p-4">{getStatusBadge(mapping.status)}</td>
                <td className="p-4">
                  {mapping.status === 'PENDING' || mapping.status === 'CONFLICT' ? (
                    <Select 
                      value={selectedClientMap[mapping.id] || mapping.unifiedClientId || ""} 
                      onValueChange={(val) => setSelectedClientMap({ ...selectedClientMap, [mapping.id]: val })}
                    >
                      <SelectTrigger className="w-[200px] h-8">
                        <SelectValue placeholder="Select Match..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.companyName} {c.gstNumber ? `(${c.gstNumber})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="font-medium">{clients.find(c => c.id === mapping.unifiedClientId)?.companyName || 'Unknown'}</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {mapping.status !== 'MAPPED' ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleApprove(mapping.id)}
                        disabled={isLoading || (!selectedClientMap[mapping.id] && !mapping.unifiedClientId)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleReject(mapping.id)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleReject(mapping.id)}
                      disabled={isLoading}
                    >
                      Unmap
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {mappings.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-500">No client mappings found from ERP sync.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
