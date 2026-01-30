
import React from 'react';
import { UserStats } from '../types';

interface TrainingPortalProps {
  stats: UserStats;
  onCompleteDrill: () => void;
}

const TrainingPortal: React.FC<TrainingPortalProps> = ({ stats, onCompleteDrill }) => {
  const challenges = [
    { id: 1, title: 'Safe Zone Identification', points: 50, icon: '📍' },
    { id: 2, title: 'Go-Bag Inventory Check', points: 100, icon: '🎒' },
    { id: 3, title: 'First Aid Simulation', points: 150, icon: '🩹' },
  ];

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 space-y-8">
      <header className="flex justify-between items-end border-b border-zinc-500/10 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">Resilience Academy</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Build Survival Readiness</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-zinc-400 uppercase font-mono">Current Rank: Responder-In-Training</p>
          <div className="text-3xl font-black text-blue-500 font-mono">{stats.readinessPoints} pts</div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-500/10">
          <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Go-Bag Status</span>
          <div className={`text-sm font-bold mt-1 ${stats.goBagComplete ? 'text-green-500' : 'text-amber-500'}`}>
            {stats.goBagComplete ? '✅ FULLY EQUIPPED' : '⚠️ ITEMS MISSING'}
          </div>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-500/10">
          <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Drills Completed</span>
          <div className="text-xl font-black mt-1">{stats.drillsCompleted}</div>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-500/10">
          <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">Response Readiness</span>
          <div className="w-full bg-zinc-800 h-1.5 mt-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full" style={{ width: `${Math.min(stats.readinessPoints / 10, 100)}%` }}></div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Active Readiness Drills</h3>
        {challenges.map(c => (
          <div key={c.id} className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900/50 border border-zinc-500/10 rounded-2xl hover:border-blue-500/50 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="text-2xl bg-zinc-100 dark:bg-zinc-800 w-12 h-12 flex items-center justify-center rounded-xl">{c.icon}</div>
              <div>
                <h4 className="font-bold text-sm uppercase">{c.title}</h4>
                <p className="text-[10px] text-zinc-500 font-mono">EARN {c.points} READINESS POINTS</p>
              </div>
            </div>
            <button 
              onClick={onCompleteDrill}
              className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Start Drill
            </button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default TrainingPortal;
