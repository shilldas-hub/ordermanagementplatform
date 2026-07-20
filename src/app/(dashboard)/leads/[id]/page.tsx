import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getLeadDetails } from "@/features/leads/actions";
import { getPipelineStages } from "@/features/settings/actions";
import { LeadDetails } from "@/features/leads/components/LeadDetails";
import { Button } from "@/components/ui/button";

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  try {
    const lead = await getLeadDetails(resolvedParams.id);
    const stages = await getPipelineStages();
    
    return (
      <div className="w-full space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/leads">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{lead.title}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Lead Details and History</p>
          </div>
        </div>
        
        <LeadDetails lead={lead} stages={stages} />
      </div>
    );
  } catch (error) {
    console.error(error);
    notFound();
  }
}
