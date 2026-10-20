import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { 
  FileText, 
  PlusCircle, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  PackageCheck, 
  ArrowRight,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const citizenProfile = user?.citizenProfile || {};

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/my', {
        params: { status: statusFilter }
      });
      if (res.data?.data) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching citizen requests:', err);
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const total = requests.length;
  const inProgress = requests.filter(r => ['Submitted', 'Under Review'].includes(r.status)).length;
  const actionRequired = requests.filter(r => r.status === 'Action Required').length;
  const readyForCollection = requests.filter(r => r.status === 'Ready for Collection').length;

  const filteredRequests = requests.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.reference?.toLowerCase().includes(term) ||
      r.service?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Citizen Welcome Card with CIN Badge */}
      <div className="bg-gradient-to-r from-emerald-800 to-morocco-green-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold border border-white/15">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Identité Vérifiée par CIN • {citizenProfile.cin || 'CIN'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bonjour, {user?.fullName || 'Citoyen'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
            Bienvenue sur votre portail administratif numérique. Suivez en direct vos demandes et découvrez l'ensemble des services communaux.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/requests/new"
            className="flex items-center gap-2 px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl shadow-md transition-all hover:scale-105 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouvelle Demande</span>
          </Link>
          <Link
            to="/citizen/profile"
            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-sm border border-white/20 text-sm font-semibold transition-colors"
          >
            <span>Mon Profil CIN</span>
          </Link>
        </div>
      </div>

      {/* Action Required Banner if any */}
      {actionRequired > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-purple-900 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">Complément de dossier nécessaire</p>
              <p className="text-xs text-purple-700">
                Vous avez {actionRequired} demande(s) en attente d'action ou de document manquant.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Action Required')}
            className="px-3.5 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors shrink-0"
          >
            Afficher
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Total Demandes</span>
          <p className="text-2xl font-extrabold text-slate-900">{total}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">En Cours d'Examen</span>
          <p className="text-2xl font-extrabold text-blue-600">{inProgress}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Actions Requises</span>
          <p className="text-2xl font-extrabold text-purple-600">{actionRequired}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500">Prêtes au Guichet</span>
          <p className="text-2xl font-extrabold text-teal-600">{readyForCollection}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Rechercher par référence ou service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Statut:
          </span>
          {['all', 'Submitted', 'Under Review', 'Action Required', 'Ready for Collection', 'Issued'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-morocco-green-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'Toutes' : t(`status_${st.replace(/\s+/g, '')}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-base">Historique de vos démarches</h2>
          <span className="text-xs text-slate-400">{filteredRequests.length} résultat(s)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
            Chargement de vos demandes...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Aucune demande trouvée</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Vous n'avez pas encore de demande avec ce statut. Consultez le catalogue pour initier une démarche.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-4 py-2 bg-morocco-green-600 text-white text-xs font-semibold rounded-xl hover:bg-morocco-green-700 transition-colors"
            >
              <span>Consulter les services disponibles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((req) => (
              <div
                key={req._id}
                className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {req.reference}
                    </span>
                    <StatusBadge status={req.status} />
                    {req.collectionToken && req.status === 'Ready for Collection' && (
                      <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                        Code Retrait: {req.collectionToken}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {req.service?.name || 'Service Administratif'}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Déposée le {new Date(req.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <span>•</span>
                    <span>{req.documents?.length || 0} document(s) joint(s)</span>
                  </div>
                </div>

                <Link
                  to={`/requests/${req._id}`}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors shrink-0"
                >
                  <span>Détails & Suivi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
