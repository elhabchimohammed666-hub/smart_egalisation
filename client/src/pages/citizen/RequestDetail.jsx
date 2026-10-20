import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import TimelineView from '../../components/TimelineView';
import DocumentViewerModal from '../../components/DocumentViewerModal';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  FileText, 
  Upload, 
  AlertCircle, 
  PackageCheck, 
  CheckCircle2, 
  Download, 
  Eye, 
  QrCode,
  Send,
  Building,
  User,
  Ban
} from 'lucide-react';

export default function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Document modal viewer
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Resubmit missing documents state (when Action Required)
  const [missingDocFile, setMissingDocFile] = useState(null);
  const [missingDocNotes, setMissingDocNotes] = useState('');
  const [submittingMissing, setSubmittingMissing] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${id}`);
      if (res.data?.data) {
        setRequest(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la récupération du dossier.');
    } finally {
      setLoading(false);
    }
  };

  const handleMissingDocSubmit = async (e) => {
    e.preventDefault();
    if (!missingDocFile) return;

    setSubmittingMissing(true);
    try {
      const formData = new FormData();
      formData.append('documents', missingDocFile);
      formData.append('documentName', missingDocFile.name);
      formData.append('notes', missingDocNotes);

      await api.post(`/requests/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMissingDocFile(null);
      setMissingDocNotes('');
      fetchRequestDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'envoi du document.');
    } finally {
      setSubmittingMissing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Chargement du dossier administratif...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Dossier introuvable</h2>
        <p className="text-xs text-slate-500">{error || 'Cette demande n\'existe pas ou vous n\'y avez pas accès.'}</p>
        <Link
          to="/citizen/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-morocco-green-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au tableau de bord</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/citizen/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à mes demandes</span>
        </Link>

        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
          {request.reference}
        </span>
      </div>

      {/* Main Request Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                {request.service?.category || 'État Civil'}
              </span>
              <StatusBadge status={request.status} size="sm" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {request.service?.name}
            </h1>
            <p className="text-xs text-slate-400">
              Déposée le {new Date(request.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* If ready for collection, highlight token */}
          {request.status === 'Ready for Collection' && request.collectionToken && (
            <div className="bg-teal-50 border-2 border-teal-500/40 rounded-2xl p-4 text-center space-y-1 shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                Code de Retrait au Guichet :
              </span>
              <p className="text-2xl font-black font-mono tracking-wider text-teal-900">
                {request.collectionToken}
              </p>
              <p className="text-[10px] text-teal-700">
                À présenter avec votre CIN physique
              </p>
            </div>
          )}
        </div>

        {/* Action Required Alert Box */}
        {request.status === 'Action Required' && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-purple-900 text-sm">
                  Action Requise : Complément de dossier demandé par l'administration
                </h4>
                <p className="text-xs text-purple-800 leading-relaxed font-medium">
                  {request.actionRequiredReason || 'Veuillez téléverser les pièces justificatives manquantes.'}
                </p>
              </div>
            </div>

            {/* Upload form for missing doc */}
            <form onSubmit={handleMissingDocSubmit} className="bg-white rounded-xl p-4 border border-purple-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Téléverser la pièce demandée :
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  required
                  accept=".pdf,image/*"
                  onChange={(e) => setMissingDocFile(e.target.files[0])}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-800 hover:file:bg-purple-200 cursor-pointer"
                />
                <button
                  type="submit"
                  disabled={submittingMissing || !missingDocFile}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors"
                >
                  {submittingMissing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Transmettre la pièce</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ready for Collection Banner */}
        {request.status === 'Ready for Collection' && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <PackageCheck className="w-6 h-6 text-teal-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-teal-900 text-sm">
                  Votre document officiel est prêt pour retrait !
                </h4>
                <p className="text-xs text-teal-800 leading-relaxed">
                  Présentez-vous au guichet d'accueil de la Mo9ata3a muni de votre <strong>Carte d'Identité Nationale originale</strong> et du code de retrait ci-dessus (<strong>{request.collectionToken}</strong>).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Issued Banner */}
        {request.status === 'Issued' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-green-900 text-sm">
                Document délivré avec succès
              </h4>
              <p className="text-xs text-green-800">
                La remise de ce document officiel a été effectuée au guichet le {new Date(request.completionDate || request.updatedAt).toLocaleDateString('fr-FR')}.
              </p>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Left Column: Documents */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Pièces Jointes au Dossier ({request.documents?.length || 0})</span>
            </h3>

            {request.documents?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Aucun document joint.</p>
            ) : (
              <div className="space-y-2">
                {request.documents?.map((doc, idx) => (
                  <div
                    key={doc._id || idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 truncate">
                          {doc.documentName || doc.originalName}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')} • {doc.status === 'replaced' ? 'Complément' : 'Initial'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(doc)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Aperçu"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={doc.filePath}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Public Timeline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Chronologie Administrative du Dossier</span>
            </h3>

            <TimelineView history={request.statusHistory} isStaff={false} />
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <DocumentViewerModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}
