import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'gold' | 'info' | 'neutral';
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  pulse = false,
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-status-success/10 text-status-success border-status-success/30',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/30',
    danger: 'bg-status-danger/10 text-status-danger border-status-danger/30',
    gold: 'bg-accent-gold/10 text-accent-gold border-accent-gold/30',
    info: 'bg-accent-orange/10 text-accent-orange border-accent-orange/30',
    neutral: 'bg-surface-3 text-text-secondary border-surface-border',
  };

  const dotStyles = {
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    danger: 'bg-status-danger',
    gold: 'bg-accent-gold',
    info: 'bg-accent-orange',
    neutral: 'bg-text-muted',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border text-xs font-mono font-semibold uppercase tracking-wider ${variantStyles[variant]} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles[variant]}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles[variant]}`} />
      </span>
      {children}
    </span>
  );
};
