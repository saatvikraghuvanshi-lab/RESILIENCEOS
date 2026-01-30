
import React, { useMemo, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import { SystemState, SOSAlert, Severity, IncidentCategory } from '../types';
import MapComponent, { MapRef } from './MapComponent';
import { calculateDistance } from '../services/Utils';
import { useEmergencyContacts } from '../hooks/useEmergencyContacts';
import TacticalContactModal from './TacticalContactModal';
import { AssetCategory } from '../services/EmergencyData';

interface DashboardProps {
  state: SystemState;
  onRunSimulation: () => void;
  onUpdateAlert: (id: string, status: SOSAlert['status'], responderId?: string) => void;
}

const DraggableAsset = ({ type, name, icon, onQuickDial }: { type: AssetCategory, name: string, icon: string, onQuickDial: (cat: AssetCategory) => void }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ASSET',
    item: { type, name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div 
      ref={(node) => { drag(node); }} 
      onClick={() => onQuickDial(type)}
      className={`p-3 rounded-xl border border-white/10 bg-black/40 flex items-center justify-between group cursor-grab active:cursor-grabbing transition-all hover:bg-white/5 ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-xl">{icon}</div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-200">{name}</div>
          <div className="text-[8px] text-zinc-500 uppercase font-mono">Available Unit</div>
        </div>
      </div>
      <button 
        className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 items-center justify-center flex opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Open ${name} contacts`}
      >
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </button>
    </div>
  );
};

const getCategoryIcon = (cat?: IncidentCategory) => {
  switch(cat) {
    case 'Flood': return '🌊';
    case 'Fire': return '🔥';
    case 'Medical': return '🏥';
    case 'Structural': return '🏗️';
    default: return '⚠️';
  }
};

const Dashboard: React.FC<DashboardProps> = ({ state, onRunSimulation, onUpdateAlert }) => {
  const mapRef = useRef<MapRef>(null);
  const [floodHours, setFloodHours] = useState(0);
  const { activeCategory, openContacts, closeContacts, copyToClipboard } = useEmergencyContacts();

  const sortedAlerts = useMemo(() => {
    return [...state.alerts].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return b.severity - a.severity;
    });
  }, [state.alerts]);

  const getSeverityColor = (sev: Severity) => {
    switch(sev) {
      case 5: return 'bg-red-600 text-white';
      case 4: return 'bg-orange-600 text-white';
      case 3: return 'bg-yellow-500 text-black';
      case 2: return 'bg-blue-500 text-white';
      default: return 'bg-zinc-600 text-white';
    }
  };

  const handleDispatch = (alertId: string) => {
    const foundAlert = state.alerts.find(a => a.id === alertId);
    if (!foundAlert) return;

    const availableResponders = state.responders.filter(r => r.status === 'idle');
    if (availableResponders.length === 0) {
      window.alert('No available responders currently.');
      return;
    }

    let nearest = availableResponders[0];
    let minDist = calculateDistance(foundAlert.location, nearest.location);

    availableResponders.forEach(r => {
      const d = calculateDistance(foundAlert.location, r.location);
      if (d < minDist) {
        minDist = d;
        nearest = r;
      }
    });

    onUpdateAlert(alertId, 'dispatched', nearest.id);
  };

  const handleCenterOnMe = () => {
    if (state.userLocation) {
      mapRef.current?.centerOn(state.userLocation);
    } else {
      window.alert("Station location not acquired. Ensure GPS permissions are active.");
    }
  };

  const isLight = state.theme === 'light';

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* Triage Sidebar */}
      <aside className={`w-96 h-full border-r flex flex-col z-20 shadow-2xl transition-colors relative ${isLight ? 'bg-white border-zinc-200' : 'bg-[#111] border-white/10'}`}>
        <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-zinc-200' : 'border-white/10'}`}>
          <h2 className={`text-sm font-bold uppercase tracking-widest font-mono ${isLight ? 'text-zinc-900' : 'text-zinc-200'}`}>Triage Intelligence</h2>
          <button 
            onClick={onRunSimulation}
            className={`text-[10px] border px-2 py-1 rounded transition-all uppercase font-bold ${
              isLight ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-blue-600/10 text-blue-500 border-blue-500/50'
            }`}
          >
            Simulate Crisis
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {sortedAlerts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-50 text-center p-8">
              <span className={`text-xs uppercase font-mono ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>No active alerts. Monitoring Channels...</span>
            </div>
          ) : (
            sortedAlerts.map(alertItem => (
              <div 
                key={alertItem.id} 
                onClick={() => mapRef.current?.centerOn(alertItem.location)}
                className={`p-3 rounded-lg border transition-all cursor-pointer relative group ${
                  isLight 
                  ? `bg-zinc-50 border-zinc-200 ${alertItem.status === 'dispatched' ? 'opacity-50' : 'hover:border-zinc-400'}`
                  : `bg-black/40 border-white/5 ${alertItem.status === 'dispatched' ? 'border-blue-500/30 opacity-60' : 'hover:border-white/20'}`
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${getSeverityColor(alertItem.severity)}`}>
                      P{alertItem.severity}
                    </span>
                    <span className="text-xs">{getCategoryIcon(alertItem.category)}</span>
                  </div>
                  <span className={`text-[9px] font-mono ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    {new Date(alertItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className={`text-xs font-bold mb-1 ${isLight ? 'text-zinc-900' : 'text-zinc-200'}`}>{alertItem.citizenName}</h3>
                <p className={`text-[11px] line-clamp-2 italic mb-3 ${isLight ? 'text-zinc-500' : 'text-zinc-500'}`}>"{alertItem.message}"</p>
                
                <div className="flex items-center justify-between">
                   <div className="text-[10px] font-mono text-zinc-500">{alertItem.location.lat.toFixed(3)}, {alertItem.location.lng.toFixed(3)}</div>
                   {alertItem.status === 'pending' && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleDispatch(alertItem.id); }}
                        className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-md uppercase hover:bg-red-700"
                      >
                        Dispatch
                      </button>
                   )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Module B: Temporal Flood Simulation */}
        <div className={`p-4 border-t ${isLight ? 'border-zinc-200' : 'border-white/10'} bg-blue-500/5`}>
           <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-blue-500">Flood Forecast T + {floodHours}H</span>
           </div>
           <input 
             type="range" 
             min="0" 
             max="24" 
             step="0.5"
             value={floodHours} 
             onChange={(e) => setFloodHours(parseFloat(e.target.value))}
             className="w-full h-1.5 bg-blue-500/20 rounded-lg appearance-none cursor-pointer accent-blue-500"
           />
           <div className="flex justify-between mt-1 text-[8px] font-mono text-zinc-500 uppercase">
             <span>Live</span>
             <span>Forecast Range: 24H</span>
           </div>
        </div>

        {/* Module C: Resource Toolbox */}
        <div className={`p-4 border-t ${isLight ? 'border-zinc-200' : 'border-white/10'} space-y-3`}>
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Deployment Toolbox</h3>
           <div className="grid grid-cols-1 gap-2">
              <DraggableAsset type="medical" name="Ambulance" icon="🚑" onQuickDial={openContacts} />
              <DraggableAsset type="rescue" name="Rescue Boat" icon="🚤" onQuickDial={openContacts} />
              <DraggableAsset type="ndrf" name="NDRF Team" icon="👥" onQuickDial={openContacts} />
           </div>
        </div>
      </aside>

      {/* Map Section */}
      <section className="flex-1 relative h-full bg-zinc-900 overflow-hidden">
        <MapComponent ref={mapRef} state={state} floodHours={floodHours} />
        
        {/* Floating Map Actions */}
        <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-3 pointer-events-none">
          <button 
            onClick={handleCenterOnMe}
            className={`w-14 h-14 rounded-full border shadow-2xl flex items-center justify-center transition-all active:scale-90 pointer-events-auto ${
              isLight ? 'bg-white border-zinc-200 text-blue-600 hover:bg-zinc-50' : 'bg-zinc-900 border-white/10 text-blue-400 hover:bg-black'
            }`}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </section>

      {/* Tactical Contact Modal */}
      <TacticalContactModal 
        category={activeCategory} 
        onClose={closeContacts} 
        onCopy={copyToClipboard} 
      />
    </div>
  );
};

export default Dashboard;
