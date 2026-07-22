"use client";

import React, { useState } from 'react';
import { createPipelineStage, updatePipelineStage, deletePipelineStage } from '../actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, GripVertical, Trash2, Edit2, Check, X } from 'lucide-react';

export function PipelineStageManager({ initialStages }: { initialStages: any[] }) {
  const [stages, setStages] = useState(initialStages);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("blue");
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const res = await createPipelineStage(newName, stages.length + 1);
    if ((res as any).stage) {
      setStages([...stages, (res as any).stage]);
      setIsAdding(false);
      setNewName("");
    }
  };

  const handleUpdate = async (id: string, order: number) => {
    if (!editName.trim()) return;
    const res = await updatePipelineStage(id, editName, order);
    if ((res as any).stage) {
      setStages(stages.map(s => s.id === id ? (res as any).stage : s));
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this stage? Leads in this stage might be affected.")) {
      const res = await deletePipelineStage(id);
      if (res.success) {
        setStages(stages.filter(s => s.id !== id));
      }
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    if (direction === 'up' && index > 0) {
      const temp = newStages[index];
      newStages[index] = newStages[index - 1];
      newStages[index - 1] = temp;
    } else if (direction === 'down' && index < newStages.length - 1) {
      const temp = newStages[index];
      newStages[index] = newStages[index + 1];
      newStages[index + 1] = temp;
    } else {
      return;
    }

    // Update orders locally
    newStages.forEach((s, i) => {
      s.order = i;
    });
    setStages(newStages);

    // Persist changes
    for (const stage of newStages) {
      await updatePipelineStage(stage.id, stage.name, stage.order);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <CardTitle className="text-lg font-semibold">Pipeline Stages</CardTitle>
        <Button size="sm" onClick={() => setIsAdding(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Stage
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {stages.map((stage, index) => (
            <div key={stage.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1 cursor-pointer">
                  <Button variant="ghost" size="icon" className="h-4 w-4 rounded-none" onClick={() => moveOrder(index, 'up')} disabled={index === 0}>
                    <span className="text-[10px]">▲</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-4 w-4 rounded-none" onClick={() => moveOrder(index, 'down')} disabled={index === stages.length - 1}>
                    <span className="text-[10px]">▼</span>
                  </Button>
                </div>
                
                {editingId === stage.id ? (
                  <div className="flex items-center gap-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 w-40" />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdate(stage.id, stage.order)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline" className={`bg-${stage.color || 'blue'}-50 text-${stage.color || 'blue'}-700 dark:bg-${stage.color || 'blue'}-950 dark:text-${stage.color || 'blue'}-400 border-${stage.color || 'blue'}-200`}>
                    {stage.name}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500" onClick={() => { setEditingId(stage.id); setEditName(stage.name); }}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => handleDelete(stage.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {isAdding && (
            <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-zinc-300" />
                <Input placeholder="Stage Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="h-8 w-40" />
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => { setIsAdding(false); setNewName(""); }}>Cancel</Button>
              </div>
            </div>
          )}

          {stages.length === 0 && !isAdding && (
            <div className="text-center p-6 text-zinc-500 text-sm">
              No pipeline stages found. Add one to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
