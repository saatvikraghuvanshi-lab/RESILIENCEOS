
import React, { useState } from 'react';
import { Severity, SOSAlert, GeoLocation } from '../types';

interface CivilianPortalProps {
  onSendSOS: (alert: SOSAlert) => void;
  currentUserLocation: GeoLocation | null;
  theme?: 'dark' | 'light';
}

const CivilianPortal: React.FC<CivilianPortalProps> = ({ onSendSOS, currentUserLocation, theme = 'dark' }) => {
  const [severity, setSeverity] = useState<Severity>(3);
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const isLight = theme === 'light';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const performSend = (loc: GeoLocation) => {
      const sosAlert: SOSAlert = {
        id: Math.random().toString(36).substr(2, 9),
        citizenName: name || 'Anonymous',
        message: message || 'Urgent assistance required.',
        severity,
        location: loc,
        timestamp: Date.now(),
        status: 'pending'
      };

      setTimeout(() => {
        onSendSOS(sosAlert);
        setIsSending(false);
        setSent(true);
      }, 1200);
    };

    if (currentUserLocation) {
      performSend(currentUserLocation);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => performSend({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          window.alert("Location unavailable. Simulation fallback used.");
          performSend({
            lat: 40.7128 + (Math.random() - 0.5) * 0.05,
            lng: -74.0060 + (Math.random() - 0.5) * 0.05
          });
        },
        { timeout: 10000 }
      );
    }
  };

  if (sent) {
    return (
      <div 
        className={`max-w-md mx-auto mt-20 p-8 border rounded-2xl text-center space-y-6 transition-colors ${
          isLight ? 'bg-white border-green-200' : 'bg-[#111] border-green-500/30'
        }`} 
        role="alert" 
        aria-live="assertive"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className={`text-2xl font-bold uppercase tracking-tighter ${isLight ? 'text-zinc-900' : 'text-white'}`}>SOS Dispatched</h2>
        <p className="text-zinc-500 text-sm">Emergency services have been notified of your location. Stay where you are and wait for rescue. Keep your phone charged.</p>
        <button 
          onClick={() => setSent(false)}
          className={`w-full py-4 font-bold rounded-xl transition-all uppercase text-xs tracking-widest focus:ring-4 ${
            isLight ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          Send Another Update
        </button>
      </div>
    );
  }

  return (
    <div className={`max-w-md mx-auto mt-10 p-6 sm:p-8 border rounded-2xl shadow-2xl relative overflow-hidden transition-colors ${
      isLight ? 'bg-white border-zinc-200' : 'bg-[#111] border-white/10'
    }`} role="main">
      <div className="absolute top-0 left-0 w-full h-1 bg-red-600" aria-hidden="true"></div>
      
      <div className="space-y-6">
        <div className="text-center">
          <h2 className={`text-3xl font-black italic tracking-tighter mb-1 ${isLight ? 'text-zinc-900' : 'text-white'}`}>EMERGENCY SOS</h2>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-mono">Civilian Incident Reporting Portal</p>
          {currentUserLocation && (
            <div className="mt-2 text-[9px] text-green-600 font-mono uppercase tracking-widest flex items-center justify-center gap-1" aria-label={`GPS Locked at ${currentUserLocation.lat.toFixed(4)}, ${currentUserLocation.lng.toFixed(4)}`}>
              <span className="w-1 h-1 bg-green-500 rounded-full animate-ping" aria-hidden="true"></span>
              GPS Locked: {currentUserLocation.lat.toFixed(4)}, {currentUserLocation.lng.toFixed(4)}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="civilian-name" className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Your Name (Optional)</label>
            <input 
              id="civilian-name"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-black border-white/5 text-white'
              }`}
            />
          </div>

          <div className="space-y-2" role="group" aria-labelledby="severity-label">
            <span id="severity-label" className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Severity Level</span>
            <div className="grid grid-cols-5 gap-2" role="radiogroup">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={severity === s}
                  aria-label={`Severity Level ${s}`}
                  onClick={() => setSeverity(s as Severity)}
                  className={`py-3 rounded-lg text-xs font-bold transition-all border focus:ring-2 focus:ring-red-500 outline-none ${
                    severity === s 
                    ? 'bg-red-600 border-red-500 text-white scale-105' 
                    : isLight 
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:border-zinc-300' 
                      : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="sos-description" className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Situation Description</label>
            <textarea 
              id="sos-description"
              required
              aria-required="true"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the danger..."
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500 transition-all outline-none h-32 resize-none ${
                isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-black border-white/5 text-white'
              }`}
            ></textarea>
          </div>

          <button 
            disabled={isSending}
            type="submit"
            aria-busy={isSending}
            className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 relative overflow-hidden group focus:ring-4 focus:ring-red-500/50 outline-none shadow-lg ${
              isSending ? 'bg-zinc-500' : 'bg-red-600 hover:bg-red-700 active:scale-95 text-white'
            }`}
          >
            {isSending ? (
              <span className="animate-pulse">CONNECTING TO COMMAND...</span>
            ) : (
              <>
                <div className="absolute inset-0 bg-white/10 group-hover:opacity-100 transition-opacity" aria-hidden="true"></div>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                SEND SOS PING
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[9px] text-zinc-500 uppercase font-mono px-4">
          Transmission will include your precise GPS coordinates. If offline, the request will be cached and sent upon reconnect.
        </p>
      </div>
    </div>
  );
};

export default CivilianPortal;
