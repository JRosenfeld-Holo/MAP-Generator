import React, { useState, useCallback, useMemo } from 'react';
import { INITIAL_ACTIONS, REQUIREMENTS } from './constants';
import { ActionItem, ActionStatus, ActionCategory } from './types';
import { ProgressBar } from './components/ProgressBar';
import { ActionRow } from './components/ActionRow';
import { CheckCircle2, Target, Zap, ShieldCheck, Server, Globe2, ArrowRight, Filter, ChevronDown, Calendar, AlertCircle, X, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [items, setItems] = useState<ActionItem[]>(INITIAL_ACTIONS);
  const [ownerFilter, setOwnerFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isContactOpen, setIsContactOpen] = useState(false);

  const toggleAction = useCallback((id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === ActionStatus.PENDING ? ActionStatus.COMPLETE : ActionStatus.PENDING
        };
      }
      return item;
    }));
  }, []);

  const progress = useMemo(() => {
    const completed = items.filter(i => i.status === ActionStatus.COMPLETE).length;
    return (completed / items.length) * 100;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesOwner = ownerFilter === 'All' 
        ? true 
        : (item.owner.toLowerCase().includes(ownerFilter.toLowerCase()) || item.owner === 'Both Teams');
      
      const matchesStatus = statusFilter === 'All'
        ? true
        : item.status === statusFilter;

      return matchesOwner && matchesStatus;
    });
  }, [items, ownerFilter, statusFilter]);

  const groupedItems = useMemo(() => {
    return {
      [ActionCategory.IMMEDIATE]: filteredItems.filter(i => i.category === ActionCategory.IMMEDIATE),
      [ActionCategory.TECHNICAL]: filteredItems.filter(i => i.category === ActionCategory.TECHNICAL),
      [ActionCategory.COMMERCIAL]: filteredItems.filter(i => i.category === ActionCategory.COMMERCIAL),
    };
  }, [filteredItems]);

  const hasResults = filteredItems.length > 0;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-white selection:bg-brand-lime selection:text-brand-bg pb-20">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-gray/50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mutual Action Plan</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-brand-lime font-mono text-sm tracking-wider">HOLOGRAM + RHINE GPS</span>
              </div>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-xs font-mono text-gray-400 mb-1">COMPLETION STATUS</div>
            </div>
          </div>
          <ProgressBar percentage={progress} />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-10 space-y-16">
        
        {/* Section 1: Vision */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-brand-lime"></div>
            <h2 className="text-sm font-mono text-brand-lime uppercase tracking-widest">01. Vision & Objective</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-brand-gray/20 to-transparent p-6 rounded-2xl border border-brand-gray/30">
              <div className="flex items-center gap-3 mb-4 text-brand-lime">
                <Target size={24} />
                <h3 className="font-bold text-lg text-white">Objective</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg">
                Enable Rhine's GPS tracker deployment in India and Nepal with Hologram's multi-carrier eSIM solution.
                Starting with <span className="text-brand-lime font-mono">1,000</span> units and scaling to <span className="text-brand-lime font-mono">10,000</span> within 6-10 months.
              </p>
            </div>

            <div className="bg-brand-gray/10 p-6 rounded-2xl border border-brand-gray/30">
               <div className="flex items-center gap-3 mb-4 text-brand-lime">
                <CheckCircle2 size={24} />
                <h3 className="font-bold text-lg text-white">Success Criteria</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Target pricing of ~$23 annual cost per SIM",
                  "AIS compliance and dual-profile capability",
                  "Validate 2G coverage (Airtel India / Ncell Nepal)",
                  "Successful prototype test with eSIM integration"
                ].map((crit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-gray flex-shrink-0" />
                    {crit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Action Items */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-brand-lime"></div>
              <h2 className="text-sm font-mono text-brand-lime uppercase tracking-widest">02. Action Items</h2>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select 
                  value={ownerFilter}
                  onChange={(e) => setOwnerFilter(e.target.value)}
                  className="appearance-none bg-brand-gray/20 border border-brand-gray text-sm rounded-full pl-4 pr-10 py-2 text-white focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime cursor-pointer min-w-[140px]"
                >
                  <option value="All">All Owners</option>
                  <option value="Hologram">Hologram</option>
                  <option value="Rhine">Rhine</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-brand-gray/20 border border-brand-gray text-sm rounded-full pl-4 pr-10 py-2 text-white focus:outline-none focus:border-brand-lime focus:ring-1 focus:ring-brand-lime cursor-pointer min-w-[140px]"
                >
                  <option value="All">All Status</option>
                  <option value={ActionStatus.PENDING}>Pending</option>
                  <option value={ActionStatus.COMPLETE}>Complete</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {!hasResults && (
              <div className="text-center py-12 border border-brand-gray/30 rounded-2xl bg-brand-gray/10 border-dashed">
                <Filter className="mx-auto text-gray-500 mb-2" size={32} />
                <p className="text-gray-400">No tasks match your filters.</p>
                <button 
                  onClick={() => { setOwnerFilter('All'); setStatusFilter('All'); }}
                  className="mt-4 text-sm text-brand-lime hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {Object.entries(groupedItems).map(([category, items]) => {
              const categoryItems = items as ActionItem[];
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="bg-brand-bg border border-brand-gray/30 rounded-2xl overflow-hidden shadow-2xl shadow-black">
                  <div className="px-6 py-4 bg-brand-gray/20 border-b border-brand-gray/30 flex justify-between items-center">
                    <h3 className="font-bold text-lg">{category}</h3>
                    <div className="hidden md:flex items-center gap-2 text-xs font-mono text-gray-400">
                      <Calendar size={12} />
                      {categoryItems[0]?.dueDate}
                    </div>
                  </div>
                  
                  {/* Table Header (Desktop) */}
                  <div className="hidden md:flex px-4 py-2 bg-black/40 text-xs font-mono text-gray-500 uppercase tracking-wider">
                    <div className="flex-1 pl-12">Task</div>
                    <div className="w-1/3 flex justify-end gap-16 pr-4">
                      <span>Owner</span>
                      <span>Status</span>
                    </div>
                  </div>

                  <div className="divide-y divide-brand-gray/20">
                    {categoryItems.map(item => (
                      <ActionRow key={item.id} item={item} onToggle={toggleAction} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: Key Requirements */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-[1px] bg-brand-lime"></div>
            <h2 className="text-sm font-mono text-brand-lime uppercase tracking-widest">03. Requirements Alignment</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REQUIREMENTS.map((req, idx) => (
              <div key={idx} className="group p-5 rounded-xl border border-brand-gray/30 bg-brand-gray/5 hover:bg-brand-gray/10 hover:border-brand-lime/30 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2 text-brand-lime">
                  {idx === 0 && <Zap size={18} />}
                  {idx === 1 && <Server size={18} />}
                  {idx === 2 && <Globe2 size={18} />}
                  {idx > 2 && <ShieldCheck size={18} />}
                  <h4 className="font-mono text-sm uppercase tracking-wide">{req.category}</h4>
                </div>
                <p className="text-lg font-medium text-white group-hover:text-brand-cyan transition-colors">
                  {req.details}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Decision Points & Footer */}
        <section className="bg-[#050A18] -mx-6 px-6 py-12 mt-12 border-t border-brand-gray/50">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="text-brand-lime">Next Steps</span> & Decisions
              </h3>
              <div className="space-y-6 relative border-l border-brand-gray ml-2 pl-6">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-brand-lime shadow-[0_0_8px_#bffd11]" />
                  <h4 className="font-mono text-sm text-gray-400 mb-1">MONTH 1</h4>
                  <p className="text-white text-lg">Prototype validation sign-off</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-brand-gray border border-gray-500" />
                  <h4 className="font-mono text-sm text-gray-400 mb-1">MONTH 2</h4>
                  <p className="text-white text-lg">Commercial contract finalization</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-brand-gray border border-gray-500" />
                  <h4 className="font-mono text-sm text-gray-400 mb-1">MONTH 3</h4>
                  <p className="text-white text-lg">Initial 1k batch deployment</p>
                </div>
              </div>
            </div>

            <div>
               <div className="bg-brand-lime/5 border border-brand-lime/20 rounded-2xl p-6">
                <h3 className="font-mono text-sm uppercase text-brand-lime mb-4">Team Contacts</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-brand-lime/10 pb-2">
                    <span className="text-white">Nicholas</span>
                    <span className="text-gray-400 font-mono text-sm">Hologram Lead</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-brand-lime/10 pb-2">
                    <span className="text-white">JaCorien</span>
                    <span className="text-gray-400 font-mono text-sm">Hologram Support</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-brand-lime/10 pb-2">
                    <span className="text-white">Rhine Team</span>
                    <span className="text-gray-400 font-mono text-sm">Product Owner</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsContactOpen(true)}
                  className="w-full mt-6 bg-brand-lime hover:bg-brand-lime/90 text-brand-bg font-bold py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2"
                >
                  Schedule Next Sync <ArrowRight size={18} />
                </button>
               </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-brand-gray/30 text-center text-gray-500 text-sm font-mono">
            &copy; {new Date().getFullYear()} Hologram Inc. Confidential Mutual Action Plan.
          </div>
        </section>
      </main>

      {/* Lightbox / Modal */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsContactOpen(false)}
          />
          <div className="relative w-full max-w-5xl h-[80vh] bg-brand-bg border border-brand-gray/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-brand-gray/30 bg-brand-gray/10">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-brand-lime animate-pulse" />
                 <span className="text-sm font-mono text-gray-300">Hologram Sales</span>
              </div>
              <div className="flex gap-2">
                <a 
                   href="https://www.hologram.io/contact-sales/" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="p-2 hover:bg-brand-gray/20 rounded-full text-gray-400 hover:text-white transition-colors"
                   title="Open in new tab"
                >
                  <ExternalLink size={20} />
                </a>
                <button 
                  onClick={() => setIsContactOpen(false)}
                  className="p-2 hover:bg-brand-gray/20 rounded-full text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Modal Content - Iframe */}
            <div className="flex-1 bg-white relative">
               <div className="absolute inset-0 flex items-center justify-center text-black/50 font-mono text-sm">
                  Loading Hologram Sales...
               </div>
               <iframe 
                 src="https://www.hologram.io/contact-sales/" 
                 className="w-full h-full relative z-10"
                 title="Contact Sales"
                 frameBorder="0"
               />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;