import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import { 
  Building2, 
  FileText, 
  Upload, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  Send, 
  ArrowLeft,
  X,
  FileCheck
} from 'lucide-react';

export default function RequestNew() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedServiceId = searchParams.get('serviceId');

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(preSelectedServiceId || '');
  const [selectedService, setSelectedService] = useState(null);

  // Form inputs
  const [notes, setNotes] = useState('');
  const [applicantAddress, setApplicantAddress] = useState(user?.citizenProfile?.address || '');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedServiceId && services.length > 0) {
      const found = services.find(s => s._id === selectedServiceId);
      setSelectedService(found || null);
    }
  }, [selectedServiceId, services]);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      if (res.data?.data) {
        setServices(res.data.data);
        if (preSelectedServiceId) {
          const match = res.data.data.find(s => s._id === preSelectedServiceId);
          if (match) setSelectedService(match);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft = false) => {
    if (!selectedServiceId) {
      setError('Veuillez sélectionner un service administratif.');
      return;
    }

    if (!isDraft && files.length === 0 && selectedService?.requiredDocuments?.length > 0) {
      setError('Veuillez joindre au moins une pièce justificative requise avant de soumettre.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('serviceId', selectedServiceId);
      formData.append('isDraft', isDraft ? 'true' : 'false');
      formData.append('formData', JSON.stringify({
        applicantAddress,
        applicantNotes: notes,
        citizenCIN: user?.citizenProfile?.cin || ''
      }));

      files.forEach(file => {
        formData.append('documents', file);
      });

      const res = await api.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.data?._id) {
        navigate(`/requests/${res.data.data._id}`);
      } else {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la demande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/citizen/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à mes demandes</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Nouvelle Demande Administrative
        </h1>
        <p className="text-xs text-slate-500">
          Complétez le formulaire ci-dessous et téléversez vos justificatifs.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Step 1: Select Service */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            1. Choix de la Démarche Administrative *
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
          >
            <option value="">-- Sélectionnez une démarche --</option>
            {services.map(svc => (
              <option key={svc._id} value={svc._id}>
                {svc.name} ({svc.category || 'État Civil'}) - Délai: {svc.processingTimeDays || 2} jours
              </option>
            ))}
          </select>
        </div>

        {/* Service Details Card */}
        {selectedService && (
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedService.name}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedService.description}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-100/80 px-2.5 py-1 rounded-lg shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedService.processingTimeDays || 2} jours</span>
              </div>
            </div>

            {selectedService.requiredDocuments?.length > 0 && (
              <div className="pt-2 border-t border-emerald-100 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                  Pièces Justificatives Exigées :
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {selectedService.requiredDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>{doc.name}</strong> {doc.description && <span className="text-slate-500">({doc.description})</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Information */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
            2. Informations du Demandeur
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse actuelle (pour la démarche)
              </label>
              <input
                type="text"
                value={applicantAddress}
                onChange={(e) => setApplicantAddress(e.target.value)}
                placeholder="Votre adresse actuelle..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Remarques ou Précisions (Facultatif)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Précisions éventuelles..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Supporting Documents */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Téléversement des Pièces Justificatives
            </label>
            <span className="text-xs text-slate-400">PDF, JPG, PNG (Max 10Mo)</span>
          </div>

          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-400 transition-all text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-morocco-green-600 hover:bg-morocco-green-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                <span>Choisir les fichiers</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-2">
                Vous pouvez sélectionner plusieurs documents en une seule fois.
              </p>
            </div>
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 block">
                Fichiers prêts à être envoyés ({files.length}) :
              </span>
              <div className="space-y-1.5">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        ({Math.round(file.size / 1024)} Ko)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Save Draft vs Submit Request */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Sauvegarder comme Brouillon</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-morocco-green-600 hover:bg-morocco-green-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Soumettre Définitivement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
