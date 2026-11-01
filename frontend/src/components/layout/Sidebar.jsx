import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Kanban,
  CalendarDays,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, isAdmin, isRecruiter } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', to: '/jobs', icon: Briefcase },
    { name: 'Candidates', to: '/candidates', icon: Users },
    { name: 'Pipeline (Kanban)', to: '/pipeline', icon: Kanban },
    { name: 'Interviews', to: '/interviews', icon: CalendarDays },
    { name: 'Communications', to: '/communication', icon: MessageSquare },
    { name: 'Analytics', to: '/analytics', icon: BarChart3 },
    ...(isAdmin ? [{ name: 'User Management', to: '/users', icon: ShieldCheck }] : []),
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 min-h-screen text-slate-300">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-brand-500/30">
          H
        </div>
        <div>
          <span className="font-bold text-lg text-white tracking-tight">HireStack</span>
          <span className="text-[10px] block text-brand-400 font-semibold uppercase tracking-wider">Recruitment ATS</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">Main Menu</p>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Current User & Organization Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 font-semibold text-sm">
            {user?.firstName ? user.firstName.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {user?.role?.replace('ROLE_', '')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

