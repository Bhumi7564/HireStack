import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm' }) => {
  const variantStyles = {
    // Pipeline Stages
    APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
    SCREENING: 'bg-amber-50 text-amber-700 border-amber-200',
    INTERVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
    OFFER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    HIRED: 'bg-green-600 text-white border-green-600',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    
    // Job Status
    OPEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-200',
    DRAFT: 'bg-slate-100 text-slate-500 border-slate-200',
    PAUSED: 'bg-amber-50 text-amber-700 border-amber-200',

    // Interview Status
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',

    // Recommendations
    STRONG_HIRE: 'bg-green-600 text-white border-green-600',
    HIRE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    NEUTRAL: 'bg-slate-100 text-slate-700 border-slate-200',
    DO_NOT_HIRE: 'bg-rose-100 text-rose-800 border-rose-200',
    STRONG_DO_NOT_HIRE: 'bg-rose-600 text-white border-rose-600',

    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const style = variantStyles[children] || variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${style} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

export default Badge;

