import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
    xl: 'text-base px-6 py-3.5 gap-3 font-semibold',
    icon: 'p-2',
  };

  const variantClasses = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow focus:ring-brand-500 border border-transparent',
    secondary: 'bg-indigo-50 hover:bg-indigo-100 text-brand-700 focus:ring-brand-400 border border-indigo-200/60',
    outline: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-brand-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500',
    dark: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm focus:ring-slate-600',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        Icon && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && IconRight && <IconRight className="w-4 h-4 shrink-0" />}
    </button>
  );
}
