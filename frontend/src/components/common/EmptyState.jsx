import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No records found', description = 'Try adjusting your search filters or create a new entry.', actionText, onAction, icon: Icon = Inbox }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-200 rounded-xl my-4">
      <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

