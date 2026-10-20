import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  User, 
  ArrowRight, 
  Layers, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function RequestManagement() {
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, serviceFilter, search, page]);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      if (res.data?.data) setServices(res.data.data);
    } catch (err) {}
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests', {
        params: {
          status: statusFilter,
          serviceId: serviceFilter,
          search,
          page,
          limit: 15
        }
      });
      if (res.data?.data) {
        setRequests(res.data.data);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestion des Dossiers Administratifs
          </h1>
          <p className="text-xs text-slate-500">
            Instruction, examen documentaire et validation des démarches communales.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Réf: REQ-2026-..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Service Selector */}
          <div>
            <select
              value={serviceFilter}
              onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="all">Tous les services administratifs</option>
              {services.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Status Selector */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="Submitted">Soumise (À instruire)</option>
              <option value="Under Review">En cours d'examen</option>
              <option value="Action Required">Action requise (Doc manquant)</option>
              <option value="Approved">Approuvée</option>
              <option value="Ready for Collection">Prête pour retrait</option>
              <option value="Issued">Délivrée au citoyen</option>
              <option value="Rejected">Rejetée</option>
            </select>
          </div>
        </div>

        {/* Quick Pills for Common Workflows */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Filtres Rapides :</span>
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'Submitted', label: 'À Instruire' },
            { id: 'Under Review', label: 'En Examen' },
            { id: 'Action Required', label: 'Actions Requises' },
            { id: 'Ready for Collection', label: 'À Remettre' },
            { id: 'Issued', label: 'Délivrées' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => { setStatusFilter(f.id); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.id
                  ? 'bg-morocco-green-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
            Chargement des dossiers...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">Aucun dossier correspondant</p>
            <p className="text-xs">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Référence</th>
                  <th className="py-3.5 px-4">Citoyen Demandeur</th>
                  <th className="py-3.5 px-4">Service Demandé</th>
                  <th className="py-3.5 px-4">Date de Dépôt</th>
                  <th className="py-3.5 px-4">Statut Actuel</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map(req => (
                  <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {req.reference}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                          {req.citizen?.fullName ? req.citizen.fullName[0].toUpperCase() : 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{req.citizen?.fullName || 'Citoyen'}</p>
                          <p className="text-[11px] text-slate-400">{req.citizen?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{req.service?.name || 'Service'}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{req.service?.code}</span>
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} size="xs" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/admin/requests/${req._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-morocco-green-600 hover:bg-morocco-green-700 text-white rounded-xl font-semibold shadow-2xs transition-colors"
                      >
                        <span>Examiner</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Page {page} sur {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                Précédent
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
