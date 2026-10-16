import React from 'react';

export function Card({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 transition-all duration-200 ${
        hover ? 'hover:shadow-card hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between border-b border-slate-100 pb-3 mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`font-semibold text-slate-900 text-base flex items-center gap-2 ${className}`}>
      {children}
    </h3>
  );
}
