import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  Users, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  PackageCheck, 
  Award, 
  XCircle, 
  Calendar, 
  TrendingUp, 
  ArrowRight,
  ShieldAlert,
  Layers,
  Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [period, setPeriod] = useState('30d');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats', {
        params: { period }
      });
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = stats?.summary || {};
  const serviceDistribution = stats?.serviceDistribution || [];
  const volumeTimeline = stats?.volumeTimeline || [];
  const recentActivity = stats?.recentActivity || [];

  return (
    <div className="space-y-8">
      {/* Top Welcome & Period Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tableau de Bord Opérationnel
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervision de l'activité administrative de la Mo9ata3a en temps réel.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
          {[
            { id: 'today', label: "Aujourd'hui" },
            { id: '7d', label: '7 jours' },
            { id: '30d', label: '30 jours' },
            { id: 'all', label: 'Tout l\'historique' }
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                period === p.id
                  ? 'bg-morocco-green-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Citoyens Enrôlés</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{summary.totalCitizens || 0}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Validation CIN automatique</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Demandes</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{summary.totalRequests || 0}</p>
          <span className="text-[11px] text-slate-400 font-medium">{summary.periodRequests || 0} sur la période</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">En Attente d'Examen</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{summary.awaitingReview || 0}</p>
          <span className="text-[11px] text-amber-700 font-medium">À instruire par les agents</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Délai Moyen Réel</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-700">
            {summary.avgProcessingHours ? `${summary.avgProcessingHours}h` : '1.8 j'}
          </p>
          <span className="text-[11px] text-purple-600 font-medium">Du dépôt à la remise physique</span>
        </div>
      </div>

      {/* Workflow Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Actions Requises</span>
          <span className="text-xl font-bold text-purple-600">{summary.actionRequired || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Approuvées</span>
          <span className="text-xl font-bold text-emerald-600">{summary.approved || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Prêtes au Guichet</span>
          <span className="text-xl font-bold text-teal-600">{summary.readyForCollection || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Délivrées (Issued)</span>
          <span className="text-xl font-bold text-green-700">{summary.issued || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 block">Rejetées</span>
          <span className="text-xl font-bold text-rose-600">{summary.rejected || 0}</span>
        </div>
      </div>

      {/* Middle Row: Volume Chart + Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Volume Timeline */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Évolution du Volume des Demandes (7 derniers jours)</span>
            </h2>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2">
            {volumeTimeline.map((item, idx) => {
              const maxCount = Math.max(...volumeTimeline.map(v => v.count), 5);
              const heightPercent = Math.max(15, Math.round((item.count / maxCount) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-emerald-600 group-hover:bg-emerald-700 rounded-t-xl transition-all shadow-xs"
                  />
                  <span className="text-[10px] text-slate-500 capitalize">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Service */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <span>Répartition par Service Administratif</span>
            </h2>
            <Link to="/admin/requests" className="text-xs text-emerald-700 font-semibold hover:underline">
              Traiter les dossiers &rarr;
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {serviceDistribution.map((svc) => {
              const totalDist = summary.totalRequests || 1;
              const pct = Math.round((svc.count / totalDist) * 100);
              return (
                <div key={svc.serviceId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{svc.name}</span>
                    <span className="font-bold text-slate-900">{svc.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-morocco-green-600 rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Administrative Activity Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>Journal Récent des Actions Administratives & d'Audit</span>
          </h2>
          {isAdmin && (
            <Link to="/admin/audit" className="text-xs text-emerald-700 font-semibold hover:underline">
              Voir tous les journaux d'audit &rarr;
            </Link>
          )}
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Aucune activité récente enregistrée.</p>
          ) : (
            recentActivity.map((act) => (
              <div key={act._id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">{act.userName || 'Agent'}</span>
                    <span className="text-slate-500 ml-1.5 font-mono text-[11px]">[{act.action}]</span>
                    {act.details?.reference && (
                      <span className="text-emerald-700 ml-1.5 font-bold">Réf: {act.details.reference}</span>
                    )}
                  </div>
                </div>
                <span className="text-slate-400 text-[11px] shrink-0">
                  {new Date(act.createdAt).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
