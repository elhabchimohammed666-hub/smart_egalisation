import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  FileCheck2, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  X, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('État Civil & Citoyenneté');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [processingTimeDays, setProcessingTimeDays] = useState(2);
  const [requiredDocs, setRequiredDocs] = useState([]);
  const [newDocName, setNewDocName] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services');
      if (res.data?.data) setServices(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingService(null);
    setName('');
    setCode('');
    setCategory('État Civil & Citoyenneté');
    setDescription('');
    setInstructions('Veuillez préparer les pièces requises au format PDF ou image.');
    setProcessingTimeDays(2);
    setRequiredDocs([
      { name: 'Copie de la CIN valide', isRequired: true }
    ]);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setName(svc.name);
    setCode(svc.code);
    setCategory(svc.category || 'État Civil & Citoyenneté');
    setDescription(svc.description);
    setInstructions(svc.instructions || '');
    setProcessingTimeDays(svc.processingTimeDays || 2);
    setRequiredDocs(svc.requiredDocuments || []);
    setError(null);
    setModalOpen(true);
  };

  const handleAddDoc = () => {
    if (newDocName.trim()) {
      setRequiredDocs(prev => [...prev, { name: newDocName.trim(), isRequired: true }]);
      setNewDocName('');
    }
  };

  const handleRemoveDoc = (index) => {
    setRequiredDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        name,
        code,
        category,
        description,
        instructions,
        processingTimeDays: Number(processingTimeDays),
        requiredDocuments: requiredDocs
      };

      if (editingService) {
        await api.put(`/services/${editingService._id}`, payload);
      } else {
        await api.post('/services', payload);
      }

      setModalOpen(false);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'enregistrement du service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (svc) => {
    try {
      await api.put(`/services/${svc._id}`, { isAvailable: !svc.isAvailable });
      setServices(prev => prev.map(s => s._id === svc._id ? { ...s, isAvailable: !s.isAvailable } : s));
    } catch (err) {
      alert('Erreur lors du changement de disponibilité.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Configuration du Catalogue des Services
          </h1>
          <p className="text-xs text-slate-500">
            Personnalisez les démarches administratives ouvertes aux citoyens, pièces exigées et délais.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-morocco-green-600 hover:bg-morocco-green-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Démarche</span>
        </button>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-2" />
            Chargement des services...
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Aucun service configuré pour le moment.
          </div>
        ) : (
          services.map(svc => (
            <div
              key={svc._id}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
                svc.isAvailable ? 'border-slate-200 shadow-2xs' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                    {svc.category || 'État Civil'}
                  </span>
                  <button
                    onClick={() => handleToggleAvailability(svc)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                      svc.isAvailable
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {svc.isAvailable ? '● Actif' : '○ Suspendu'}
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{svc.name}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{svc.description}</p>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                    Pièces Requises ({svc.requiredDocuments?.length || 0}) :
                  </span>
                  <ul className="space-y-0.5 text-[11px] text-slate-500">
                    {svc.requiredDocuments?.slice(0, 2).map((d, i) => (
                      <li key={i} className="truncate">• {d.name}</li>
                    ))}
                    {(svc.requiredDocuments?.length || 0) > 2 && (
                      <li className="text-slate-400">+ {(svc.requiredDocuments?.length || 0) - 2} autre(s)</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  {svc.processingTimeDays} jours
                </span>

                <button
                  onClick={() => handleOpenEdit(svc)}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Modifier</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingService ? 'Modifier la Démarche Administrative' : 'Nouvelle Démarche au Catalogue'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Intitulé du Service *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Certificat de Célibat"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Code Technique</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="CERT_CELIBAT"
                    className="w-full px-3 py-2 font-mono rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Délai estimé (Jours)</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={processingTimeDays}
                    onChange={(e) => setProcessingTimeDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catégorie</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="État Civil, Affaires Sociales, Notariat..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explication du service et destinataires..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Required Documents Editor */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Pièces Justificatives Exigées
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="Ex: Facture Lydec récente..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="button"
                    onClick={handleAddDoc}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    Ajouter
                  </button>
                </div>

                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {requiredDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-xs">
                      <span>• {doc.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(idx)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-morocco-green-600 hover:bg-morocco-green-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Enregistrer la Démarche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
