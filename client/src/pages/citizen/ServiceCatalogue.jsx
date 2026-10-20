import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Filter,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export default function ServiceCatalogue() {
  const { t } = useLanguage();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      if (res.data?.data) {
        setServices(res.data.data);
      }
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(services.map(s => s.category).filter(Boolean))];

  const filteredServices = services.filter(svc => {
    const matchesSearch = !search || svc.name.toLowerCase().includes(search.toLowerCase()) || svc.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || svc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>Services de l'Arrondissement Communal (Mo9ata3a)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Catalogue des Démarches Administratives
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
          Consultez la liste des documents délivrés par les services municipaux, les pièces justificatives exigées et les délais réglementaires de traitement.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher un certificat, une attestation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Catégorie:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-morocco-green-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Toutes les catégories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-sm">
          <div className="w-7 h-7 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
          Chargement du catalogue...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">Aucun service ne correspond à votre recherche</p>
          <p className="text-xs text-slate-400 mt-1">Essayez un autre mot-clé ou réinitialisez les filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((svc) => (
            <div
              key={svc._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {svc.category || 'État Civil'}
                  </span>
                  <span className="text-[11px] font-mono font-medium text-slate-400">
                    {svc.code}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {svc.name}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                  {svc.description}
                </p>

                {/* Required Documents Checklist */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Pièces Requises ({svc.requiredDocuments?.length || 0}) :
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {svc.requiredDocuments?.slice(0, 3).map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{doc.name}</span>
                      </li>
                    ))}
                    {(svc.requiredDocuments?.length || 0) > 3 && (
                      <li className="text-[11px] text-slate-400 pl-5">
                        + {(svc.requiredDocuments?.length || 0) - 3} autre(s) document(s)
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Délai : <strong>{svc.processingTimeDays || 2} jours</strong></span>
                </div>

                <Link
                  to={`/requests/new?serviceId=${svc._id}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-morocco-green-600 hover:bg-morocco-green-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                >
                  <span>Demander</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
