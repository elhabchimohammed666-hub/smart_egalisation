import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import CameraCapture from '../components/CameraCapture';
import { 
  Scan, 
  Upload, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RotateCcw, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  Check, 
  Info,
  ShieldAlert,
  Eye
} from 'lucide-react';

export default function RegisterCitizen() {
  const { registerCitizen } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Files & Previews
  const [frontFile, setFrontFile] = useState(null);
  const [frontPreview, setFrontPreview] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [backPreview, setBackPreview] = useState(null);

  // Camera modal state
  const [cameraActiveSide, setCameraActiveSide] = useState(null); // 'front' or 'back'

  // Processing & Outcome states
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationOutcome, setValidationOutcome] = useState(null); // { outcome, message, retryInstructions, fields, missingFields, success }
  const [syntheticProfile, setSyntheticProfile] = useState(null);

  // File selection handlers
  const handleFrontFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
      setSyntheticProfile(null);
      setValidationOutcome(null);
    }
  };

  const handleBackFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
      setSyntheticProfile(null);
      setValidationOutcome(null);
    }
  };

  const handleCameraCapture = (file, dataUrl) => {
    if (cameraActiveSide === 'front') {
      setFrontFile(file);
      setFrontPreview(dataUrl);
    } else {
      setBackFile(file);
      setBackPreview(dataUrl);
    }
    setSyntheticProfile(null);
    setValidationOutcome(null);
  };

  // Quick Demo Presets
  const applyPreset = (presetType) => {
    setValidationOutcome(null);
    const randNum = Math.floor(100000 + Math.random() * 899999);

    if (presetType === 'valid') {
      setEmail(`citoyen.test.${randNum}@mo9ata3a.ma`);
      setPassword('citoyenPassword123!');
      setPhone('+212 661-889900');
      setFrontPreview('/uploads/cin/sample_cin_front.png');
      setBackPreview('/uploads/cin/sample_cin_back.png');
      setSyntheticProfile({
        front: {
          cin: `BK${randNum}`,
          lastName: 'BENNANI',
          firstName: 'Omar',
          arabicFullName: 'عمر بناني',
          dateOfBirth: '12/03/1993',
          placeOfBirth: 'Casablanca',
          gender: 'M',
          nationality: 'Marocaine'
        },
        back: {
          address: '45 Boulevard d\'Anfa, Casablanca',
          validUntil: '15/09/2033',
          matchingCIN: `BK${randNum}`
        },
        confidence: 96
      });
    } else if (presetType === 'blurry') {
      setEmail(`test.flou.${randNum}@mo9ata3a.ma`);
      setPassword('testPassword123!');
      setPhone('+212 662-112233');
      setFrontPreview('/uploads/cin/sample_blurry.png');
      setBackPreview('/uploads/cin/sample_cin_back.png');
      setSyntheticProfile(null);
    } else if (presetType === 'duplicate') {
      setEmail(`test.doublon.${randNum}@mo9ata3a.ma`);
      setPassword('testPassword123!');
      setPhone('+212 663-445566');
      setFrontPreview('/uploads/cin/sample_cin_front.png');
      setBackPreview('/uploads/cin/sample_cin_back.png');
      setSyntheticProfile({
        front: {
          cin: 'BK789456', // Already registered by Yassine
          lastName: 'EL AMRANI',
          firstName: 'Yassine',
          dateOfBirth: '14/05/1994'
        },
        back: {
          address: '24 Rue Ibn Batouta Casablanca',
          validUntil: '12/10/2032',
          matchingCIN: 'BK789456'
        },
        confidence: 94
      });
    } else if (presetType === 'incomplete') {
      setEmail(`test.incomplet.${randNum}@mo9ata3a.ma`);
      setPassword('testPassword123!');
      setPhone('+212 664-778899');
      setFrontPreview('/uploads/cin/sample_cin_front.png');
      setBackPreview('/uploads/cin/sample_cin_back.png');
      setSyntheticProfile({
        front: {
          cin: `AB${randNum}`,
          lastName: 'IDRISSI'
          // Missing firstName, dateOfBirth!
        },
        back: {
          // Missing address
          validUntil: '10/10/2030'
        },
        confidence: 65
      });
    }
  };

  // Submit Registration & OCR analysis
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationOutcome(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('phone', phone);

      if (frontFile) formData.append('cinFront', frontFile);
      if (backFile) formData.append('cinBack', backFile);

      if (syntheticProfile) {
        formData.append('isSyntheticDemo', 'true');
        formData.append('syntheticProfile', JSON.stringify(syntheticProfile));
      }

      const res = await registerCitizen(formData);

      setValidationOutcome({
        success: true,
        outcome: 'Accepted',
        message: res.message || 'Carte d\'identité validée avec succès.',
        user: res.user
      });

      // Navigate to citizen dashboard after brief animation
      setTimeout(() => {
        navigate('/citizen/dashboard');
      }, 2000);

    } catch (err) {
      const data = err.response?.data;
      setValidationOutcome({
        success: false,
        outcome: data?.outcome || 'Rejected: Technical Error',
        code: data?.code,
        message: data?.message || 'Erreur lors du traitement de votre demande.',
        retryInstructions: data?.retryInstructions || 'Veuillez vérifier les informations et réessayer.',
        missingFields: data?.missingFields
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Extraction & Validation Automatique Node.js OCR</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Inscription Citoyen avec Carte Nationale (CIN)
        </h1>
        <p className="max-w-xl mx-auto text-xs text-slate-500 leading-relaxed">
          Conformément au guide Mo9ata3a Smart, l'accès au portail citoyen requiert la soumission et la validation automatique des deux faces de votre CIN marocaine.
        </p>
      </div>

      {/* Preset Selector Banner */}
      <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-800">
              Profils de Test Rapide (Évaluation des Résultats Officiels) :
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Cliquez pour charger des données de test
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => applyPreset('valid')}
            className="p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all"
          >
            <span className="text-xs font-bold text-emerald-700 block">✓ CIN Valide</span>
            <span className="text-[10px] text-slate-500">Résultat : Accepted</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('blurry')}
            className="p-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl text-left transition-all"
          >
            <span className="text-xs font-bold text-rose-700 block">✗ Image Floue</span>
            <span className="text-[10px] text-slate-500">Rejected: Poor Quality</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('duplicate')}
            className="p-2.5 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition-all"
          >
            <span className="text-xs font-bold text-amber-700 block">✗ CIN Doublon</span>
            <span className="text-[10px] text-slate-500">Rejected: Duplicate CIN</span>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('incomplete')}
            className="p-2.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 rounded-xl text-left transition-all"
          >
            <span className="text-xs font-bold text-purple-700 block">✗ Données Manquantes</span>
            <span className="text-[10px] text-slate-500">Incomplete Extraction</span>
          </button>
        </div>
      </div>

      {/* Validation Outcome Notification Banner */}
      {validationOutcome && (
        <div
          className={`p-5 rounded-2xl border text-sm space-y-2 animate-in fade-in slide-in-from-top-3 duration-200 ${
            validationOutcome.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-3">
            {validationOutcome.success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-white/80 shadow-2xs">
                  {validationOutcome.outcome}
                </span>
                {validationOutcome.code && (
                  <span className="text-[11px] font-mono opacity-70">
                    [{validationOutcome.code}]
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm">{validationOutcome.message}</p>
              {validationOutcome.retryInstructions && (
                <div className="text-xs bg-white/70 p-2.5 rounded-xl border border-rose-200 mt-2 space-y-1">
                  <span className="font-bold flex items-center gap-1 text-slate-800">
                    <Info className="w-3.5 h-3.5 text-rose-600" />
                    Instructions pour réessayer :
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {validationOutcome.retryInstructions}
                  </p>
                </div>
              )}
              {validationOutcome.missingFields && (
                <p className="text-xs text-rose-800 mt-1">
                  Champs non reconnus : <strong>{validationOutcome.missingFields.join(', ')}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        {/* Step 1: Account Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h2 className="font-bold text-slate-800 text-sm">
              Identifiants de Connexion Citoyen
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citoyen@exemple.ma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mot de Passe *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Au moins 6 caractères"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro de Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 6..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Step 2: CIN Document Upload & Camera */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="font-bold text-slate-800 text-sm">
                Soumission des Deux Faces de la CIN
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Formats acceptés : JPG, PNG, WEBP (min 320x200px)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Face Avant (Recto) *
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Contient Photo, Nom, Prénom, CIN
                </span>
              </div>

              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-400 transition-all flex flex-col items-center justify-center min-h-[190px]">
                {frontPreview ? (
                  <div className="w-full h-full space-y-2 flex flex-col items-center">
                    <img
                      src={frontPreview}
                      alt="Aperçu Recto"
                      className="max-h-36 object-contain rounded-xl shadow-xs border border-slate-200 bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer">
                        Changer le fichier
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFrontFileChange}
                        />
                      </label>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setCameraActiveSide('front')}
                        className="text-xs text-slate-600 hover:text-emerald-700 font-semibold"
                      >
                        Caméra
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <Scan className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Téléverser</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFrontFileChange}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCameraActiveSide('front')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-2xs transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Caméra</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Photo nette et bien cadrée
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Back Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Face Arrière (Verso) *
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  Contient Adresse, Expiration, MRZ
                </span>
              </div>

              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 hover:border-emerald-400 transition-all flex flex-col items-center justify-center min-h-[190px]">
                {backPreview ? (
                  <div className="w-full h-full space-y-2 flex flex-col items-center">
                    <img
                      src={backPreview}
                      alt="Aperçu Verso"
                      className="max-h-36 object-contain rounded-xl shadow-xs border border-slate-200 bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer">
                        Changer le fichier
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBackFileChange}
                        />
                      </label>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setCameraActiveSide('back')}
                        className="text-xs text-slate-600 hover:text-emerald-700 font-semibold"
                      >
                        Caméra
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <Scan className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Téléverser</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBackFileChange}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setCameraActiveSide('back')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow-2xs transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Caméra</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Adresse et date lisibles
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 py-4 bg-morocco-green-600 hover:bg-morocco-green-700 disabled:opacity-60 text-white font-bold rounded-2xl text-base shadow-md shadow-emerald-900/10 transition-all hover:scale-[1.01]"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyse Optique OCR & Validation des Données en cours...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Valider la CIN & Créer mon Compte Citoyen</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Camera Capture Modal */}
      {cameraActiveSide && (
        <CameraCapture
          sideTitle={cameraActiveSide === 'front' ? 'Face Avant (Recto)' : 'Face Arrière (Verso)'}
          onCapture={handleCameraCapture}
          onClose={() => setCameraActiveSide(null)}
        />
      )}
    </div>
  );
}
