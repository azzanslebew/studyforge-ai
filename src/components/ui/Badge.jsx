import React from 'react';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  icon: Icon
}) {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.default} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

export function DifficultyBadge({ difficulty }) {
  const map = {
    easy: { label: 'Mudah', variant: 'success' },
    medium: { label: 'Sedang', variant: 'warning' },
    hard: { label: 'Sulit', variant: 'danger' },
  };

  const info = map[difficulty] || { label: difficulty || 'Umum', variant: 'default' };

  return <Badge variant={info.variant} size="sm">{info.label}</Badge>;
}
