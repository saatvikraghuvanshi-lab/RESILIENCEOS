
import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AppMode, SystemState, SOSAlert, Responder, Shelter, Severity, GeoLocation } from './types';
import Dashboard from './components/Dashboard';
import CivilianPortal from './components/CivilianPortal';
import ResponderView from './components/ResponderView';
import LandingPage from './components/LandingPage';
import TrainingPortal from './components/TrainingPortal';
import { generateMockAlerts, generateMockResponders, generateMockShelters } from './services/SimulationEngine';
import { calculatePriority, categorizeIncident } from './services/TriageEngine';
import { useOfflineSOS } from './hooks/useOfflineSOS';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [mode, setMode] = useState<AppMode>(AppMode.ADMIN);
  const [state, setState] = useState<SystemState>({
    alerts: [],
    responders: [],
    shelters: [],
    isLowBandwidth: false,
    isOffline: !navigator.onLine,
    userLocation: null,
    theme: 'dark',
    userStats: {
      readinessPoints: 150,
      goBagComplete: false,
      drillsCompleted: 2
    }
  });

  const handleSyncOfflineAlerts = useCallback((offlineAlerts: SOSAlert[]) => {
    setState(prev => ({
      ...prev,
      alerts: [...offlineAlerts, ...prev.alerts]
    }));
  }, []);

  const { saveSOSOffline } = useOfflineSOS(handleSyncOfflineAlerts);

  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOffline: false }));
    const handleOffline = () => setState(prev => ({ ...prev, isOffline: true }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const success = (position: GeolocationPosition) => {
      const loc: GeoLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setState(prev => ({ ...prev, userLocation: loc }));
    };

    const error = () => {
      console.warn("Unable to retrieve your location");
    };

    const watcher = navigator.geolocation.watchPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  useEffect(() => {
    if (state.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [state.theme]);

  const runSimulation = useCallback(() => {
    const center = state.userLocation || { lat: 19.0760, lng: 72.8777 };
    const alerts = generateMockAlerts(15, center);
    const responders = generateMockResponders(5, center);
    const shelters = generateMockShelters(4, center);
    setState(prev => ({ ...prev, alerts, responders, shelters }));
  }, [state.userLocation]);

  const addAlert = useCallback((alert: SOSAlert) => {
    const triagedSeverity = calculatePriority(alert.message, alert.severity);
    const category = categorizeIncident(alert.message);
    
    const triagedAlert: SOSAlert = {
      ...alert,
      severity: triagedSeverity,
      category,
      isMesh: state.isOffline 
    };

    if (state.isOffline) {
      saveSOSOffline(triagedAlert);
    } else {
      setState(prev => ({
        ...prev,
        alerts: [triagedAlert, ...prev.alerts]
      }));
    }
  }, [state.isOffline, saveSOSOffline]);

  const updateAlertStatus = useCallback((id: string, status: SOSAlert['status'], responderId?: string) => {
    setState(prev => ({
      ...prev,
      alerts: prev.alerts.map(a => a.id === id ? { ...a, status, assignedResponderId: responderId } : a),
      responders: prev.responders.map(r => r.id === responderId ? { ...r, status: 'en-route', currentTaskId: id } : r)
    }));
  }, []);

  const handleCompleteDrill = useCallback(() => {
    setState(prev => ({
      ...prev,
      userStats: {
        ...prev.userStats,
        readinessPoints: prev.userStats.readinessPoints + 50,
        drillsCompleted: prev.userStats.drillsCompleted + 1
      }
    }));
  }, []);

  const handleResetSystem = () => {
    const confirmed = window.confirm("WARNING: This will purge all local tactical data and cache. The system will restart. Proceed?");
    if (confirmed) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const isLight = state.theme === 'light';

  if (!isLoggedIn) {
    return <LandingPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={`h-screen w-full flex flex-col transition-colors duration-300 ${isLight ? 'bg-[#f4f4f5] text-[#18181b]' : 'bg-[#0a0a0a] text-[#e5e5e5]'}`}>
        <header className={`h-14 border-b flex items-center justify-between px-6 z-[60] shadow-sm ${isLight ? 'bg-white border-zinc-200' : 'bg-[#111] border-white/10'}`} role="banner">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white italic" aria-hidden="true">R</div>
            <h1 className="text-xl font-bold tracking-tighter font-mono">RESILIENCE<span className="text-blue-500">OS</span></h1>
          </div>
          
          <nav className={`flex items-center gap-1 p-1 rounded-lg border ${isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-black/40 border-white/5'}`} role="navigation" aria-label="Application View Switcher">
            {(Object.keys(AppMode) as Array<keyof typeof AppMode>).map((m) => (
              <button
                key={m}
                onClick={() => setMode(AppMode[m as keyof typeof AppMode])}
                aria-pressed={mode === AppMode[m as keyof typeof AppMode]}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all focus:ring-2 focus:ring-blue-500 outline-none ${
                  mode === AppMode[m as keyof typeof AppMode] 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : isLight ? 'text-zinc-500 hover:text-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setShowSummary(!showSummary)}
              className={`text-[10px] font-mono uppercase px-3 py-1.5 rounded-md border transition-all flex items-center gap-2 ${
                showSummary 
                ? 'bg-blue-600/10 border-blue-500/50 text-blue-500' 
                : isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-200' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>📊 Summary</span>
              <div className={`w-1.5 h-1.5 rounded-full ${state.alerts.some(a => a.status === 'pending') ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
            </button>

            <div className="h-6 w-[1px] bg-white/10"></div>

            <div className="flex items-center gap-2" aria-label={state.isOffline ? 'System is offline' : 'System is online'}>
              <span className={`w-2 h-2 rounded-full ${state.isOffline ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span className={`text-[10px] font-mono uppercase ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>{state.isOffline ? 'Offline' : 'Online'}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowSettings(true)}
                aria-label="Open Settings"
                className={`text-[10px] font-mono uppercase px-2 py-1 transition-colors flex items-center gap-1 ${isLight ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-500 hover:text-white'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
              </button>
              <button 
                onClick={() => setIsLoggedIn(false)}
                className={`text-[10px] font-mono uppercase px-2 py-1 transition-colors flex items-center gap-1 ${isLight ? 'text-red-600 hover:text-red-700' : 'text-red-500/80 hover:text-red-500'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </div>

            {showSummary && (
              <div className={`absolute top-12 right-0 backdrop-blur-xl border rounded-2xl shadow-2xl w-80 max-h-[85vh] flex flex-col z-[70] transition-all animate-in slide-in-from-top-2 duration-300 ${
                isLight ? 'bg-white/95 border-zinc-200' : 'bg-black/90 border-white/10'
              }`}>
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest font-mono text-zinc-500">Tactical Command Summary</h4>
                  <button onClick={() => setShowSummary(false)} className="text-zinc-500 hover:text-zinc-300"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-red-600/10 border border-red-600/20 group hover:bg-red-600/20 transition-all">
                      <div>
                        <span className="text-[10px] font-bold text-red-500 block uppercase tracking-tighter">Active SOS</span>
                        <span className="text-[8px] text-red-500/60 uppercase font-mono">Immediate Response Required</span>
                      </div>
                      <span className="text-2xl font-mono font-black text-red-500">{state.alerts.filter(a => a.status === 'pending').length}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-xl bg-blue-600/10 border border-blue-600/20 group hover:bg-blue-600/20 transition-all">
                      <div>
                        <span className="text-[10px] font-bold text-blue-500 block uppercase tracking-tighter">Units On-Duty</span>
                        <span className="text-[8px] text-blue-500/60 uppercase font-mono">Mobile Field Personnel</span>
                      </div>
                      <span className="text-2xl font-mono font-black text-blue-500">{state.responders.length}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-xl bg-green-600/10 border border-green-600/20 group hover:bg-green-600/20 transition-all">
                      <div>
                        <span className="text-[10px] font-bold text-green-600 block uppercase tracking-tighter">Shelter Capacity</span>
                        <span className="text-[8px] text-green-600/60 uppercase font-mono">Safe Zones Available</span>
                      </div>
                      <span className="text-2xl font-mono font-black text-green-600">84%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <h5 className="text-[8px] uppercase font-bold text-zinc-600 mb-2 font-mono">Network Health</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                        <span>Mesh Uplink</span>
                        <span className="text-green-500">ACTIVE</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-[92%]"></div>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                        <span>Satellite Ping</span>
                        <span className="text-zinc-500">24MS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 relative overflow-hidden" role="main">
          {mode === AppMode.ADMIN && (
            <Dashboard 
              state={state} 
              onRunSimulation={runSimulation}
              onUpdateAlert={updateAlertStatus}
            />
          )}
          {mode === AppMode.CIVILIAN && (
            <CivilianPortal onSendSOS={addAlert} currentUserLocation={state.userLocation} theme={state.theme} />
          )}
          {mode === AppMode.RESPONDER && (
            <ResponderView state={state} onUpdateAlert={updateAlertStatus} />
          )}
          {mode === AppMode.TRAINING && (
            <TrainingPortal stats={state.userStats} onCompleteDrill={handleCompleteDrill} />
          )}
        </main>

        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`w-full max-sm rounded-3xl p-8 border shadow-2xl ${isLight ? 'bg-white border-zinc-200 text-zinc-900' : 'bg-[#111] border-white/10 text-white'}`}>
              <div className="flex items-center justify-between mb-8 border-b pb-4 border-zinc-500/10">
                <h2 className="text-xl font-bold uppercase tracking-widest font-mono">System Config</h2>
                <button onClick={() => setShowSettings(false)} className="text-zinc-500 hover:text-zinc-800"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Appearance</p>
                    <button onClick={() => setState(p => ({...p, theme: p.theme === 'dark' ? 'light' : 'dark'}))} className="text-[10px] text-blue-500 font-mono underline uppercase">Switch to {state.theme === 'dark' ? 'Light' : 'Dark'}</button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider">Mesh Uplink</p>
                    <p className="text-[10px] text-zinc-500 font-mono">Simulated Peer-to-Peer Protocol</p>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_#10b981]"></div>
                </div>

                <div className="pt-4 border-t border-zinc-500/10">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2">Danger Zone</p>
                  <button 
                    onClick={handleResetSystem}
                    className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                  >
                    Purge Cache & Restart
                  </button>
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="w-full mt-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs tracking-[0.2em]">Close</button>
            </div>
          </div>
        )}

        <footer className={`h-6 border-t flex items-center px-4 text-[9px] font-mono justify-between uppercase tracking-widest ${isLight ? 'bg-zinc-100 border-zinc-200 text-zinc-500' : 'bg-[#1a1a1a] border-white/5 text-zinc-500'}`}>
          <div>Uptime: 99.9%</div>
          <div className="flex gap-4">
            <span>Alerts: {state.alerts.length}</span>
            <span>Units: {state.responders.length}</span>
            <span>Mesh Hops: 12</span>
          </div>
        </footer>
      </div>
    </DndProvider>
  );
};

export default App;
