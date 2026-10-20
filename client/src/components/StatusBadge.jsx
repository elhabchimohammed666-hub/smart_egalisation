import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileEdit, 
  Send, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  PackageCheck, 
  Award, 
  XCircle, 
  Ban 
} from 'lucide-react';

const STATUS_CONFIG = {
  Draft: {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: FileEdit,
    labelKey: 'status_Draft'
  },
  Submitted: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Send,
    labelKey: 'status_Submitted'
  },
  'Under Review': {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Search,
    labelKey: 'status_UnderReview'
  },
  'Action Required': {
    bg: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse',
    icon: AlertCircle,
    labelKey: 'status_ActionRequired'
  },
  Approved: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
    labelKey: 'status_Approved'
  },
  'Ready for Collection': {
    bg: 'bg-teal-50 text-teal-800 border-teal-300 ring-2 ring-teal-400/20',
    icon: PackageCheck,
    labelKey: 'status_ReadyForCollection'
  },
  Issued: {
    bg: 'bg-green-100 text-green-900 border-green-300 font-semibold',
    icon: Award,
    labelKey: 'status_Issued'
  },
  Rejected: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
    labelKey: 'status_Rejected'
  },
  Cancelled: {
    bg: 'bg-gray-100 text-gray-500 border-gray-300 line-through',
    icon: Ban,
    labelKey: 'status_Cancelled'
  }
};

export default function StatusBadge({ status, size = 'sm' }) {
  const { t } = useLanguage();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-xs px-2 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2'
  }[size];

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${sizeClasses}`}>
      <Icon className={size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{t(config.labelKey)}</span>
    </span>
  );
}
