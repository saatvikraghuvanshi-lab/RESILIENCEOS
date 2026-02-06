
import React from 'react';
import { NATIONAL_RESILIENCE_DATA, RegionData } from '../services/RegionalData';

const PriorityBadge = ({ priority }: { priority: RegionData['resilience_priority'] }) => {
  const colors = {
    'Critical': 'bg-red-500/10 text-red-500 border-red-500/30',
    'High': 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    'High_Tactical': 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    'Moderate': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
  };
  return (
    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border font-mono ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const NationalResilienceMatrix: React.FC = () => {
  return (
    <div className="h-full w-full bg-[#0a0a0a] flex flex-col overflow-hidden">
      <header className="p-8 border-b border-white/5 bg-zinc-900/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white mb-1">Strategic Resilience Matrix</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.3em]">Projected Socio-Environmental Strain Projections 2026</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[9px] text-zinc-600 uppercase font-mono block">Data Integrity</span>
              <span className="text-xs font-bold text-emerald-500 uppercase">Verified v{NATIONAL_RESILIENCE_DATA.data_version}</span>
            </div>
            <div className="w-[1px] h-8 bg-zinc-800"></div>
            <div className="text-right">
              <span className="text-[9px] text-zinc-600 uppercase font-mono block">Baseline Metric</span>
              <span className="text-xs font-bold text-zinc-400 uppercase">{NATIONAL_RESILIENCE_DATA.unit}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NATIONAL_RESILIENCE_DATA.regions.map((region, idx) => (
              <div 
                key={region.region}
                className="p-6 bg-zinc-900/40 border border-white/5 rounded-[32px] hover:border-blue-500/30 transition-all group animate-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tight">{region.region}</h3>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {region.states.slice(0, 3).map(s => (
                        <span key={s} className="text-[8px] text-zinc-500 font-mono uppercase">{s}</span>
                      ))}
                      {region.states.length > 3 && <span className="text-[8px] text-zinc-600 font-mono">+{region.states.length - 3} more</span>}
                    </div>
                  </div>
                  <PriorityBadge priority={region.resilience_priority} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-[9px] text-zinc-600 uppercase font-mono font-bold mb-1">Density 2006</p>
                    <p className="text-xl font-black text-zinc-300 font-mono">{region.density_2006}</p>
                  </div>
                  <div className="p-3 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                    <p className="text-[9px] text-blue-500 uppercase font-mono font-bold mb-1">Est. 2026</p>
                    <p className="text-xl font-black text-blue-500 font-mono">{region.density_2026_est}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Infrastructure Strain Index</span>
                      <span className="text-[10px] font-mono text-white">{(region.infrastructure_strain_index * 10).toFixed(1)}/10</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          region.infrastructure_strain_index > 0.8 ? 'bg-red-500' :
                          region.infrastructure_strain_index > 0.6 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${region.infrastructure_strain_index * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest block mb-2">Primary Hazards</span>
                    <div className="flex flex-wrap gap-2">
                      {region.primary_hazards.map(hazard => (
                        <span key={hazard} className="text-[9px] bg-white/5 border border-white/10 text-zinc-400 px-2.5 py-1 rounded-full uppercase font-bold group-hover:text-zinc-200 transition-colors">
                          {hazard}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] text-zinc-600 uppercase font-mono">20-Year CAGR</span>
                    <span className="text-xs font-black text-white font-mono">{region.cagr_20yr}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <footer className="mt-12 p-8 bg-zinc-900/20 border border-white/5 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-lg">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 font-mono italic">Strategic Advisory</h4>
              <p className="text-[10px] text-zinc-600 leading-relaxed font-mono uppercase">
                Systems indicate that high-strain regions (Strain &gt; 0.75) require immediate infrastructure reinforcement to prevent service collapse during natural hazard events. Tactical response units must be pre-positioned in High_Tactical priority zones.
              </p>
            </div>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
              Export Forecast PDF
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default NationalResilienceMatrix;
