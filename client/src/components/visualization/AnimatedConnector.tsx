import React from 'react';

export const AnimatedConnector: React.FC = () => {
  return (
    <div className="hidden lg:flex items-center justify-center px-2 py-4">
      <div className="w-12 h-0.5 bg-surface-border relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-accent-orange animate-pulse" />
      </div>
    </div>
  );
};
