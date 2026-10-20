import React from 'react';
import StatusBadge from './StatusBadge';
import { Calendar, UserCheck, Shield, MessageSquare, Lock } from 'lucide-react';

export default function TimelineView({ history = [], isStaff = false }) {
  if (!history || history.length === 0) {
    return (
      <div className="py-6 text-center text-slate-400 text-sm">
        Aucun historique d'état disponible.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {history.map((entry, index) => {
        const isLatest = index === history.length - 1;
        return (
          <div key={entry._id || index} className="relative group">
            {/* Timeline dot */}
            <div
              className={`absolute -left-[1.85rem] top-1.5 w-4 h-4 rounded-full border-2 bg-white transition-all ${
                isLatest
                  ? 'border-emerald-600 ring-4 ring-emerald-100 bg-emerald-600'
                  : 'border-slate-400 group-hover:border-emerald-500'
              }`}
            />

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={entry.newStatus} size="xs" />
                  {entry.previousStatus && entry.previousStatus !== 'None' && (
                    <span className="text-xs text-slate-400">
                      (précédemment : {entry.previousStatus})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(entry.changedAt).toLocaleString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Responsible user */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                {entry.changedByRole === 'citizen' ? (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span className="font-medium text-slate-700">
                  {entry.changedByName || 'Système'}
                </span>
                <span className="text-[11px] text-slate-400 capitalize">
                  ({entry.changedByRole || 'système'})
                </span>
              </div>

              {/* Public note */}
              {entry.notes && (
                <div className="p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{entry.notes}</p>
                </div>
              )}

              {/* Confidential internal staff note (only rendered if isStaff is true and present) */}
              {isStaff && entry.internalStaffNote && (
                <div className="p-2.5 bg-amber-50/80 rounded-lg text-xs text-amber-900 border border-amber-200/80 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-amber-800 text-[11px] block uppercase tracking-wider mb-0.5">
                      Note Interne Staff (Confidentielle) :
                    </span>
                    <p className="leading-relaxed">{entry.internalStaffNote}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
