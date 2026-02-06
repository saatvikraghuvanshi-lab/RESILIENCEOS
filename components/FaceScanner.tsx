
import React, { useEffect, useRef, useState } from 'react';

interface FaceScannerProps {
  onComplete: () => void;
  onCancel: () => void;
  title?: string;
}

const FaceScanner: React.FC<FaceScannerProps> = ({ onComplete, onCancel, title = "Biometric Verification" }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'initializing' | 'scanning' | 'complete' | 'error'>('initializing');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStatus('scanning');
        }
      } catch (err) {
        console.error("Camera access denied", err);
        setStatus('error');
        setErrorMsg("Optical sensor offline. Check permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (status === 'scanning') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStatus('complete');
              setTimeout(onComplete, 800);
            }, 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status, onComplete]);

  const getStatusText = () => {
    if (status === 'initializing') return "Calibrating Optical Array...";
    if (status === 'error') return errorMsg;
    if (status === 'complete') return "IDENTITY VERIFIED";
    if (progress < 30) return "Locating Facial Geometry...";
    if (progress < 60) return "Mapping Biometric Mesh...";
    if (progress < 90) return "Analyzing Retinal Signature...";
    return "Finalizing Uplink...";
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-md">
      <div className="w-full max-w-sm relative aspect-square mb-8">
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl z-20"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl z-20"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl z-20"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-3xl z-20"></div>

        {/* Video Feed */}
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/10 relative">
          {status !== 'error' ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover grayscale opacity-60"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-red-500 font-mono text-center p-8">
              {errorMsg}
            </div>
          )}

          {/* Scanning Line */}
          {status === 'scanning' && (
            <div 
              className="absolute left-0 w-full h-[2px] bg-blue-400 shadow-[0_0_15px_#3b82f6] z-30 animate-pulse"
              style={{ top: `${progress}%`, transition: 'top 50ms linear' }}
            ></div>
          )}

          {/* Face Mesh Mockup */}
          {status === 'scanning' && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
               <svg className="w-2/3 h-2/3 text-blue-400" viewBox="0 0 100 100" fill="none">
                  <path d="M20 30 C 20 10, 80 10, 80 30 C 80 60, 50 90, 50 90 C 50 90, 20 60, 20 30" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                  <circle cx="35" cy="35" r="5" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="65" cy="35" r="5" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M40 65 Q 50 75 60 65" stroke="currentColor" strokeWidth="0.5" />
               </svg>
            </div>
          )}

          {/* Completion Overlay */}
          {status === 'complete' && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center z-40">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center animate-ping">
                 <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                 </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-4 max-w-xs">
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 font-mono">{title}</h2>
        <div className={`text-sm font-bold font-mono ${status === 'error' ? 'text-red-500' : 'text-blue-400'}`}>
          {getStatusText()}
        </div>
        
        {status === 'scanning' && (
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        <button 
          onClick={onCancel}
          className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          Cancel Scan
        </button>
      </div>
    </div>
  );
};

export default FaceScanner;
