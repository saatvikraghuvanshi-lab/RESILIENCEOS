
import React, { useState } from 'react';

interface LandingPageProps {
  onLogin: () => void;
}

const ShieldLogo = ({ className = "w-20 h-20" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L4 5V11C4 16.52 7.48 21.74 12 23C16.52 21.74 20 16.52 20 11V5L12 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Internal Network Nodes */}
    <circle cx="12" cy="8.5" r="1" fill="white"/>
    <circle cx="8.5" cy="11.5" r="0.8" fill="white"/>
    <circle cx="15.5" cy="11.5" r="0.8" fill="white"/>
    <circle cx="8.5" cy="15.5" r="0.8" fill="white"/>
    <circle cx="15.5" cy="15.5" r="0.8" fill="white"/>
    <circle cx="12" cy="13.5" r="1" fill="white"/>
    
    <path d="M12 8.5V13.5" stroke="white" strokeWidth="0.5"/>
    <path d="M12 8.5L8.5 11.5" stroke="white" strokeWidth="0.5"/>
    <path d="M12 8.5L15.5 11.5" stroke="white" strokeWidth="0.5"/>
    <path d="M8.5 11.5L12 13.5" stroke="white" strokeWidth="0.5"/>
    <path d="M15.5 11.5L12 13.5" stroke="white" strokeWidth="0.5"/>
    <path d="M8.5 11.5V15.5" stroke="white" strokeWidth="0.5"/>
    <path d="M15.5 11.5V15.5" stroke="white" strokeWidth="0.5"/>

    {/* Center Arrow */}
    <path d="M12 19V11" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M9 14L12 11L15 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center p-6 overflow-hidden relative" role="main">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      {/* Animated Glow in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-sm relative z-10">
        <header className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex justify-center mb-8">
            <ShieldLogo className="w-24 h-24 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
          </div>
          <h1 className="text-5xl font-black tracking-tight uppercase leading-none mb-4">
            Resilience<span className="text-blue-500">OS</span>
          </h1>
          <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-[0.55em] font-bold">National Disaster Command Unit</p>
        </header>

        <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-10 backdrop-blur-3xl shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="flex border-b border-white/5 mb-10" role="tablist">
            <button
              id="tab-login"
              role="tab"
              aria-selected={isLogin}
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-4 text-[11px] font-black uppercase tracking-widest transition-all ${
                isLogin ? 'text-blue-500 border-b-2 border-blue-500' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              Uplink
            </button>
            <button
              id="tab-signup"
              role="tab"
              aria-selected={!isLogin}
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-4 text-[11px] font-black uppercase tracking-widest transition-all ${
                !isLogin ? 'text-blue-500 border-b-2 border-blue-500' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              Enlist
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest font-mono ml-1">Terminal ID</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@resilience.gov"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder:text-zinc-700 shadow-inner"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest font-mono ml-1">Secure Key</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder:text-zinc-700 shadow-inner"
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] font-black uppercase text-xs tracking-[0.3em] transition-all active:scale-[0.98] shadow-xl shadow-blue-600/20 group overflow-hidden relative"
            >
              <span className="relative z-10">{isLogin ? 'ESTABLISH LINK' : 'INITIALIZE AGENT'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" 
                  style={{ animationDelay: `${i * 200}ms`, opacity: 1 - (i * 0.3) }}
                ></div>
              ))}
            </div>
            <p className="text-[8px] text-zinc-600 uppercase font-mono text-center tracking-widest leading-relaxed">
              Resilience-OS v4.2.0-Tactical<br />
              Authorized Field Uplink Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
