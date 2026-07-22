"use client";

import React, { useState, useEffect } from 'react';
import { getActivities, createNoteActivity } from '../actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, RefreshCw, Send, FileText, PhoneCall, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  targetId: string;
  type: 'lead' | 'client' | 'order';
}

export function ActivityTimeline({ targetId, type }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await getActivities(targetId, type);
      setActivities(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetId) {
      fetchActivities();
    }
  }, [targetId, type]);

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setIsSubmitting(true);
    const res = await createNoteActivity(targetId, type, note);
    if (res.success && res.activity) {
      setActivities([res.activity, ...activities]);
      setNote("");
    }
    setIsSubmitting(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'NOTE': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'STATUS_CHANGE': return <RefreshCw className="w-4 h-4 text-orange-500" />;
      case 'FILE_UPLOAD': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'CALL': return <PhoneCall className="w-4 h-4 text-green-500" />;
      default: return <CheckCircle className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Activity Timeline</h3>
        <span className="text-xs text-zinc-500">{activities.length} entries</span>
      </div>

      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <div className="relative">
          <Textarea 
            placeholder="Add a note or log a call..." 
            className="min-h-[80px] resize-none pr-12 text-sm bg-zinc-50 dark:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-950 transition-colors"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isSubmitting}
          />
          <Button 
            size="icon" 
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
            disabled={!note.trim() || isSubmitting}
            onClick={handleAddNote}
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-20 text-sm text-zinc-500">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-zinc-400">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No recent activity.</p>
          </div>
        ) : (
          <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
            {activities.map((activity, idx) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-6 last:mb-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 bg-zinc-100 dark:bg-zinc-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-sm">
                  {getIcon(activity.type)}
                </div>
                
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-[9px] bg-zinc-800 text-white">
                          {activity.createdBy?.name?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-xs">{activity.createdBy?.name || 'System'}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 whitespace-pre-wrap leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
