
import React, { useState } from 'react';

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden" role="main">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md p-8 z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-3xl text-white italic mx-auto mb-4 shadow-lg shadow-blue-600/20" aria-hidden="true">
            R
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            RESILIENCE<span className="text-blue-500">OS</span>
          </h1>
          <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] font-mono">
            Unified Disaster Management System
          </p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
          <div className="flex border-b border-white/5 mb-8" role="tablist">
            <button
              id="tab-login"
              role="tab"
              aria-selected={isLogin}
              aria-controls="panel-auth"
              onClick={() => setIsLogin(true)}
              className={`flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-all ${
                isLogin ? 'text-blue-500 border-b-2 border-blue-500' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              Access Terminal
            </button>
            <button
              id="tab-signup"
              role="tab"
              aria-selected={!isLogin}
              aria-controls="panel-auth"
              onClick={() => setIsLogin(false)}
              className={`flex-1 pb-4 text-xs font-bold uppercase tracking-widest transition-all ${
                !isLogin ? 'text-blue-500 border-b-2 border-blue-500' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              New Enlistment
            </button>
          </div>

          <form id="panel-auth" role="tabpanel" aria-labelledby={isLogin ? "tab-login" : "tab-signup"} onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email-input" className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">
                Credential ID (Email)
              </label>
              <input
                id="email-input"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@resilience-os.gov"
                autoComplete="email"
                className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password-input" className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider font-mono">
                Security Key
              </label>
              <input
                id="password-input"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full bg-black border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-sm tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-600/20 focus:ring-4 focus:ring-blue-500/50"
            >
              {isLogin ? 'Initialize Uplink' : 'Register Service'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-zinc-600 uppercase font-mono leading-relaxed">
              Authorized personnel only. <br />
              Encryption level: AES-256 Military Grade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
