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
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  PackageCheck, 
  Award, 
  Eye, 
  Download, 
  User, 
  ShieldCheck, 
  Lock,
  MessageSquare,
  HelpCircle,
  Check,
  Send,
  Building
} from 'lucide-react';

export default function RequestReview() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Document preview modal
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Workflow transition action modal
  const [activeModal, setActiveModal] = useState(null); // 'action_required', 'approve', 'reject', 'ready_collection', 'confirm_issued'
  const [modalNotes, setModalNotes] = useState('');
  const [internalStaffNote, setInternalStaffNote] = useState('');
  const [collectionTokenInput, setCollectionTokenInput] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/requests/${id}`);
      if (res.data?.data) {
        setRequest(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du dossier.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusTransition = async (newStatus, extraPayload = {}) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/requests/${id}/status`, {
        newStatus,
        notes: modalNotes,
        internalStaffNote,
        ...extraPayload
      });
      setRequest(res.data?.data);
      setActiveModal(null);
      setModalNotes('');
      setInternalStaffNote('');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du changement de statut.');
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmHandover = async () => {
    setUpdating(true);
    try {
      const res = await api.post(`/requests/${id}/confirm-collection`, {
        collectionToken: collectionTokenInput || request.collectionToken,
        staffNotes: internalStaffNote
      });
      setRequest(res.data?.data);
      setActiveModal(null);
      setCollectionTokenInput('');
      setInternalStaffNote('');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la confirmation.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Ouverture du dossier administratif...</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Dossier introuvable</h2>
        <Link to="/admin/requests" className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des dossiers</span>
        </Link>
      </div>
    );
  }

  const citizen = request.citizen || {};
  const profile = citizen.citizenProfile || {};

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à la gestion des demandes</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {request.reference}
            </h1>
            <StatusBadge status={request.status} size="sm" />
          </div>
        </div>

        {/* Workflow Action Buttons (Strict State Machine) */}
        <div className="flex flex-wrap items-center gap-2">
          {request.status === 'Submitted' && (
            <button
              onClick={() => handleStatusTransition('Under Review')}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Démarrer l'Examen (Under Review)</span>
            </button>
          )}

          {request.status === 'Under Review' && (
            <>
              <button
                onClick={() => setActiveModal('action_required')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Demander Complément (Action Required)</span>
              </button>

              <button
                onClick={() => setActiveModal('reject')}
                className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Rejeter</span>
              </button>

              <button
                onClick={() => setActiveModal('approve')}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approuver le Dossier (Approved)</span>
              </button>
            </>
          )}

          {request.status === 'Action Required' && (
            <div className="flex items-center gap-2 text-xs text-purple-800 bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-xl">
              <Clock className="w-4 h-4 text-purple-600" />
              <span>En attente de la pièce complémentaire du citoyen</span>
            </div>
          )}

          {request.status === 'Approved' && (
            <button
              onClick={() => setActiveModal('ready_collection')}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Marquer Prêt pour Retrait au Guichet</span>
            </button>
          )}

          {request.status === 'Ready for Collection' && (
            <button
              onClick={() => setActiveModal('confirm_issued')}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Valider la Remise Physique (Issued)</span>
            </button>
          )}

          {request.status === 'Issued' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-900 border border-green-300 rounded-xl text-xs font-bold">
              <Check className="w-4 h-4" />
              <span>Dossier Complété & Délivré au Citoyen</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Request & Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-700" />
              <span>Objet de la Demande Administrative</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Intitulé du Service :</span>
                <p className="font-bold text-slate-900 text-sm">{request.service?.name}</p>
                <span className="text-slate-400 font-mono text-[10px]">{request.service?.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Délai Réglementaire :</span>
                <p className="font-bold text-slate-900 text-sm">{request.service?.processingTimeDays || 2} jours ouvrés</p>
              </div>
            </div>

            {request.formData && Object.keys(request.formData).length > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Informations complémentaires saisies :</span>
                <pre className="text-[11px] text-slate-600 font-sans whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(request.formData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Submitted Documents Inspection */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>Pièces Justificatives Soumises ({request.documents?.length || 0})</span>
              </h2>
            </div>

            {request.documents?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">Aucun document joint par le demandeur.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {request.documents.map((doc, idx) => (
                  <div
                    key={doc._id || idx}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {doc.documentName || doc.originalName}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')} • {doc.status === 'replaced' ? 'Complément' : 'Initial'}
                        </span>
                        {doc.notes && (
                          <p className="text-[11px] text-purple-700 italic mt-1 line-clamp-2">
                            "{doc.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => setSelectedDoc(doc)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Aperçu</span>
                      </button>
                      <a
                        href={doc.filePath}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Télécharger</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History Timeline with Internal Staff Notes */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Historique Complet des Transitions & Décisions</span>
            </h2>

            <TimelineView history={request.statusHistory} isStaff={true} />
          </div>
        </div>

        {/* Right Column (1 col): Citizen Identity & Profile */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Dossier Citoyen Associé</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-0.5">
                  CIN Validée par OCR
                </span>
                <p className="text-xl font-black font-mono text-emerald-950">
                  {profile.cin || 'Non renseigné'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Nom et Prénom :</span>
                <p className="font-bold text-slate-900 text-sm">
                  {citizen.fullName || `${profile.firstName} ${profile.lastName}`}
                </p>
                {profile.arabicFullName && (
                  <p className="text-slate-600 text-xs mt-0.5" dir="rtl">{profile.arabicFullName}</p>
                )}
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Date et Lieu de Naissance :</span>
                <p className="font-medium text-slate-800">
                  {profile.dateOfBirth} ({profile.placeOfBirth || 'Maroc'})
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Adresse Certifiée :</span>
                <p className="font-medium text-slate-800">{profile.address || 'Non renseignée'}</p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Téléphone & Email :</span>
                <p className="font-medium text-slate-800">{citizen.phone || profile.phone || 'Non renseigné'}</p>
                <p className="text-slate-500">{citizen.email}</p>
              </div>

              {/* CIN Photos link */}
              {(profile.cinFrontImage || profile.cinBackImage) && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  {profile.cinFrontImage && (
                    <button
                      type="button"
                      onClick={() => setSelectedDoc({ documentName: 'CIN Recto', filePath: profile.cinFrontImage })}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      CIN Recto
                    </button>
                  )}
                  {profile.cinBackImage && (
                    <button
                      type="button"
                      onClick={() => setSelectedDoc({ documentName: 'CIN Verso', filePath: profile.cinBackImage })}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1 ml-2"
                    >
                      <Eye className="w-3 h-3" />
                      CIN Verso
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Required Modal */}
      {activeModal === 'action_required' && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-600" />
              <span>Demander un Complément au Citoyen (Action Required)</span>
            </h3>

            <p className="text-xs text-slate-500">
              Précisez la pièce manquante ou la non-conformité constatée. Le citoyen recevra immédiatement une notification et pourra téléverser la pièce demandée.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motif / Pièce demandée (Visible par le citoyen) *
              </label>
              <textarea
                required
                rows={3}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Ex: La quittance fournie date de plus de 3 mois. Veuillez fournir une facture récente du mois en cours."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note Interne (Visible uniquement par les agents)
              </label>
              <input
                type="text"
                value={internalStaffNote}
                onChange={(e) => setInternalStaffNote(e.target.value)}
                placeholder="Ex: Quittance Lydec périmée. Instruction en attente."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={updating || !modalNotes.trim()}
                onClick={() => handleStatusTransition('Action Required', { actionRequiredReason: modalNotes })}
                className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Envoyer la Demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {activeModal === 'approve' && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Approuver le Dossier Administratif</span>
            </h3>

            <p className="text-xs text-slate-500">
              Toutes les pièces requises sont conformes. La demande passera au statut <strong>Approved</strong> pour édition du document officiel.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observations (Visible par le citoyen)
              </label>
              <input
                type="text"
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Ex: Dossier complet et conforme. Document en cours d'édition."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Note Interne Staff (Optionnelle)
              </label>
              <input
                type="text"
                value={internalStaffNote}
                onChange={(e) => setInternalStaffNote(e.target.value)}
                placeholder="Ex: Validé par l'officier d'état civil."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusTransition('Approved')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Confirmer l'Approbation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {activeModal === 'reject' && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>Rejeter la Demande</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motif réglementaire du rejet (Visible par le citoyen) *
              </label>
              <textarea
                required
                rows={3}
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Ex: Le demandeur ne réside pas dans le ressort territorial de cet arrondissement."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={updating || !modalNotes.trim()}
                onClick={() => handleStatusTransition('Rejected', { rejectionReason: modalNotes })}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Confirmer le Rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ready for Collection Modal */}
      {activeModal === 'ready_collection' && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-teal-600" />
              <span>Marquer Prêt pour Retrait au Guichet</span>
            </h3>

            <p className="text-xs text-slate-500">
              Le document signé et tamponné est disponible à l'accueil. Un <strong>Code Unique de Retrait</strong> sera automatiquement généré et transmis au citoyen par notification.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Consignes pour le citoyen (Guichet, horaires...)
              </label>
              <input
                type="text"
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="Ex: Document disponible au Guichet 2 entre 9h et 16h."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => handleStatusTransition('Ready for Collection')}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Générer le Code & Notifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Physical Handover Modal (Issued) */}
      {activeModal === 'confirm_issued' && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-700" />
              <span>Confirmation de Remise Physique au Citoyen (Issued)</span>
            </h3>

            <p className="text-xs text-slate-500">
              Vérifiez la <strong>CIN physique originale</strong> présentée par le citoyen et saisissez ou validez le code de retrait (<strong>{request.collectionToken}</strong>).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Code de retrait présenté :
              </label>
              <input
                type="text"
                value={collectionTokenInput}
                onChange={(e) => setCollectionTokenInput(e.target.value)}
                placeholder={request.collectionToken || 'COL-XXXXXX'}
                className="w-full px-3 py-2 font-mono font-bold text-center tracking-wider rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 uppercase"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleConfirmHandover}
                className="px-5 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Valider la Remise Définitive
              </button>
            </div>
          </div>
        </div>
      )}

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
