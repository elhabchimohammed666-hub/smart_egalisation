import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose, sideTitle = 'Face avant (Recto)' }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Impossible d\'accéder à la caméra. Vérifiez vos permissions ou utilisez le téléversement de fichier.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleSnap = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 500;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `cin-camera-${Date.now()}.png`, { type: 'image/png' });
      setCapturedImage({
        dataUrl: canvas.toDataURL('image/png'),
        file
      });
    }, 'image/png');
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage?.file) {
      onCapture(capturedImage.file, capturedImage.dataUrl);
      stopCamera();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-700" />
            <h3 className="font-semibold text-slate-800 text-sm">
              Capture Caméra - {sideTitle}
            </h3>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {cameraError ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Erreur d'accès à la caméra</p>
                <p className="text-xs mt-1">{cameraError}</p>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[16/10] bg-black rounded-xl overflow-hidden flex items-center justify-center">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Card overlay guide */}
                  <div className="absolute inset-4 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex items-center justify-center">
                    <span className="text-white/80 text-xs bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                      Alignez votre CIN dans le cadre
                    </span>
                  </div>
                </>
              ) : (
                <img
                  src={capturedImage.dataUrl}
                  alt="Captured CIN"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-4">
            {!capturedImage ? (
              <button
                type="button"
                onClick={handleSnap}
                disabled={!!cameraError}
                className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all"
              >
                <Camera className="w-4 h-4" />
                Prendre la photo
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2 rounded-xl text-sm transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reprendre
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-5 py-2 rounded-xl text-sm shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Valider cette image
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
