import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getMAPBySlug } from '@/lib/supabase';
import type { MAPContent, MAPRiskFactor } from '@/lib/types';
import InteractiveMilestones from './interactive-milestones';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const map = await getMAPBySlug(slug);

  if (!map) return { title: 'MAP Not Found' };

  const content = map.content as MAPContent;
  return {
    title: `${content.customerName} + Hologram | Mutual Action Plan`,
    description: content.northStar,
    openGraph: {
      title: `${content.customerName} + Hologram — Mutual Action Plan`,
      description: content.northStar,
      type: 'website',
    },
  };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  'bg-brand-lime/20 text-brand-lime border-brand-lime/20',
  'bg-blue-500/15 text-blue-300 border-blue-500/20',
  'bg-violet-500/15 text-violet-300 border-violet-500/20',
  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'bg-amber-500/15 text-amber-300 border-amber-500/20',
  'bg-rose-500/15 text-rose-300 border-rose-500/20',
];

export default async function PublicMAPView({ params }: Props) {
  const { slug } = await params;
  const map = await getMAPBySlug(slug);

  if (!map) return notFound();

  const content = map.content as MAPContent;

  const milestoneDates = [...content.milestones]
    .filter((m) => m.targetDate)
    .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());

  const firstDate = milestoneDates[0]?.targetDate;
  const lastDate = milestoneDates[milestoneDates.length - 1]?.targetDate;

  const fmtShort = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return `${dt.toLocaleDateString('en-US', { month: 'short' })} '${String(dt.getFullYear()).slice(2)}`;
  };

  const fmtLong = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  const hasRisks = content.riskFactors.length > 0;
  let sectionNum = 1;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text relative overflow-x-hidden">
      {/* Dot grid texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(193,246,23,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden="true"
      />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90%] h-[55vh] rounded-full bg-brand-lime/[0.035] blur-[160px]" />
        <div className="absolute bottom-0 right-[-10%] w-[50%] h-[40vh] rounded-full bg-brand-lime/[0.02] blur-[120px]" />
      </div>

      {/* ── STICKY NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 border-b border-white/[0.05] bg-brand-bg/90 backdrop-blur-xl animate-fade-in">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/logo-wordmark.png"
              alt="Hologram"
              width={110}
              height={18}
              className="h-[18px] w-auto shrink-0"
            />
            <span className="text-brand-border/60 hidden sm:block">|</span>
            <span className="text-[10px] font-mono text-brand-muted uppercase tracking-[0.18em] hidden sm:block truncate">
              Mutual Action Plan
            </span>
          </div>
          <a
            href="https://www.hologram.io/contact-sales/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[11px] bg-brand-lime text-brand-bg font-bold px-4 py-2 rounded-lg hover:bg-brand-lime-dim transition-all hover:shadow-[0_0_24px_rgba(193,246,23,0.35)] cursor-pointer"
          >
            Book a Meeting
          </a>
        </div>
      </nav>

      <div className="relative z-10">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <header className="max-w-5xl mx-auto px-6 pt-14 pb-12 animate-fade-up">
          {/* MAP label */}
          <div className="flex items-center justify-center gap-3 mb-12">
            <span className="h-px w-20 bg-gradient-to-r from-transparent to-brand-lime/25" />
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-glow-pulse" />
              <span className="font-mono text-[9px] text-brand-lime uppercase tracking-[0.35em]">
                Mutual Action Plan
              </span>
            </div>
            <span className="h-px w-20 bg-gradient-to-l from-transparent to-brand-lime/25" />
          </div>

          {/* Partnership headline */}
          <div className="text-center mb-10">
            <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold tracking-tight leading-[1.0] text-brand-white">
              {content.customerName}
            </h1>
            <div className="flex items-center justify-center gap-5 my-4">
              <span className="h-px flex-1 max-w-28 bg-gradient-to-r from-transparent to-brand-border" />
              <span className="text-[clamp(1.5rem,4vw,2.5rem)] text-brand-lime/50 font-extralight">+</span>
              <span className="h-px flex-1 max-w-28 bg-gradient-to-l from-transparent to-brand-border" />
            </div>
            <div className="flex items-center justify-center opacity-40" style={{ height: 'clamp(2.5rem, 8vw, 5.5rem)' }}>
              <Image
                src="/logo-wordmark.png"
                alt="Hologram"
                width={660}
                height={108}
                style={{ height: 'clamp(2.5rem, 8vw, 5.5rem)', width: 'auto' }}
                className="object-contain"
              />
            </div>
          </div>

          {/* Metadata chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {content.dealStage && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[10px] font-mono font-bold uppercase tracking-[0.15em]">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-glow-pulse" />
                {content.dealStage}
              </span>
            )}
            {content.aeName && (
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-brand-muted uppercase tracking-[0.12em]">
                AE:{' '}
                <span className="text-brand-text/80">{content.aeName}</span>
              </span>
            )}
            {content.generatedAt && (
              <span className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-brand-muted uppercase tracking-[0.12em]">
                {fmtLong(content.generatedAt)}
              </span>
            )}
          </div>

          {/* Milestone timeline strip */}
          {milestoneDates.length >= 2 && (
            <div className="mt-12 px-2 sm:px-8">
              <div className="flex items-center gap-0">
                <span className="text-[9px] font-mono text-brand-slate uppercase tracking-wider shrink-0 mr-3">
                  {fmtShort(firstDate!)}
                </span>
                <div className="relative flex-1 flex items-center">
                  {/* Track line */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-brand-border" />
                  {/* Milestone dots */}
                  {milestoneDates.map((m, i) => {
                    const pct =
                      i === 0
                        ? 0
                        : i === milestoneDates.length - 1
                          ? 100
                          : (i / (milestoneDates.length - 1)) * 100;
                    const isComplete = m.status === 'complete';
                    const isInProgress = m.status === 'in_progress';
                    return (
                      <div
                        key={i}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-default"
                        style={{ left: `${pct}%` }}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                            isComplete
                              ? 'bg-brand-lime border-brand-lime shadow-[0_0_8px_rgba(193,246,23,0.7)]'
                              : isInProgress
                                ? 'bg-amber-400/40 border-amber-400/70'
                                : i === 0 || i === milestoneDates.length - 1
                                  ? 'bg-brand-bg border-brand-lime/30'
                                  : 'bg-brand-bg border-brand-border'
                          }`}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          <div className="bg-brand-card border border-brand-border rounded-lg px-3 py-1.5 shadow-xl whitespace-nowrap">
                            <p className="text-[10px] font-semibold text-brand-white">{m.title}</p>
                            {m.targetDate && (
                              <p className="text-[9px] font-mono text-brand-muted mt-0.5">
                                {fmtShort(m.targetDate)}
                              </p>
                            )}
                          </div>
                          <div className="w-1.5 h-1.5 bg-brand-card border-r border-b border-brand-border rotate-45 mx-auto -mt-0.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <span className="text-[9px] font-mono text-brand-slate uppercase tracking-wider shrink-0 ml-3">
                  {fmtShort(lastDate!)}
                </span>
              </div>
              <p className="text-center text-[9px] font-mono text-brand-slate/60 uppercase tracking-[0.2em] mt-3">
                {milestoneDates.length}-milestone engagement
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="mt-12 h-px bg-gradient-to-r from-transparent via-brand-lime/15 to-transparent" />
        </header>

        <main className="max-w-5xl mx-auto px-6 pb-24 space-y-5">
          {/* ── NORTH STAR ──────────────────────────────────────────────────── */}
          <section className="animate-fade-up stagger-1">
            <SectionLabel num={sectionNum++} label="Shared Vision" />
            <div className="relative rounded-2xl overflow-hidden mt-4">
              {/* Left lime border */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-brand-lime via-brand-lime/60 to-transparent rounded-l-2xl" />
              <div className="glass-card rounded-2xl pl-10 pr-8 py-10 md:py-12">
                <svg
                  className="w-8 h-8 text-brand-lime/20 mb-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-xl md:text-2xl font-light italic text-brand-white/90 leading-relaxed">
                  {content.northStar}
                </p>
                <div className="flex items-center gap-2.5 mt-6">
                  <span className="w-6 h-px bg-brand-lime/40" />
                  <span className="text-[9px] font-mono text-brand-lime/50 uppercase tracking-[0.25em]">
                    North Star Objective
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ── MILESTONES ──────────────────────────────────────────────────── */}
          <section className="animate-fade-up stagger-2">
            <SectionLabel num={sectionNum++} label="Strategic Milestones" />
            <div className="mt-4">
              <InteractiveMilestones
                milestones={content.milestones}
                slug={slug}
                customerName={content.customerName}
              />
            </div>
          </section>

          {/* ── SUCCESS FACTORS & STAKEHOLDERS ─────────────────────────────── */}
          <div className="animate-fade-up stagger-4">
            <SectionLabel num={sectionNum++} label="Success & Team" />
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {/* Success factors */}
              <section className="glass-card gradient-border rounded-2xl p-7">
                <h3 className="text-[9px] font-mono font-bold text-brand-lime uppercase tracking-[0.25em] mb-6">
                  Success Factors
                </h3>
                <ol className="space-y-5">
                  {content.successFactors.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="text-[10px] font-mono font-bold text-brand-lime/35 tabular-nums shrink-0 pt-0.5 w-5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm text-brand-text/75 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Stakeholders */}
              <section className="glass-card gradient-border rounded-2xl p-7">
                <h3 className="text-[9px] font-mono font-bold text-brand-muted uppercase tracking-[0.25em] mb-6">
                  Key Stakeholders
                </h3>
                <div className="space-y-3.5">
                  {content.stakeholders.map(
                    (s: { name: string; role: string; company: string }, i: number) => (
                      <div key={i} className="flex items-center gap-3 group">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0 border ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                        >
                          {getInitials(s.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-brand-text leading-tight truncate">
                            {s.name}
                          </p>
                          {(s.role || s.company) && (
                            <p className="text-[10px] font-mono text-brand-muted truncate mt-0.5">
                              {s.role}
                              {s.role && s.company && ' · '}
                              {s.company}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* ── RISK FACTORS ────────────────────────────────────────────────── */}
          {hasRisks && (
            <section className="animate-fade-up stagger-5">
              <SectionLabel num={sectionNum++} label="Risk & Mitigation" />
              <div className="glass-card gradient-border rounded-2xl p-7 mt-4 space-y-5">
                {content.riskFactors.map((r: MAPRiskFactor, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <span
                      className={`shrink-0 mt-px text-[9px] px-2.5 py-1 rounded-md font-mono font-bold uppercase tracking-wider whitespace-nowrap ${
                        r.severity === 'high'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : r.severity === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {r.severity}
                    </span>
                    <div>
                      <p className="text-sm text-brand-text/80 leading-relaxed">{r.description}</p>
                      {r.mitigation && (
                        <p className="text-xs text-brand-muted mt-1.5 flex items-center gap-1.5">
                          <span className="text-emerald-400/60 text-base leading-none">→</span>
                          {r.mitigation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── CTA ─────────────────────────────────────────────────────────── */}
          <section className="animate-fade-up stagger-6 pt-4">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-lime/[0.09] via-brand-lime/[0.04] to-transparent" />
              <div className="absolute inset-0 border border-brand-lime/15 rounded-2xl" />
              <div className="relative p-8 md:p-12 flex flex-col sm:flex-row items-center gap-8">
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[9px] font-mono text-brand-lime uppercase tracking-[0.3em] mb-2">
                    Next Step
                  </p>
                  <h3 className="text-2xl md:text-3xl font-bold text-brand-white mb-3 leading-tight">
                    Ready to move forward?
                  </h3>
                  <p className="text-sm text-brand-muted leading-relaxed max-w-sm">
                    Schedule time with the Hologram team to review this plan, align on priorities,
                    and accelerate your path to go-live.
                  </p>
                </div>
                <a
                  href="https://www.hologram.io/contact-sales/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group shrink-0 bg-brand-lime text-brand-bg font-bold px-8 py-4 rounded-xl text-sm hover:bg-brand-lime-dim transition-all hover:shadow-[0_0_40px_rgba(193,246,23,0.3)] active:scale-[0.98] flex items-center gap-2.5 cursor-pointer"
                >
                  Book a Meeting
                  <svg
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="max-w-5xl mx-auto px-6 pb-12 mt-2 pt-8 border-t border-white/[0.04] text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Image
              src="/logo-mark.png"
              alt="Hologram"
              width={14}
              height={14}
              className="h-3.5 w-auto opacity-30"
            />
            <span className="text-brand-slate/60 font-semibold text-[11px] tracking-wide">Hologram</span>
          </div>
          <p className="text-brand-slate/40 text-[9px] font-mono tracking-[0.2em] uppercase">
            IoT Connectivity for the Modern Era
          </p>
        </footer>
      </div>
    </div>
  );
}

function SectionLabel({ num, label }: { num: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-mono text-brand-slate/60 tabular-nums w-5 shrink-0">
        {String(num).padStart(2, '0')}
      </span>
      <span className="h-px flex-1 bg-brand-border/60" />
      <span className="text-[9px] font-mono text-brand-slate/60 uppercase tracking-[0.25em] shrink-0">
        {label}
      </span>
    </div>
  );
}
