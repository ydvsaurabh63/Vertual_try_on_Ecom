import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, Check, AlertCircle, FlipHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

export const CameraCaptureModal = ({
  isOpen,
  onClose,
  onPhotoSelected,
  onOpenGallery,
}) => {
  // Modal view states: 'CHOICE' | 'CAMERA' | 'PREVIEW'
  const [modalStep, setModalStep] = useState('CHOICE');
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) | 'environment' (rear)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera tracks helper
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn('Error stopping track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Check available video devices
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Initialize and start camera
  const startCamera = useCallback(async (mode = facingMode) => {
    stopCameraStream();
    setCameraError(null);
    setIsCameraLoading(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or environment.');
      setIsCameraLoading(false);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            console.warn('Video play error:', err);
          });
          setIsCameraLoading(false);
        };
      } else {
        setIsCameraLoading(false);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setIsCameraLoading(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings to take a photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device.');
      } else {
        setCameraError(err.message || 'Unable to access camera. Please check your camera connection.');
      }
    }
  }, [facingMode, stopCameraStream]);

  // Start/stop camera based on modalStep
  useEffect(() => {
    if (isOpen && modalStep === 'CAMERA') {
      startCamera(facingMode);
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, modalStep, facingMode, startCamera, stopCameraStream]);

  // Reset modal when opened/closed
  useEffect(() => {
    if (isOpen) {
      setModalStep('CHOICE');
      setCapturedImage(null);
      setCameraError(null);
    } else {
      stopCameraStream();
    }
  }, [isOpen, stopCameraStream]);

  if (!isOpen) return null;

  // Handler: Gallery chosen
  const handleSelectGallery = () => {
    onClose();
    if (onOpenGallery) {
      onOpenGallery();
    }
  };

  // Handler: Switch camera (front/rear)
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Handler: Capture photo frame from video
  const handleCaptureFrame = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      toast.error('Camera is not ready yet. Please wait a moment.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      // If using front camera, mirror the canvas to match selfie preview
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
      stopCameraStream();
      setModalStep('PREVIEW');
    } catch (err) {
      console.error('Failed to capture frame:', err);
      toast.error('Failed to capture photo. Please try again.');
    }
  };

  // Handler: Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setModalStep('CAMERA');
  };

  // Handler: Use this photo
  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onPhotoSelected(capturedImage);
      onClose();
    }
  };

  const handleModalClose = () => {
    stopCameraStream();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-[#16161a] border border-white/15 rounded-3xl p-6 shadow-2xl text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          onClick={handleModalClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── STEP 1: CHOICE POPUP ────────────────────────────────────────── */}
        {modalStep === 'CHOICE' && (
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-[#c87d4a]/20 border border-[#c87d4a]/40 text-[#c87d4a] flex items-center justify-center mx-auto shadow-lg shadow-[#c87d4a]/10">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-wide">Choose Photo Source</h3>
              <p className="text-xs text-white/50">
                Upload your photo to try on clothes with AI in the fitting room
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Gallery */}
              <button
                onClick={handleSelectGallery}
                className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#c87d4a]/60 flex items-center gap-4 transition-all group cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-[#c87d4a] transition-colors">
                    Upload from Gallery
                  </p>
                  <p className="text-xs text-white/40">Select an existing photo from your device</p>
                </div>
              </button>

              {/* Option 2: Camera */}
              <button
                onClick={() => setModalStep('CAMERA')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#c87d4a]/15 to-[#e09865]/10 hover:from-[#c87d4a]/25 hover:to-[#e09865]/20 border border-[#c87d4a]/40 hover:border-[#c87d4a] flex items-center gap-4 transition-all group cursor-pointer text-left shadow-lg shadow-[#c87d4a]/10"
              >
                <div className="w-10 h-10 rounded-xl bg-[#c87d4a]/20 border border-[#c87d4a]/50 text-[#c87d4a] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white group-hover:text-[#c87d4a] transition-colors">
                    Take Photo with Camera
                  </p>
                  <p className="text-xs text-[#c87d4a]/80">Use your device camera for a fresh fit photo</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: LIVE CAMERA PREVIEW ─────────────────────────────────── */}
        {modalStep === 'CAMERA' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Take Photo with Camera</h3>
                <p className="text-xs text-white/50">Align your face and torso in the frame</p>
              </div>

              {hasMultipleCameras && (
                <button
                  onClick={handleToggleFacingMode}
                  className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer mr-6"
                  title="Switch camera"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Switch</span>
                </button>
              )}
            </div>

            {/* Live Video Viewport */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black border border-white/15 flex items-center justify-center">
              {isCameraLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 z-10 text-center p-4">
                  <div className="w-8 h-8 rounded-full border-2 border-[#c87d4a]/30 border-t-[#c87d4a] animate-spin" />
                  <p className="text-xs text-white/70">Starting camera...</p>
                </div>
              )}

              {cameraError ? (
                <div className="p-6 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                  <p className="text-xs text-rose-300 font-medium leading-relaxed">{cameraError}</p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => startCamera(facingMode)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={handleSelectGallery}
                      className="px-3 py-1.5 rounded-xl bg-[#c87d4a] hover:bg-[#d88d5a] text-xs font-semibold text-white transition-colors cursor-pointer"
                    >
                      Choose from Gallery
                    </button>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              )}

              {/* Camera Frame Guide Overlay */}
              {!cameraError && !isCameraLoading && (
                <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-xl flex items-center justify-center">
                  <div className="w-32 h-44 rounded-full border border-dashed border-white/30" />
                </div>
              )}
            </div>

            {/* Camera Actions */}
            {!cameraError && (
              <div className="flex items-center justify-center gap-4 pt-1">
                <button
                  onClick={() => setModalStep('CHOICE')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Back
                </button>

                {/* Shutter Capture Button */}
                <button
                  onClick={handleCaptureFrame}
                  disabled={isCameraLoading}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#c87d4a] to-[#e09865] hover:brightness-110 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#c87d4a]/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: CAPTURED PHOTO PREVIEW & CONFIRM ────────────────────── */}
        {modalStep === 'PREVIEW' && capturedImage && (
          <div className="space-y-4 pt-1">
            <div className="text-center space-y-0.5">
              <h3 className="text-base font-bold text-white">Review Your Photo</h3>
              <p className="text-xs text-white/50">Looks good? Use it to try on clothes with AI</p>
            </div>

            {/* Captured Photo Preview */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-black border border-white/20 shadow-xl">
              <img
                src={capturedImage}
                alt="Captured Fit"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Confirmation Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleRetake}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo</span>
              </button>

              <button
                onClick={handleConfirmPhoto}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Use This Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraCaptureModal;
