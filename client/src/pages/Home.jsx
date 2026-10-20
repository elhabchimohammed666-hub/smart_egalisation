import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  Scan, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Users,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const { user, login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [trackRef, setTrackRef] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackRef.trim()) {
      navigate(`/login?redirect=${encodeURIComponent('/citizen/dashboard')}&ref=${encodeURIComponent(trackRef.trim())}`);
    }
  };

  const handleDemoLogin = async (role) => {
    if (role === 'admin') {
      await login('admin@mo9ata3a.ma', 'adminPassword123!');
      navigate('/admin/dashboard');
    } else if (role === 'manager') {
      await login('manager@mo9ata3a.ma', 'managerPassword123!');
      navigate('/admin/requests');
    } else if (role === 'citizen') {
      await login('citizen@mo9ata3a.ma', 'citizenPassword123!');
      navigate('/citizen/dashboard');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-morocco-green-700 to-morocco-green-800 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold border border-white/15">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>IA & Reconnaissance Optique OCR • MERN Stack Edition</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Mo9ata3a Smart <br />
            <span className="text-amber-300">L'Administration Communale Intelligente</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-emerald-100 font-light leading-relaxed">
            Simplifiez vos démarches administratives locales. Inscrivez-vous instantanément grâce à l'analyse IA de votre Carte d'Identité Nationale (CIN), soumettez vos pièces justificatives et suivez l'avancement de vos demandes sans déplacement inutile.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Scan className="w-5 h-5" />
              <span>Créer mon Compte Citoyen (CIN)</span>
            </Link>

            <Link
              to="/services"
              className="flex items-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl backdrop-blur-md border border-white/20 transition-all"
            >
              <FileText className="w-5 h-5 text-emerald-200" />
              <span>Consulter le Catalogue des Services</span>
            </Link>
          </div>

          {/* Tracking Search Bar */}
          <div className="max-w-md mx-auto pt-4">
            <form onSubmit={handleTrackSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Ex: REQ-2026-0001-4921 (Suivre un dossier)"
                value={trackRef}
                onChange={(e) => setTrackRef(e.target.value)}
                className="w-full pl-11 pr-24 py-3 bg-white/95 text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-amber-400/50 shadow-md"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-2 bg-morocco-green-600 hover:bg-morocco-green-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Suivre
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Demo Credentials Quick-Launch Bar (Essential for evaluation & smooth testing!) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200/80">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-morocco-green-600">
                Mode Démonstration & Évaluation
              </span>
              <h2 className="text-lg font-bold text-slate-800">
                Connexion Rapide 1-Clic aux Profils Pré-configurés
              </h2>
              <p className="text-xs text-slate-500">
                Testez instantanément les flux de travail complets définis dans le guide PDF.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleDemoLogin('citizen')}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold transition-colors"
              >
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Citoyen (Yassine - BK789456)</span>
              </button>

              <button
                onClick={() => handleDemoLogin('manager')}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl border border-blue-200 text-xs font-semibold transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Agent Mo9ata3a (Manager)</span>
              </button>

              <button
                onClick={() => handleDemoLogin('admin')}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl border border-purple-200 text-xs font-semibold transition-colors"
              >
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>Administrateur Système</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Un Parcours Administratif Fluide & 100% Traçable
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-slate-500">
            Conçu pour répondre aux exigences réelles de numérisation des services communaux marocains.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">1. Enrôlement IA & CIN</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extraction optique automatique (OCR Node.js) des deux faces de la CIN marocaine. Contrôle de netteté, détection des flous et prévention absolue des doublons.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Décision automatique Accept / Reject</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Capture caméra ou téléversement</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">2. Dépôt & Documents</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sélection du service parmi le catalogue administratif (certificats de résidence, attestations, légalisations). Téléversement sécurisé des pièces requises et sauvegarde en brouillon.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Numéro de référence unique</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Réponse aux demandes de pièces</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">3. Instruction & Retrait</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Traitement par les agents de la Mo9ata3a selon une machine à états stricte. Notification du citoyen dès que le document officiel est prêt au guichet avec code de retrait.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Chronologie et notes d'audit</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Code sécurisé de remise au guichet</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Services Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Services Administratifs Fréquemment Demandés
            </h2>
            <p className="text-xs text-slate-500">
              Démarches disponibles auprès de votre bureau communal
            </p>
          </div>
          <Link
            to="/services"
            className="flex items-center gap-1 text-xs font-semibold text-morocco-green-600 hover:text-morocco-green-700"
          >
            <span>Voir tout le catalogue</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Certificat de Résidence",
              desc: "Justificatif de domicile pour démarches officielles",
              time: "2 jours",
              badge: "État Civil"
            },
            {
              title: "Attestation de Célibat",
              desc: "Nécessaire pour les actes de mariage et notariat",
              time: "3 jours",
              badge: "Famille"
            },
            {
              title: "Légalisation de Signature",
              desc: "Certification conforme et conformité d'actes sous seing privé",
              time: "24 heures",
              badge: "Actes"
            },
            {
              title: "Attestation Sociale",
              desc: "Pour bourses d'études et aides sociales",
              time: "4 jours",
              badge: "Social"
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {item.badge}
              </span>
              <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  Délai : {item.time}
                </span>
                <Link to="/register" className="text-emerald-700 font-semibold hover:underline">
                  Demander &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
