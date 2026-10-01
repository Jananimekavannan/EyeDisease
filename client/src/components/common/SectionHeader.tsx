import React from 'react';

interface SectionHeaderProps {
  number: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  eyebrow,
  title,
  description,
  align = 'left',
  action,
}) => {
  return (
    <div className={`mb-12 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <div className={`flex items-center gap-2.5 mb-2 ${align === 'center' ? 'justify-center' : 'justify-start'}`}>
        <span className="font-mono text-sm font-bold text-accent-orange">•</span>
        <span className="font-mono text-xs uppercase tracking-widest text-text-secondary">
          {eyebrow}
        </span>
      </div>
      
      <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 ${align === 'center' ? 'items-center' : ''}`}>
        <h2 className="text-3xl md:text-5xl font-black font-sans tracking-tight text-text-primary uppercase leading-none">
          {title.split('.').map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && <span className="text-accent-orange">.</span>}
            </React.Fragment>
          ))}
        </h2>
        {action && <div>{action}</div>}
      </div>

      {description && (
        <p className={`mt-4 text-base md:text-lg text-text-secondary max-w-2xl font-normal leading-relaxed ${align === 'center' ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </div>
  );
};
