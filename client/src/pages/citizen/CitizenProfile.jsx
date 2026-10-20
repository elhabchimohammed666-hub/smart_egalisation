import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import { 
  ShieldCheck, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  Save, 
  Lock,
  Eye,
  FileText
} from 'lucide-react';

export default function CitizenProfile() {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Editable fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/citizens/profile');
      if (res.data?.data) {
        setProfile(res.data.data);
        setPhone(res.data.data.phone || user?.phone || '');
        setAddress(res.data.data.address || '');
      }
    } catch (err) {
      setError('Impossible de charger le dossier citoyen.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.put('/citizens/profile/contact', { phone, address });
      setMessage(res.data?.message || 'Coordonnées de contact mises à jour avec succès.');
      if (res.data?.data) {
        setProfile(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Chargement du profil certifié...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Fiche d'Identité Citoyenne Certifiée</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Mon Profil & Carte d'Identité (CIN)
        </h1>
        <p className="text-xs text-slate-500">
          Les données d'état civil ci-dessous proviennent de l'extraction optique officielle de votre CIN.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Verified Moroccan CIN Identity Card Display */}
      <div className="bg-gradient-to-br from-emerald-900 via-morocco-green-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-600/30">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 font-bold border border-white/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">
                ROYAUME DU MAROC • CARTE NATIONALE D'IDENTITÉ
              </p>
              <h2 className="text-xl font-bold tracking-tight">
                {profile?.firstName} {profile?.lastName}
                {profile?.arabicFullName && (
                  <span className="text-sm font-normal text-emerald-200 ml-3" dir="rtl">
                    {profile.arabicFullName}
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider block">
              Numéro CIN
            </span>
            <span className="text-2xl font-black font-mono tracking-wider text-amber-300">
              {profile?.cin}
            </span>
          </div>
        </div>

        {/* Protected Identity Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 text-xs">
          <div>
            <span className="text-emerald-300 block mb-1">Date de Naissance</span>
            <span className="font-semibold text-sm">{profile?.dateOfBirth}</span>
          </div>
          <div>
            <span className="text-emerald-300 block mb-1">Lieu de Naissance</span>
            <span className="font-semibold text-sm">{profile?.placeOfBirth || 'Maroc'}</span>
          </div>
          <div>
            <span className="text-emerald-300 block mb-1">Sexe / Nationalité</span>
            <span className="font-semibold text-sm">{profile?.gender === 'M' ? 'Masculin' : 'Féminin'} • {profile?.nationality || 'Marocaine'}</span>
          </div>
          <div>
            <span className="text-emerald-300 block mb-1">Valable jusqu'au</span>
            <span className="font-semibold text-sm text-amber-200">{profile?.validUntil}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-200">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span>Données d'identité protégées et certifiées par OCR (Inaltérables sans procédure de réenrôlement).</span>
          </div>
          <span className="hidden sm:inline bg-white/10 px-2 py-0.5 rounded-full font-mono text-[10px]">
            Statut : Validé
          </span>
        </div>
      </div>

      {/* Editable Contact Info Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-1 pb-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-base">
            Coordonnées de Contact & Résidence
          </h2>
          <p className="text-xs text-slate-500">
            Vous êtes autorisé à mettre à jour votre numéro de téléphone et votre adresse de résidence actuelle.
          </p>
        </div>

        <form onSubmit={handleSaveContact} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro de Téléphone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse Email (Liée au compte)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adresse de Résidence Actuelle
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="N°, Rue, Quartier, Ville..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-morocco-green-600 hover:bg-morocco-green-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer les Modifications'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
