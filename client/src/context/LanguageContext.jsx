import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  fr: {
    appName: "Mo9ata3a Smart",
    appSubtitle: "Plateforme Intelligente des Services Administratifs",
    kingdom: "Royaume du Maroc",
    commune: "Arrondissement Communal Urbain",
    login: "Connexion",
    register: "Inscription Citoyen (CIN)",
    logout: "Déconnexion",
    portal: "Espace Citoyen",
    adminWorkspace: "Espace Administratif",
    services: "Catalogue des Services",
    myRequests: "Mes Demandes",
    newRequest: "Nouvelle Demande",
    registry: "Registre des Citoyens",
    dashboard: "Tableau de Bord",
    requestsManagement: "Gestion des Dossiers",
    staffManagement: "Gestion des Agents",
    auditLogs: "Journaux d'Audit",
    profile: "Mon Profil CIN",
    notifications: "Notifications",
    status_Draft: "Brouillon",
    status_Submitted: "Soumise",
    status_UnderReview: "En cours d'examen",
    status_ActionRequired: "Action requise",
    status_Approved: "Approuvée",
    status_ReadyForCollection: "Prête pour retrait",
    status_Issued: "Délivrée",
    status_Rejected: "Rejetée",
    status_Cancelled: "Annulée",
    collectionCode: "Code de Retrait",
    reference: "Référence",
    date: "Date",
    actions: "Actions",
    search: "Rechercher...",
    filter: "Filtrer",
    back: "Retour",
    saveDraft: "Enregistrer brouillon",
    submit: "Soumettre la demande",
    cancel: "Annuler"
  },
  ar: {
    appName: "المقاطعة الذكية",
    appSubtitle: "المنصة الرقمية الذكية للخدمات الإدارية الجماعية",
    kingdom: "المملكة المغربية",
    commune: "الملحقة الإدارية الحضرية",
    login: "تسجيل الدخول",
    register: "تسجيل المواطن (بالبطاقة الوطنية)",
    logout: "تسجيل الخروج",
    portal: "فضاء المواطن",
    adminWorkspace: "فضاء الإدارة",
    services: "دليل الخدمات الإدارية",
    myRequests: "طلباتي الإدارية",
    newRequest: "طلب جديد",
    registry: "سجل المواطنين",
    dashboard: "لوحة القيادة",
    requestsManagement: "معالجة الملفات",
    staffManagement: "إدارة الموظفين",
    auditLogs: "سجل العمليات",
    profile: "ملفي الشخصي",
    notifications: "الإشعارات",
    status_Draft: "مسودة",
    status_Submitted: "تم الإيداع",
    status_UnderReview: "قيد المراجعة",
    status_ActionRequired: "مطلوب إجراء",
    status_Approved: "تمت الموافقة",
    status_ReadyForCollection: "جاهزة للتسليم",
    status_Issued: "مسلّمة للمواطن",
    status_Rejected: "مرفوضة",
    status_Cancelled: "ملغاة",
    collectionCode: "رمز الاستلام",
    reference: "رقم الملف",
    date: "التاريخ",
    actions: "إجراءات",
    search: "بحث...",
    filter: "تصفية",
    back: "رجوع",
    saveDraft: "حفظ كمسودة",
    submit: "إرسال الطلب",
    cancel: "إلغاء"
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('mo9ata3a_lang') || 'fr');

  useEffect(() => {
    localStorage.setItem('mo9ata3a_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'fr' ? 'ar' : 'fr'));
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['fr']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t, isRTL: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
