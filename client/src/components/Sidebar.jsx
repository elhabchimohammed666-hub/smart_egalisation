import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  FileCheck2, 
  UserCog, 
  ShieldCheck, 
  ChevronRight,
  Building
} from 'lucide-react';

export default function Sidebar() {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  const navItemClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-morocco-green-600 text-white shadow-sm shadow-emerald-800/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Workspace Badge */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Espace Administratif</p>
              <p className="text-[11px] text-slate-500 line-clamp-1">{user?.department || 'Bureau de l\'état civil'}</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Opérations Quotidiennes
          </p>

          <NavLink to="/admin/dashboard" className={navItemClass}>
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('dashboard')}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </NavLink>

          <NavLink to="/admin/requests" className={navItemClass}>
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4" />
              <span>{t('requestsManagement')}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </NavLink>

          <NavLink to="/admin/citizens" className={navItemClass}>
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>{t('registry')}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </NavLink>
        </div>

        {/* Administration Section (Admins Only) */}
        {isAdmin && (
          <div className="space-y-1 pt-4 border-t border-slate-100">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Supervision & Paramètres
            </p>

            <NavLink to="/admin/services" className={navItemClass}>
              <div className="flex items-center gap-3">
                <FileCheck2 className="w-4 h-4" />
                <span>Catalogue Services</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </NavLink>

            <NavLink to="/admin/staff" className={navItemClass}>
              <div className="flex items-center gap-3">
                <UserCog className="w-4 h-4" />
                <span>{t('staffManagement')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </NavLink>

            <NavLink to="/admin/audit" className={navItemClass}>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('auditLogs')}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </NavLink>
          </div>
        )}
      </div>

      {/* Role tag footer */}
      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900">
        <span className="font-semibold block mb-0.5">Connecté en tant que :</span>
        <span className="text-emerald-700 capitalize">
          {isAdmin ? 'Administrateur Système' : 'Gestionnaire / Agent Administratif'}
        </span>
      </div>
    </aside>
  );
}
