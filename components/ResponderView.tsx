
import React from 'react';
import { SystemState, SOSAlert } from '../types';

interface ResponderViewProps {
  state: SystemState;
  onUpdateAlert: (id: string, status: SOSAlert['status'], responderId?: string) => void;
}

const ResponderView: React.FC<ResponderViewProps> = ({ state, onUpdateAlert }) => {
  const myResponderId = state.responders[0]?.id || 'mock-id';
  const assignedTasks = state.alerts.filter(a => a.assignedResponderId === myResponderId && a.status !== 'resolved');

  const handleResolve = (id: string) => {
    onUpdateAlert(id, 'resolved', myResponderId);
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 px-4" role="main" aria-label="Field Operations Unit ALPHA-7">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold font-mono uppercase tracking-tighter">FIELD OPS: UNIT ALPHA-7</h2>
          <p className="text-xs text-blue-400 font-mono" aria-live="polite">STATUS: EN-ROUTE | 0.4KM FROM TARGET</p>
        </div>
        <div className="w-12 h-12 bg-blue-600/20 border border-blue-500 rounded-lg flex items-center justify-center" aria-hidden="true">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
        </div>
      </div>

      <section className="space-y-4" aria-labelledby="tasks-heading">
        <h3 id="tasks-heading" className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-1">Assigned Tasks</h3>
        
        {assignedTasks.length === 0 ? (
          <div className="bg-[#111] border border-white/5 p-12 rounded-2xl text-center">
            <p className="text-zinc-600 font-mono text-xs uppercase">No active assignments. Stand by for command dispatch.</p>
          </div>
        ) : (
          <div className="space-y-4" role="list">
            {assignedTasks.map(task => (
              <div key={task.id} role="listitem" className="bg-blue-600/5 border border-blue-500/30 p-6 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" aria-hidden="true"></div>
                 <div className="flex justify-between items-start mb-4">
                   <div>
                      <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded mr-2" aria-label={`Priority Level ${task.severity}`}>PRIORITY {task.severity}</span>
                      <span className="text-[10px] text-zinc-400 font-mono uppercase">ID: {task.id.toUpperCase()}</span>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold text-zinc-100" aria-label="Estimated time of arrival 4 minutes">ETA: 4 MINS</p>
                   </div>
                 </div>

                 <h4 className="text-lg font-bold text-white mb-2">{task.citizenName}</h4>
                 <p className="text-sm text-zinc-400 mb-6 bg-black/40 p-4 rounded-xl italic font-serif" aria-label="Incident description">"{task.message}"</p>

                 <div className="grid grid-cols-2 gap-3">
                    <button className="bg-zinc-800 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 focus:ring-2 focus:ring-zinc-400 outline-none">Open Maps</button>
                    <button 
                      onClick={() => handleResolve(task.id)}
                      className="bg-green-600 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-700 focus:ring-2 focus:ring-green-400 outline-none"
                    >
                      Mark Resolved
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 space-y-4 opacity-70" aria-labelledby="support-heading">
        <h3 id="support-heading" className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-1">Nearby Support</h3>
        <div className="bg-[#111] border border-white/5 p-4 rounded-xl flex items-center justify-between">
           <span className="text-xs text-zinc-400">Emergency Shelter (North-Side)</span>
           <span className="text-xs text-green-500 font-mono font-bold" aria-label="0.8 kilometers away">0.8 KM</span>
        </div>
      </section>
    </div>
  );
};

export default ResponderView;
