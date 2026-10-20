import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import NotificationDropdown from './NotificationDropdown';
import { 
  Building2, 
  FileText, 
  Layers, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Languages, 
  ShieldAlert, 
  LayoutDashboard,
  CheckCircle,
  PlusCircle
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated, isCitizen, isStaff, isAdmin } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Moroccan Header Bar */}
      <div className="bg-morocco-green-600 text-white text-[11px] py-1 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wider uppercase">المملكة المغربية • Royaume du Maroc</span>
          <span className="hidden md:inline text-emerald-200">|</span>
          <span className="hidden md:inline text-emerald-100 font-light">Services Administratifs Communaux Numérisés</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-morocco-green-700/80 hover:bg-morocco-green-800 transition-colors font-medium text-xs"
            title="Changer la langue / تغيير اللغة"
          >
            <Languages className="w-3.5 h-3.5 text-amber-300" />
            <span>{lang === 'fr' ? 'العربية' : 'Français'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-morocco-green-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Mo9ata3a<span className="text-morocco-green-600">Smart</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  MERN AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-1">
                المقاطعة الذكية
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* Public or Citizen Links */}
            <Link
              to="/services"
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive('/services')
                  ? 'text-morocco-green-600 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('services')}
            </Link>

            {isAuthenticated && isCitizen && (
              <>
                <Link
                  to="/citizen/dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/citizen/dashboard')
                      ? 'text-morocco-green-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('myRequests')}
                </Link>
                <Link
                  to="/requests/new"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  {t('newRequest')}
                </Link>
              </>
            )}

            {/* Staff / Admin Links */}
            {isAuthenticated && isStaff && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/admin/dashboard')
                      ? 'text-morocco-green-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t('dashboard')}
                </Link>
                <Link
                  to="/admin/requests"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/admin/requests')
                      ? 'text-morocco-green-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  {t('requestsManagement')}
                </Link>
                <Link
                  to="/admin/citizens"
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/admin/citizens')
                      ? 'text-morocco-green-600 bg-emerald-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {t('registry')}
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link
                    to={isCitizen ? '/citizen/profile' : '/admin/dashboard'}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-morocco-green-100 text-morocco-green-700 font-bold flex items-center justify-center text-xs">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1 leading-tight">
                        {user.fullName || user.email}
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize">
                        {user.role === 'admin' ? 'Administrateur' : user.role === 'manager' ? 'Agent Mo9ata3a' : 'Citoyen'}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title={t('logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-morocco-green-600 hover:bg-morocco-green-700 rounded-xl shadow-xs transition-all shadow-emerald-900/10"
                >
                  <span>{t('register')}</span>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            {t('services')}
          </Link>
          {isAuthenticated && isCitizen && (
            <>
              <Link
                to="/citizen/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {t('myRequests')}
              </Link>
              <Link
                to="/requests/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-emerald-700 hover:bg-emerald-50"
              >
                + {t('newRequest')}
              </Link>
              <Link
                to="/citizen/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {t('profile')}
              </Link>
            </>
          )}

          {isAuthenticated && isStaff && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {t('dashboard')}
              </Link>
              <Link
                to="/admin/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {t('requestsManagement')}
              </Link>
              <Link
                to="/admin/citizens"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {t('registry')}
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/admin/services"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Configuration Services
                  </Link>
                  <Link
                    to="/admin/staff"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {t('staffManagement')}
                  </Link>
                  <Link
                    to="/admin/audit"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {t('auditLogs')}
                  </Link>
                </>
              )}
            </>
          )}

          {isAuthenticated ? (
            <button
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-rose-600 hover:bg-rose-50"
            >
              {t('logout')}
            </button>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-morocco-green-600 rounded-xl"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
