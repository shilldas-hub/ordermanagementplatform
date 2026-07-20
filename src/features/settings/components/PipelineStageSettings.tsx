"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPipelineStage, updatePipelineStage, deletePipelineStage } from '../actions';
import { Trash2, Edit, Plus, GripVertical } from 'lucide-react';
import { PipelineStage } from '@prisma/client';

export function PipelineStageSettings({ initialStages }: { initialStages: PipelineStage[] }) {
  const [stages, setStages] = useState(initialStages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editOrder, setEditOrder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newOrder, setNewOrder] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newName.trim()) return;

    setIsLoading(true);
    const orderNum = newOrder ? parseInt(newOrder, 10) : stages.length + 1;
    const res = await createPipelineStage(newName, orderNum);
    
    if (res.error) {
      setError(res.error);
    } else if (res.stage) {
      setStages([...stages, res.stage].sort((a, b) => a.order - b.order));
      setNewName("");
      setNewOrder("");
    }
    setIsLoading(false);
  };

  const handleUpdate = async (id: string) => {
    setError(null);
    if (!editName.trim()) return;
    
    setIsLoading(true);
    const orderNum = parseInt(editOrder, 10);
    const res = await updatePipelineStage(id, editName, orderNum);
    
    if (res.error) {
      setError(res.error);
    } else if (res.stage) {
      setStages(stages.map(s => s.id === id ? res.stage! : s).sort((a, b) => a.order - b.order));
      setEditingId(null);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pipeline stage?")) return;
    
    setIsLoading(true);
    const res = await deletePipelineStage(id);
    if (res.error) {
      setError(res.error);
      alert(res.error);
    } else {
      setStages(stages.filter(s => s.id !== id));
    }
    setIsLoading(false);
  };

  const startEdit = (stage: PipelineStage) => {
    setEditingId(stage.id);
    setEditName(stage.name);
    setEditOrder(stage.order.toString());
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Pipeline Stages</h3>
        <p className="text-sm text-zinc-500">Manage the stages in your sales pipeline kanban board.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex gap-2 items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <Input 
          placeholder="New Stage Name" 
          value={newName} 
          onChange={e => setNewName(e.target.value)}
          className="max-w-xs"
          disabled={isLoading}
        />
        <Input 
          type="number" 
          placeholder="Order (e.g. 10)" 
          value={newOrder} 
          onChange={e => setNewOrder(e.target.value)}
          className="w-32"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !newName.trim()}>
          <Plus className="h-4 w-4 mr-2" /> Add Stage
        </Button>
      </form>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="p-3 w-16 text-center">Order</th>
              <th className="p-3">Stage Name</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {stages.map((stage) => (
              <tr key={stage.id} className="bg-white dark:bg-zinc-900">
                {editingId === stage.id ? (
                  <>
                    <td className="p-3">
                      <Input type="number" value={editOrder} onChange={e => setEditOrder(e.target.value)} className="w-20" />
                    </td>
                    <td className="p-3">
                      <Input value={editName} onChange={e => setEditName(e.target.value)} />
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleUpdate(stage.id)} disabled={isLoading}>Save</Button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 text-center font-medium text-zinc-500">
                      {stage.order}
                    </td>
                    <td className="p-3 font-medium">
                      {stage.name}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(stage)}>
                          <Edit className="h-4 w-4 text-zinc-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(stage.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {stages.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-zinc-500">No stages defined.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
