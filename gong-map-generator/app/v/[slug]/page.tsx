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

export default async function PublicMAPView({ params }: Props) {
  const { slug } = await params;
  const map = await getMAPBySlug(slug);

  if (!map) return notFound();

  const content = map.content as MAPContent;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-brand-lime/[0.03] blur-[120px]" />
        <div className="absolute -bottom-[30%] -left-[15%] w-[50%] h-[50%] rounded-full bg-brand-lime/[0.02] blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="border-b border-white/[0.06] bg-brand-bg/80 backdrop-blur-xl sticky top-0 z-20 animate-fade-in">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-wordmark.png" alt="Hologram" width={120} height={20} className="h-5 w-auto" />
          </div>
          <a
            href="https://www.hologram.io/contact-sales/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-brand-lime text-brand-bg font-semibold px-4 py-1.5 rounded-lg hover:bg-brand-lime-dim transition-all hover:shadow-[0_0_20px_rgba(193,246,23,0.3)] cursor-pointer"
          >
            Schedule a Meeting
          </a>
        </div>
      </nav>

      <div className="relative z-10 p-6 md:p-12 lg:py-16">
        {/* Hero Header */}
        <header className="max-w-4xl mx-auto mb-14 animate-fade-up">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 rounded-full bg-brand-lime animate-glow-pulse" />
                <span className="text-brand-lime font-semibold tracking-[0.2em] uppercase text-[10px]">
                  Mutual Action Plan
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-brand-lime/20 to-transparent max-w-24" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-white leading-[1.1]">
                {content.customerName}
                <span className="text-brand-lime mx-3 text-3xl md:text-4xl font-light">+</span>
                <span className="text-brand-white/80">Hologram</span>
              </h1>
            </div>
            <div className="px-4 py-2 glass-card rounded-lg text-brand-lime text-xs font-semibold tracking-wide uppercase shrink-0">
              {content.dealStage || 'Active Discovery'}
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-brand-lime/30 via-brand-border to-transparent mt-8" />
        </header>

        <main className="max-w-4xl mx-auto space-y-8">
          {/* North Star */}
          <section className="animate-fade-up stagger-1 glass-card gradient-border rounded-2xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-brand-lime/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-brand-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xs font-bold text-brand-lime uppercase tracking-[0.15em]">North Star Objective</h2>
              </div>
            </div>
            <p className="text-brand-text/90 leading-relaxed text-lg font-light">{content.northStar}</p>
          </section>

          {/* Interactive Progress Bar + Milestones */}
          <InteractiveMilestones
            milestones={content.milestones}
            slug={slug}
            customerName={content.customerName}
          />

          {/* Success Factors & Stakeholders */}
          <div className="grid md:grid-cols-2 gap-5 animate-fade-up stagger-4">
            <section className="glass-card gradient-border rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg bg-brand-lime/10 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-brand-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-[11px] font-bold text-brand-lime uppercase tracking-[0.15em]">
                  Success Factors
                </h3>
              </div>
              <ul className="space-y-3">
                {content.successFactors.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <span className="w-1 h-1 rounded-full bg-brand-lime/60 mt-2 shrink-0 group-hover:bg-brand-lime transition-colors" />
                    <span className="text-sm text-brand-text/70 leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="glass-card gradient-border rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg bg-brand-white/5 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-[11px] font-bold text-brand-muted uppercase tracking-[0.15em]">Key Stakeholders</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {content.stakeholders.map(
                  (s: { name: string; role: string; company: string }, i: number) => (
                    <span
                      key={i}
                      className="bg-white/[0.04] border border-white/[0.06] text-[11px] px-3 py-1.5 rounded-lg text-brand-text/80 hover:border-brand-lime/20 hover:bg-brand-lime/[0.04] transition-all cursor-default"
                    >
                      {s.name}
                      {s.role && <span className="text-brand-muted ml-1.5">/ {s.role}</span>}
                    </span>
                  )
                )}
              </div>
            </section>
          </div>

          {/* Risk Factors */}
          {content.riskFactors.length > 0 && (
            <section className="animate-fade-up stagger-5 glass-card gradient-border rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-[0.15em]">Risk Factors</h3>
              </div>
              <div className="space-y-4">
                {content.riskFactors.map((r: MAPRiskFactor, i: number) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <span
                      className={`text-[9px] px-2.5 py-1 rounded-md font-bold mt-0.5 uppercase tracking-wider ${
                        r.severity === 'high'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : r.severity === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {r.severity}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-brand-text/80 leading-relaxed">{r.description}</p>
                      {r.mitigation && (
                        <p className="text-xs text-brand-muted mt-1.5 flex items-center gap-1.5">
                          <span className="text-emerald-400/70">&#8594;</span> {r.mitigation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Schedule Meeting CTA */}
          <section className="animate-fade-up stagger-6 relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-lime/[0.08] via-brand-lime/[0.04] to-transparent" />
            <div className="relative glass-card border border-brand-lime/10 rounded-2xl p-8 md:p-10 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-brand-white mb-2">Ready to move forward?</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Schedule a meeting with the Hologram team to review this action plan and align on next steps.
                </p>
              </div>
              <a
                href="https://www.hologram.io/contact-sales/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-lime text-brand-bg font-bold px-8 py-3.5 rounded-xl text-sm hover:bg-brand-lime-dim transition-all hover:shadow-[0_0_30px_rgba(193,246,23,0.25)] active:scale-[0.98] shrink-0 flex items-center gap-2.5 cursor-pointer"
              >
                Schedule Meeting
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="max-w-4xl mx-auto mt-20 pt-8 border-t border-white/[0.04] text-center pb-8 animate-fade-in stagger-7">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Image src="/logo-mark.png" alt="Hologram" width={16} height={16} className="h-4 w-auto opacity-50" />
            <span className="text-brand-muted/60 font-medium text-xs">Hologram</span>
          </div>
          <p className="text-brand-slate text-[10px] tracking-wide">
            Powered by Hologram IoT
          </p>
        </footer>
      </div>
    </div>
  );
}
