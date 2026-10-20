import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Eye, 
  ArrowRight,
  X,
  FileText
} from 'lucide-react';

export default function CitizenRegistry() {
  const { t } = useLanguage();
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Detail drawer / modal
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [citizenDetails, setCitizenDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Document preview
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    fetchCitizens();
  }, [search, page]);

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      const res = await api.get('/citizens/registry', {
        params: { search, page, limit: 15 }
      });
      if (res.data?.data) {
        setCitizens(res.data.data);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (citizen) => {
    setSelectedCitizen(citizen);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/citizens/registry/${citizen._id}`);
      if (res.data?.data) {
        setCitizenDetails(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Registre Centralisé des Citoyens Enrôlés
        </h1>
        <p className="text-xs text-slate-500">
          Base de données des identités certifiées par reconnaissance optique CIN marocaine.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par CIN (ex: BK789456), Nom, Prénom, Téléphone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Citizens Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
            Consultation du registre citoyen...
          </div>
        ) : citizens.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-700 text-sm">Aucun citoyen trouvé</p>
            <p className="text-xs">Aucun dossier ne correspond au terme recherché.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">CIN Certifiée</th>
                  <th className="py-3.5 px-4">Nom et Prénom</th>
                  <th className="py-3.5 px-4">Date de Naissance</th>
                  <th className="py-3.5 px-4">Adresse de Résidence</th>
                  <th className="py-3.5 px-4">Date d'Enrôlement</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {citizens.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        {c.cin}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{c.firstName} {c.lastName}</p>
                        {c.arabicFullName && (
                          <p className="text-slate-400 text-[11px]" dir="rtl">{c.arabicFullName}</p>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {c.dateOfBirth} ({c.placeOfBirth || 'Maroc'})
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {c.address}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('fr-FR')}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl font-semibold border border-slate-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Fiche</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Citizen Details Drawer Modal */}
      {selectedCitizen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Fiche Citoyen Certifiée • {selectedCitizen.cin}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Enrôlé le {new Date(selectedCitizen.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setSelectedCitizen(null); setCitizenDetails(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CIN Identity card view */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block mb-0.5">Nom et Prénom :</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedCitizen.firstName} {selectedCitizen.lastName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Nom Arabe :</span>
                  <p className="font-medium text-slate-800 text-sm" dir="rtl">
                    {selectedCitizen.arabicFullName || 'Non spécifié'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Date & Lieu de Naissance :</span>
                  <p className="font-medium text-slate-800">
                    {selectedCitizen.dateOfBirth} ({selectedCitizen.placeOfBirth || 'Maroc'})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Validité CIN :</span>
                  <p className="font-medium text-slate-800">{selectedCitizen.validUntil}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center gap-4">
                {selectedCitizen.cinFrontImage && (
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({ documentName: 'CIN Recto', filePath: selectedCitizen.cinFrontImage })}
                    className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Voir Photo CIN Recto
                  </button>
                )}
                {selectedCitizen.cinBackImage && (
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({ documentName: 'CIN Verso', filePath: selectedCitizen.cinBackImage })}
                    className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Voir Photo CIN Verso
                  </button>
                )}
              </div>
            </div>

            {/* Associated Demarches */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Historique des Démarches Administratives du Citoyen
              </h4>

              {loadingDetails ? (
                <p className="text-xs text-slate-400">Chargement de l'historique...</p>
              ) : citizenDetails?.requests?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Aucune démarche enregistrée pour ce citoyen.</p>
              ) : (
                <div className="space-y-2">
                  {citizenDetails?.requests?.map(r => (
                    <div
                      key={r._id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-900">{r.reference}</span>
                        <p className="text-slate-600 font-medium">{r.service?.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={r.status} size="xs" />
                        <Link
                          to={`/admin/requests/${r._id}`}
                          className="text-emerald-700 font-semibold hover:underline text-[11px]"
                        >
                          Examiner &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {previewDoc && (
        <DocumentViewerModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}
