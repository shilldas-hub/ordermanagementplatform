"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { linkClientMapping, createUnifiedClientFromMapping } from '../actions';
import { Server, Link as LinkIcon, PlusCircle, Loader2 } from 'lucide-react';

interface DataHarmonizerProps {
  pendingClients: any[];
  allClients: { id: string; companyName: string }[];
}

export function DataHarmonizer({ pendingClients, allClients }: DataHarmonizerProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<Record<string, string>>({});

  const handleLink = async (mappingId: string) => {
    const unifiedId = selectedClientId[mappingId];
    if (!unifiedId) return;
    
    setProcessingId(mappingId);
    await linkClientMapping(mappingId, unifiedId);
    setProcessingId(null);
  };

  const handleCreateNew = async (mappingId: string) => {
    setProcessingId(mappingId);
    await createUnifiedClientFromMapping(mappingId);
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Server className="w-5 h-5" /> Pending Client Merges
          </CardTitle>
          <CardDescription>
            These clients were synced from local branches but haven't been mapped to a Golden Record in the cloud CRM yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingClients.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
              No pending client mappings! You are all caught up.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingClients.map((mapping) => (
                <div key={mapping.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">{mapping.sourceName || "Unknown"}</span>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400">
                        {mapping.sourceLocation}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-mono">
                        ID: {mapping.spectrumClientId}
                      </Badge>
                    </div>
                    {mapping.rawData && (
                      <div className="text-sm text-zinc-500 space-y-1">
                        <div>Phone: {(mapping.rawData as any).phone || 'N/A'}</div>
                        <div>Email: {(mapping.rawData as any).email || 'N/A'}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-full sm:w-64">
                      <Select 
                        value={selectedClientId[mapping.id] || ""} 
                        onValueChange={(val) => setSelectedClientId({...selectedClientId, [mapping.id]: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select existing client..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allClients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        variant="secondary" 
                        disabled={!selectedClientId[mapping.id] || processingId === mapping.id}
                        onClick={() => handleLink(mapping.id)}
                      >
                        {processingId === mapping.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                        Link
                      </Button>
                      <Button 
                        variant="default"
                        disabled={processingId === mapping.id}
                        onClick={() => handleCreateNew(mapping.id)}
                      >
                        {processingId === mapping.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                        Create New
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
