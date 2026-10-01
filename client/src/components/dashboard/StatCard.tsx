import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  variant?: 'orange' | 'crimson' | 'gold' | 'success';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  isPositive = true,
  icon,
  variant = 'orange',
}) => {
  const borderColors = {
    orange: 'border-accent-orange',
    crimson: 'border-accent-crimson',
    gold: 'border-accent-gold',
    success: 'border-status-success',
  };

  const textColors = {
    orange: 'text-accent-orange',
    crimson: 'text-accent-crimson',
    gold: 'text-accent-gold',
    success: 'text-status-success',
  };

  return (
    <div className={`brutal-card p-5 border-l-4 ${borderColors[variant]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs uppercase font-bold text-text-muted">
          {label}
        </span>
        <div className="p-2 bg-surface-2 border border-surface-border text-text-secondary">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className={`font-mono text-3xl font-black ${textColors[variant]}`}>
          {value}
        </span>
        {change && (
          <span
            className={`font-mono text-xs font-bold ${
              isPositive ? 'text-status-success' : 'text-status-danger'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
