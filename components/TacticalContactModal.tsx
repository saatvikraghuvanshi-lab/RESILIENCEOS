
import React from 'react';
import { AssetCategory, EMERGENCY_CONTACTS } from '../services/EmergencyData';

interface TacticalContactModalProps {
  category: AssetCategory | null;
  onClose: () => void;
  onCopy: (text: string) => Promise<boolean>;
}

const TacticalContactModal: React.FC<TacticalContactModalProps> = ({ category, onClose, onCopy }) => {
  if (!category) return null;

  const data = EMERGENCY_CONTACTS[category];

  const handleCopy = async (num: string) => {
    const success = await onCopy(num);
    if (success) {
      // Optional: Add a temporary toast notification here if needed
      console.debug(`Copied ${num} to clipboard`);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-end p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="w-full max-w-md h-fit bg-slate-900/95 border border-slate-700 shadow-2xl rounded-3xl overflow-hidden animate-in slide-in-from-right-10 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h2 id="modal-title" className="text-sm font-black uppercase tracking-widest text-emerald-400 font-mono">Quick Dispatch</h2>
              <p className="text-[10px] text-slate-500 uppercase font-mono">Direct Uplink Channel</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
            aria-label="Close contact modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{data.title}</h3>
            <p className="text-xs text-slate-400 italic">"{data.description}"</p>
          </div>

          <div className="space-y-4">
            {/* Primary Contact */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 group hover:border-emerald-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{data.primaryLabel}</span>
                <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Primary</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <a 
                  href={`tel:${data.primary}`}
                  className="text-2xl font-black text-emerald-400 font-mono hover:underline"
                  aria-label={`Call ${data.primaryLabel} at ${data.primary}`}
                >
                  {data.primary}
                </a>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCopy(data.primary)}
                    className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 012-2v-8a2 2 0 01-2-2h-8a2 2 0 01-2 2v8a2 2 0 012 2z" />
                    </svg>
                  </button>
                  <a 
                    href={`tel:${data.primary}`}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest transition-all active:scale-95"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            </div>

            {/* Secondary Contact */}
            <div className="p-4 rounded-2xl bg-slate-800/20 border border-slate-700/30 group hover:border-slate-500/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{data.secondaryLabel}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <a 
                  href={`tel:${data.secondary}`}
                  className="text-xl font-bold text-slate-300 font-mono hover:underline"
                >
                  {data.secondary}
                </a>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCopy(data.secondary)}
                    className="p-2 bg-slate-700/30 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 012-2v-8a2 2 0 01-2-2h-8a2 2 0 01-2 2v8a2 2 0 012 2z" />
                    </svg>
                  </button>
                  <a 
                    href={`tel:${data.secondary}`}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest transition-all active:scale-95"
                  >
                    Dial
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">
            Authorized Field Uplink Terminal | Resilience-OS Core
          </p>
        </div>
      </div>
    </div>
  );
};

export default TacticalContactModal;
