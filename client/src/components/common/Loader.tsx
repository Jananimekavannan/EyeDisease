import React from 'react';

interface LoaderProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({
  label = "Processing Retinal AI Scan...",
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className={`relative ${sizeClasses[size]} mb-4 flex items-center justify-center`}>
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-surface-border border-t-accent-orange animate-spin" />
        
        {/* Inner Counter Pulse */}
        <div className="absolute inset-2 rounded-full border border-accent-crimson/40 animate-ping opacity-30" />
        
        {/* Retinal Radar Line */}
        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-accent-bright to-transparent animate-pulse" />
        
        <div className="absolute w-2 h-2 rounded-full bg-accent-orange shadow-[0_0_10px_#FF5A1F]" />
      </div>
      {label && (
        <p className="font-mono text-xs uppercase tracking-widest text-accent-gold animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};
