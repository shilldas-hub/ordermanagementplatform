import React from 'react';
import { LeadsKanban } from '@/features/leads/components/LeadsKanban';

export default function LeadsPage() {
  return (
    <div className="w-full h-[calc(100vh-8rem)]">
      <LeadsKanban />
    </div>
  );
}
