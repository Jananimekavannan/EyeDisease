import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'brutal' | 'gold' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  let baseStyle = "inline-flex items-center justify-center font-bold font-sans tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-orange/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs uppercase tracking-wider gap-1.5 border",
    md: "px-5 py-2.5 text-sm uppercase tracking-wider gap-2 border",
    lg: "px-7 py-3.5 text-base uppercase tracking-widest gap-2.5 border-2",
  };

  const variantStyles = {
    primary: "skeuo-button text-white border-accent-bright hover:border-accent-orange shadow-royal",
    secondary: "skeuo-dark-btn text-text-primary border-surface-border hover:border-accent-orange hover:text-accent-orange",
    brutal: "bg-surface-1 text-text-primary border-accent-orange shadow-brutal hover:bg-surface-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#FF5A1F]",
    gold: "bg-gradient-to-b from-[#E5C158] to-[#B88B2A] text-bg-darkest border-accent-gold shadow-brutal-gold hover:brightness-110",
    danger: "bg-gradient-to-b from-[#EF4444] to-[#B91C1C] text-white border-status-danger shadow-crimson hover:brightness-110",
    ghost: "bg-transparent text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-1",
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
