import React from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { Button } from '../components/common/Button';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <PublicLayout>
      <div className="pt-36 pb-28 bg-bg-darkest min-h-[80vh] flex items-center justify-center text-center">
        <div className="max-w-md mx-auto px-4 space-y-6">
          <div className="inline-flex p-4 bg-surface-1 border border-accent-crimson text-accent-crimson">
            <AlertTriangle className="w-12 h-12 animate-pulse" />
          </div>

          <h1 className="font-mono text-6xl font-black text-accent-orange">404</h1>
          <h2 className="font-mono text-xl font-bold uppercase text-text-primary">
            Retinal Coordinate Not Found
          </h2>
          <p className="text-sm font-sans text-text-secondary">
            The requested clinical workstation route or document does not exist.
          </p>

          <div>
            <a href="/">
              <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
                Return to Command Center
              </Button>
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};
