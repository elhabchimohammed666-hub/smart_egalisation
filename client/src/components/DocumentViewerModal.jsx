import React from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

export default function DocumentViewerModal({ doc, onClose }) {
  if (!doc) return null;

  const isPDF = doc.fileType?.includes('pdf') || doc.filePath?.endsWith('.pdf');
  const fileUrl = doc.filePath?.startsWith('http') ? doc.filePath : doc.filePath;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                {doc.documentName || doc.originalName || 'Document'}
              </h3>
              <p className="text-xs text-slate-500">
                Téléversé le {new Date(doc.uploadedAt || Date.now()).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 p-4 overflow-auto flex items-center justify-center">
          {isPDF ? (
            <iframe
              src={fileUrl}
              title="Aperçu Document PDF"
              className="w-full h-full rounded-xl border border-slate-200 bg-white shadow-sm"
            />
          ) : (
            <img
              src={fileUrl}
              alt="Aperçu Document"
              className="max-w-full max-h-full object-contain rounded-xl shadow-md border border-slate-200 bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
}
