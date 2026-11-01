import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Bell, Building } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm/50">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-700">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>{user?.companyName || 'HireStack Global'}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-800 block">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="text-[11px] text-slate-400 block">{user?.email}</span>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

