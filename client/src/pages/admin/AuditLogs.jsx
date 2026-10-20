import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  FileText, 
  Calendar,
  Lock
} from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit', {
        params: { action: actionFilter, page, limit: 25 }
      });
      if (res.data?.data) {
        setLogs(res.data.data);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action) => {
    if (action.includes('ACCEPTED') || action.includes('CONFIRMED')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (action.includes('REJECTED') || action.includes('DISABLED') || action.includes('DEACTIVATED')) return 'bg-rose-50 text-rose-800 border-rose-200';
    if (action.includes('STATUS')) return 'bg-blue-50 text-blue-800 border-blue-200';
    return 'bg-purple-50 text-purple-800 border-purple-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Journaux d'Audit & Sécurité
        </h1>
        <p className="text-xs text-slate-500">
          Traçabilité immuable des validations CIN, modifications d'identités, transitions de statuts et habilitations.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filtrer par Action :</span>
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
          >
            <option value="">Toutes les actions</option>
            <option value="CIN_VALIDATION_ACCEPTED">Validation CIN (Acceptée)</option>
            <option value="CIN_VALIDATION_REJECTED">Validation CIN (Rejetée)</option>
            <option value="REQUEST_STATUS_UPDATED">Mise à jour statut demande</option>
            <option value="COLLECTION_CONFIRMED">Remise physique confirmée</option>
            <option value="STAFF_CREATED">Création de compte agent</option>
            <option value="CITIZEN_CONTACT_UPDATED">Modification coordonnées citoyen</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
            Lecture des journaux de traçabilité...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">Aucun événement d'audit</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Date & Heure</th>
                  <th className="py-3.5 px-4">Utilisateur / Auteur</th>
                  <th className="py-3.5 px-4">Action Traçée</th>
                  <th className="py-3.5 px-4">Entité Cible</th>
                  <th className="py-3.5 px-4">Détails de l'Événement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-slate-900">{log.userName || 'Système'}</p>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {log.userRole || 'Automatique'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-block font-mono font-bold text-[10px] px-2 py-0.5 rounded-full border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {log.entityType}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-md">
                      <pre className="text-[11px] font-sans truncate" title={JSON.stringify(log.details)}>
                        {JSON.stringify(log.details)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
