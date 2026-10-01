import React from 'react';
import type { DRDistribution } from '../../types/dashboard';

interface AnalyticsChartProps {
  distribution: DRDistribution[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ distribution }) => {
  const colors = [
    '#35C759', // No DR
    '#FFB020', // Mild DR
    '#FF5A1F', // Moderate DR
    '#C62828', // Severe DR
    '#FF3B30', // Proliferative DR
  ];

  return (
    <div className="brutal-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-surface-border font-mono">
        <h3 className="text-sm font-bold text-text-primary uppercase">
          Retinal Severity Stratification (Cumulative)
        </h3>
        <span className="text-[10px] text-accent-orange font-bold">N = 3,840</span>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {distribution.map((item, index) => (
          <div key={item.category} className="space-y-1">
            <div className="flex justify-between text-text-secondary">
              <span>{item.category}</span>
              <span className="font-bold text-text-primary">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full h-2 bg-surface-2 border border-surface-border overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: colors[index % colors.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
