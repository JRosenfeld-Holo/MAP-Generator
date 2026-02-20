'use client';

import { useState, useMemo } from 'react';
import type { MAPMilestone } from '@/lib/types';

interface Props {
  milestones: MAPMilestone[];
  slug: string;
  customerName: string;
}

export default function InteractiveMilestones({ milestones: initialMilestones, slug, customerName }: Props) {
  const [milestones, setMilestones] = useState(initialMilestones);

  const progress = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === 'complete').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }, [milestones]);

  async function toggleMilestone(index: number) {
    const newStatus = milestones[index].status === 'complete' ? 'pending' : 'complete';
    const updated = [...milestones];
    updated[index] = { ...updated[index], status: newStatus };
    setMilestones(updated);

    try {
      await fetch('/api/update-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, milestoneIndex: index, status: newStatus }),
      });
    } catch {
      setMilestones(milestones);
    }
  }

  return (
    <>
      {/* Progress Bar */}
      <section className="animate-fade-up stagger-2 glass-card gradient-border rounded-2xl p-7">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-lime/10 flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-brand-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-brand-lime uppercase tracking-[0.15em]">Plan Progress</h3>
          </div>
          <span className="text-xs text-brand-muted font-medium">
            <span className="text-brand-lime font-bold">{progress.completed}</span>
            <span className="mx-1 text-brand-slate">/</span>
            {progress.total} complete
          </span>
        </div>
        <div className="w-full h-2.5 bg-brand-bg rounded-full overflow-hidden relative">
          <div className="absolute inset-0 animate-shimmer rounded-full" />
          <div
            className="h-full rounded-full transition-all duration-700 ease-out relative"
            style={{
              width: `${progress.percent}%`,
              background: progress.percent > 0
                ? 'linear-gradient(90deg, #a8d914, #c1f617, #d4ff4a)'
                : 'transparent',
              boxShadow: progress.percent > 0 ? '0 0 20px rgba(193, 246, 23, 0.5), 0 0 4px rgba(193, 246, 23, 0.8)' : 'none',
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-1">
            {milestones.map((m, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  m.status === 'complete' ? 'bg-brand-lime' : 'bg-brand-border'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-brand-lime font-bold">{progress.percent}%</p>
        </div>
      </section>

      {/* Milestones */}
      <section className="animate-fade-up stagger-3">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-7 h-7 rounded-lg bg-brand-lime/10 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-brand-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xs font-bold text-brand-lime uppercase tracking-[0.15em]">Strategic Milestones</h2>
          <span className="h-px flex-1 bg-gradient-to-r from-brand-border to-transparent" />
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-brand-lime/30 via-brand-border to-transparent" />

          <div className="space-y-3">
            {milestones.map((m, i) => {
              const isComplete = m.status === 'complete';
              return (
                <div
                  key={i}
                  className={`relative rounded-xl transition-all duration-300 ${
                    isComplete
                      ? 'glass-card border-brand-lime/15'
                      : 'glass-card hover:border-white/10'
                  }`}
                  style={{
                    borderColor: isComplete ? 'rgba(193, 246, 23, 0.15)' : undefined,
                  }}
                >
                  {isComplete && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-lime/[0.04] to-transparent pointer-events-none" />
                  )}
                  <div className="relative p-5 flex items-start gap-4">
                    {/* Timeline node + checkbox */}
                    <button
                      onClick={() => toggleMilestone(i)}
                      className="relative z-10 shrink-0 cursor-pointer transition-all duration-300 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-brand-lime/10"
                      aria-label={isComplete ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {isComplete ? (
                        <svg className="w-6 h-6 text-brand-lime drop-shadow-[0_0_6px_rgba(193,246,23,0.5)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-brand-slate hover:text-brand-lime/50 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0 pt-1.5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                        <h3 className={`font-semibold text-[15px] leading-snug transition-all duration-300 ${
                          isComplete ? 'text-brand-muted line-through decoration-brand-lime/30' : 'text-brand-white'
                        }`}>
                          {m.title}
                        </h3>
                        {m.targetDate && (
                          <span className="text-[10px] text-brand-muted uppercase tracking-wider shrink-0 font-medium bg-white/[0.03] px-2.5 py-1 rounded-md">
                            {new Date(m.targetDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed mb-3 transition-all duration-300 ${
                        isComplete ? 'text-brand-slate' : 'text-brand-muted'
                      }`}>
                        {m.description}
                      </p>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-md ${
                        m.owner === 'Hologram'
                          ? 'bg-brand-lime/8 text-brand-lime/80 border border-brand-lime/10'
                          : m.owner === 'Joint'
                            ? 'bg-white/[0.04] text-brand-text/50 border border-white/[0.06]'
                            : 'bg-blue-500/8 text-blue-400/80 border border-blue-500/10'
                      }`}>
                        <span className={`w-1 h-1 rounded-full ${
                          m.owner === 'Hologram' ? 'bg-brand-lime/60' : m.owner === 'Joint' ? 'bg-brand-muted/60' : 'bg-blue-400/60'
                        }`} />
                        {m.owner === 'Customer' ? customerName : m.owner}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
