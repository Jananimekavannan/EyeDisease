import React from 'react';
import { Cpu, Loader2 } from 'lucide-react';

export const ScreeningProgress: React.FC = () => (
  <div className="brutal-card p-8 text-center space-y-4 max-w-xl mx-auto" role="status" aria-live="polite">
    <div className="flex items-center justify-center gap-3">
      <Cpu className="w-6 h-6 text-accent-orange" />
      <h3 className="font-mono text-lg font-bold text-text-primary uppercase tracking-wider">
        Sending image to screening service
      </h3>
      <Loader2 className="w-5 h-5 text-accent-orange animate-spin" />
    </div>
    <p className="font-mono text-xs text-text-secondary">
      The server is checking image quality before running the production model.
    </p>
  </div>
);
