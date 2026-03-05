'use client';

import { useState, useMemo } from 'react';
import type { MAPMilestone } from '@/lib/types';

interface Props {
  milestones: MAPMilestone[];
  slug: string;
  customerName: string;
}

function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const OWNER_CONFIG: Record<string, { badge: string; dot: string; label?: string }> = {
  Hologram: {
    badge: 'bg-brand-lime/[0.08] text-brand-lime/75 border-brand-lime/15',
    dot: 'bg-brand-lime/50',
  },
  Customer: {
    badge: 'bg-blue-500/[0.08] text-blue-400/80 border-blue-500/15',
    dot: 'bg-blue-400/50',
  },
  Joint: {
    badge: 'bg-white/[0.04] text-brand-muted border-white/[0.06]',
    dot: 'bg-brand-muted/40',
  },
};

export default function InteractiveMilestones({
  milestones: initialMilestones,
  slug,
  customerName,
}: Props) {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [optimistic, setOptimistic] = useState<Record<number, boolean>>({});

  const progress = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter((m) => m.status === 'complete').length;
    const inProgress = milestones.filter((m) => m.status === 'in_progress').length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, inProgress, total, percent };
  }, [milestones]);

  async function toggleMilestone(index: number) {
    const newStatus = milestones[index].status === 'complete' ? 'pending' : 'complete';
    const updated = milestones.map((m, i) => (i === index ? { ...m, status: newStatus as MAPMilestone['status'] } : m));
    setMilestones(updated);
    setOptimistic((p) => ({ ...p, [index]: true }));

    try {
      await fetch('/api/update-milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, milestoneIndex: index, status: newStatus }),
      });
    } catch {
      setMilestones(milestones);
    } finally {
      setOptimistic((p) => ({ ...p, [index]: false }));
    }
  }

  return (
    <>
      {/* ── PROGRESS HEADER ─────────────────────────────────────────────── */}
      <div className="glass-card gradient-border rounded-2xl p-6 mb-3">
        <div className="flex items-center justify-between mb-4">
          {/* Big % KPI */}
          <div className="flex items-end gap-3">
            <span
              className="text-4xl font-extrabold tabular-nums leading-none"
              style={{ color: progress.percent > 0 ? '#c1f617' : undefined }}
            >
              {progress.percent}
              <span className="text-xl font-medium text-brand-muted/60">%</span>
            </span>
            <div className="pb-0.5">
              <p className="text-xs font-medium text-brand-text/70 leading-tight">
                {progress.completed} of {progress.total} complete
              </p>
              {progress.inProgress > 0 && (
                <p className="text-[10px] font-mono text-amber-400/80 mt-0.5">
                  {progress.inProgress} in progress
                </p>
              )}
            </div>
          </div>

          {/* Segment dots */}
          <div className="flex items-center gap-1">
            {milestones.map((m, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-500 ${
                  m.status === 'complete'
                    ? 'w-5 h-1.5 bg-brand-lime shadow-[0_0_6px_rgba(193,246,23,0.6)]'
                    : m.status === 'in_progress'
                      ? 'w-3 h-1.5 bg-amber-400/60'
                      : 'w-2 h-1.5 bg-brand-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-brand-bg rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress.percent}%`,
              background:
                progress.percent > 0
                  ? 'linear-gradient(90deg, #a8d914, #c1f617, #d4ff4a)'
                  : 'transparent',
              boxShadow:
                progress.percent > 0 ? '0 0 12px rgba(193,246,23,0.5)' : 'none',
            }}
          />
        </div>
      </div>

      {/* ── MILESTONE LIST ──────────────────────────────────────────────── */}
      <div className="space-y-2">
        {milestones.map((m, i) => {
          const isComplete = m.status === 'complete';
          const isInProgress = m.status === 'in_progress';
          const ownerKey = m.owner in OWNER_CONFIG ? m.owner : 'Joint';
          const ownerCfg = OWNER_CONFIG[ownerKey];
          const ownerLabel = m.owner === 'Customer' ? customerName : m.owner;
          const isPending = optimistic[i];

          return (
            <div
              key={i}
              className={`group relative rounded-2xl transition-all duration-300 border ${
                isComplete
                  ? 'bg-brand-lime/[0.03] border-brand-lime/10'
                  : isInProgress
                    ? 'bg-amber-500/[0.03] border-amber-500/10'
                    : 'glass-card hover:border-white/[0.08]'
              }`}
            >
              {/* Completed tint */}
              {isComplete && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-lime/[0.03] to-transparent pointer-events-none" />
              )}

              <div className="relative flex items-start gap-4 p-5 md:p-6">
                {/* Left: number + checkbox */}
                <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5">
                  <span className="text-[9px] font-mono text-brand-slate/50 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <button
                    onClick={() => !isPending && toggleMilestone(i)}
                    disabled={isPending}
                    aria-label={isComplete ? 'Mark as incomplete' : 'Mark as complete'}
                    className="relative w-8 h-8 flex items-center justify-center rounded-xl hover:bg-brand-lime/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isComplete
                          ? 'bg-brand-lime border-brand-lime shadow-[0_0_10px_rgba(193,246,23,0.5)]'
                          : isInProgress
                            ? 'border-amber-400/60'
                            : 'border-brand-border group-hover:border-brand-slate'
                      }`}
                    >
                      {isComplete && (
                        <svg
                          className="w-3 h-3 text-brand-bg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {isInProgress && (
                        <div className="w-2 h-2 rounded-full bg-amber-400/80" />
                      )}
                    </div>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <h3
                      className={`font-semibold text-[15px] leading-snug transition-all duration-300 ${
                        isComplete
                          ? 'text-brand-muted line-through decoration-brand-lime/25 decoration-1'
                          : 'text-brand-white'
                      }`}
                    >
                      {m.title}
                    </h3>
                    {m.targetDate && (
                      <span className="text-[10px] font-mono text-brand-muted bg-white/[0.03] border border-white/[0.04] px-2.5 py-1 rounded-md tabular-nums shrink-0">
                        {fmtDate(m.targetDate)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p
                    className={`text-sm leading-relaxed mb-4 transition-all duration-300 ${
                      isComplete ? 'text-brand-slate' : 'text-brand-muted'
                    }`}
                  >
                    {m.description}
                  </p>

                  {/* Owner badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-md border ${ownerCfg.badge}`}
                  >
                    <span className={`w-1 h-1 rounded-full ${ownerCfg.dot}`} />
                    {ownerLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
