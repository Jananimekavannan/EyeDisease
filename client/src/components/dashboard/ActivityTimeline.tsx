import React from 'react';
import { Activity } from 'lucide-react';

export const ActivityTimeline: React.FC = () => (
  <div className="brutal-card p-5 space-y-4">
    <h3 className="text-sm font-bold text-text-primary uppercase flex items-center gap-2">
      <Activity className="w-4 h-4 text-accent-orange" /> Clinical audit stream
    </h3>
    <p className="font-mono text-xs text-text-muted">No audit-log service is connected.</p>
  </div>
);
