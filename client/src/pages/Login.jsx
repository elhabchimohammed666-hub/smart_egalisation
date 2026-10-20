import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Building2, Mail, Lock, LogIn, AlertCircle, CheckCircle2, Shield, User } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      if (redirect) {
        navigate(redirect);
      } else if (data.user?.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'citizen') {
      setEmail('citizen@mo9ata3a.ma');
      setPassword('citizenPassword123!');
    } else if (role === 'manager') {
      setEmail('manager@mo9ata3a.ma');
      setPassword('managerPassword123!');
    } else if (role === 'admin') {
      setEmail('admin@mo9ata3a.ma');
      setPassword('adminPassword123!');
    }
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-morocco-green-600 text-white flex items-center justify-center mx-auto shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Accès Sécurisé • Mo9ata3a Smart
          </h2>
          <p className="text-xs text-slate-500">
            Connectez-vous à votre espace citoyen ou administratif
          </p>
        </div>

        {/* Demo Credentials Helper Pill */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
            <span>Comptes de Démonstration (1 Clic) :</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('citizen')}
              className="py-1.5 px-2 bg-white hover:bg-emerald-100 text-emerald-800 rounded-xl text-[11px] font-medium border border-emerald-200 shadow-2xs transition-colors"
            >
              Citoyen
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('manager')}
              className="py-1.5 px-2 bg-white hover:bg-emerald-100 text-blue-800 rounded-xl text-[11px] font-medium border border-blue-200 shadow-2xs transition-colors"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('admin')}
              className="py-1.5 px-2 bg-white hover:bg-emerald-100 text-purple-800 rounded-xl text-[11px] font-medium border border-purple-200 shadow-2xs transition-colors"
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.ma"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-morocco-green-600 hover:bg-morocco-green-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm shadow-sm transition-all mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Se Connecter</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>
            Vous n'avez pas encore de compte citoyen ?
          </p>
          <Link
            to="/register"
            className="font-semibold text-morocco-green-600 hover:text-morocco-green-700 hover:underline"
          >
            Créer un compte avec votre Carte d'Identité Nationale &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
