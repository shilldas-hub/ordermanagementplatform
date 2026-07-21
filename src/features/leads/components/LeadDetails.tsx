"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, MessageSquare, PhoneCall, Mail, Calendar, CheckCircle2, Clock, MapPin, Building2, UserCircle2, Paperclip, FileText } from "lucide-react";
import { addLeadActivity } from "../actions";
import { LeadForm } from "./LeadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { updateLead } from "../actions";

interface LeadDetailsProps {
  lead: any;
  stages?: any[];
  clients?: any[];
  users?: any[];
  regions?: any[];
}

const activityIcons: Record<string, React.ReactNode> = {
  NOTE: <MessageSquare className="h-4 w-4 text-blue-500" />,
  CALL: <PhoneCall className="h-4 w-4 text-green-500" />,
  EMAIL: <Mail className="h-4 w-4 text-orange-500" />,
  MEETING: <Calendar className="h-4 w-4 text-purple-500" />,
  TASK: <CheckCircle2 className="h-4 w-4 text-red-500" />,
};

export function LeadDetails({ lead, stages = [], clients = [], users = [], regions = [] }: LeadDetailsProps) {
  const [newActivityDesc, setNewActivityDesc] = useState("");
  const [newActivityType, setNewActivityType] = useState<any>("NOTE");
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddActivity = async () => {
    if (!newActivityDesc.trim()) return;
    setIsSubmitting(true);
    await addLeadActivity(lead.id, newActivityDesc, newActivityType, fileUrl || undefined, fileName || undefined);
    setNewActivityDesc("");
    setFileUrl("");
    setFileName("");
    setIsSubmitting(false);
    window.location.reload(); // Quick refresh to show new activity
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Lead Info */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Lead Details</CardTitle>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "h-8" })}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Lead</DialogTitle>
                </DialogHeader>
                <LeadForm
                  initialData={lead}
                  stages={stages}
                  clients={clients}
                  users={users}
                  regions={regions}
                  onSubmit={async (data) => {
                    await updateLead({ ...data, id: lead.id });
                    setIsEditDialogOpen(false);
                    window.location.reload();
                    return { success: true };
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-zinc-500 block mb-1">Title</span>
              <p className="font-medium text-base">{lead.title}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-zinc-500 block mb-1">Expected Value</span>
                <div className="font-semibold text-lg text-green-600 dark:text-green-400">
                  ₹{lead.expectedValue?.toLocaleString('en-IN') || "0"}
                </div>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">Pipeline Stage</span>
              {stages.length > 0 ? (
                <Select 
                  value={lead.stageId} 
                  onValueChange={async (val) => {
                    await updateLead({ ...lead, stageId: val, clientId: lead.clientId, assignedToId: lead.assignedToId || undefined, expectedValue: lead.expectedValue ? parseFloat(lead.expectedValue) : undefined, priority: lead.priority, source: lead.source });
                    window.location.reload();
                  }}
                >
                  <SelectTrigger className="w-[200px] h-8">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary">{lead.stage.name}</Badge>
              )}
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">Client</span>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-zinc-400" />
                <span className="font-medium">{lead.client.companyName}</span>
              </div>
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">Assigned To</span>
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-zinc-400" />
                <span className="font-medium">{lead.assignedTo?.name || 'Unassigned'}</span>
              </div>
            </div>

            {lead.region && (
              <div>
                <span className="text-zinc-500 block mb-1">Region</span>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-400" />
                  <span className="font-medium">{lead.region.name}</span>
                </div>
              </div>
            )}

            <div>
              <span className="text-zinc-500 block mb-1">Source</span>
              <span className="font-medium">{lead.source}</span>
            </div>

            <div>
              <span className="text-zinc-500 block mb-1">Expected Closing Date</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <span className="font-medium">
                  {lead.expectedClosingDate ? format(new Date(lead.expectedClosingDate), "MMM dd, yyyy") : "Not set"}
                </span>
              </div>
            </div>

            {lead.description && (
              <div>
                <span className="text-zinc-500 block mb-1">Description</span>
                <p className="text-zinc-700 dark:text-zinc-300">{lead.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Timeline & Activities */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/3">
                <Select value={newActivityType} onValueChange={setNewActivityType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Activity Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOTE">Note</SelectItem>
                    <SelectItem value="CALL">Call</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="MEETING">Meeting</SelectItem>
                    <SelectItem value="TASK">Task</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea 
              placeholder="Describe the activity or add a note..."
              value={newActivityDesc}
              onChange={(e) => setNewActivityDesc(e.target.value)}
              rows={3}
            />
            <div className="flex gap-4">
              <Input 
                placeholder="Attachment URL (optional)" 
                value={fileUrl} 
                onChange={e => setFileUrl(e.target.value)} 
                className="text-sm"
              />
              <Input 
                placeholder="Attachment Name (optional)" 
                value={fileName} 
                onChange={e => setFileName(e.target.value)} 
                className="text-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleAddActivity} disabled={isSubmitting || !newActivityDesc.trim()}>
                Post Activity
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" /> Activity Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-700 before:to-transparent">
              {lead.activities?.map((activity: any) => (
                <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                    {activityIcons[activity.type] || <MessageSquare className="h-4 w-4" />}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {activity.createdBy?.name || 'System'}
                      </span>
                      <time className="text-xs text-zinc-500">
                        {format(new Date(activity.createdAt), "MMM dd, h:mm a")}
                      </time>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 whitespace-pre-wrap">
                      {activity.description}
                    </p>
                    {activity.attachments && activity.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activity.attachments.map((att: any) => (
                          <a 
                            key={att.id} 
                            href={att.fileUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors rounded-md border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                          >
                            <Paperclip className="h-3.5 w-3.5 text-zinc-500" />
                            {att.fileName || "Attachment"}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {(!lead.activities || lead.activities.length === 0) && (
                <div className="text-center text-sm text-zinc-500 py-8 relative z-10 bg-white dark:bg-zinc-950">
                  No activities recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
