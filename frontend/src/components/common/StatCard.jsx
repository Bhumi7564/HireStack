import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, trend = 'up', color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        {change && (
          <p className="mt-2 text-xs flex items-center gap-1 text-slate-500">
            <span className={trend === 'up' ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
              {trend === 'up' ? '↑' : '↓'} {change}
            </span>
            <span>vs last month</span>
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.blue}`}>
        {Icon && <Icon className="w-5 h-5" />}
      </div>
    </div>
  );
};

export default StatCard;

