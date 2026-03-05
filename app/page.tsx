'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Search,
  Loader2,
  Target,
  AlertTriangle,
  CheckCircle2,
  Users,
  Link2,
  ChevronDown,
  Sparkles,
  X,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  ArrowRight,
  Circle,
  CircleCheck,
  UserPlus,
  LogOut,
} from 'lucide-react';
import type { GongAccount, MAPContent, MAPMilestone, MAPRiskFactor } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import InviteModal from '@/components/InviteModal';
import ManageUsersModal from '@/components/ManageUsersModal';

type Step = 'select' | 'generating' | 'editing' | 'publishing' | 'done';

const STEPS: { key: Step; label: string }[] = [
  { key: 'select', label: 'Select' },
  { key: 'generating', label: 'Generate' },
  { key: 'editing', label: 'Edit' },
  { key: 'done', label: 'Publish' },
];

export default function AdminDashboard() {
  const { isAdmin, signOut } = useAuth();
  const [aeEmail, setAeEmail] = useState('');
  const [aeName, setAeName] = useState('');
  const [accounts, setAccounts] = useState<GongAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<GongAccount | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [mapContent, setMapContent] = useState<MAPContent | null>(null);
  const [step, setStep] = useState<Step>('select');
  const [error, setError] = useState('');
  const [publishedUrl, setPublishedUrl] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [copied, setCopied] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.toLowerCase();
    return accounts.filter(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
    );
  }, [accounts, searchQuery]);

  // Progress calculation
  const progress = useMemo(() => {
    if (!mapContent?.milestones.length) return { completed: 0, total: 0, percent: 0 };
    const total = mapContent.milestones.length;
    const completed = mapContent.milestones.filter((m) => m.status === 'complete').length;
    return { completed, total, percent: Math.round((completed / total) * 100) };
  }, [mapContent?.milestones]);

  // Step index for breadcrumb
  const currentStepIndex = useMemo(() => {
    if (step === 'publishing') return STEPS.findIndex((s) => s.key === 'editing');
    return STEPS.findIndex((s) => s.key === step);
  }, [step]);

  useEffect(() => {
    if (isDropdownOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
      setHighlightedIndex(-1);
    } else {
      setSearchQuery('');
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [isDropdownOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-account-item]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleDropdownKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredAccounts.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredAccounts.length - 1
        );
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const target = highlightedIndex >= 0 ? filteredAccounts[highlightedIndex] : filteredAccounts.length === 1 ? filteredAccounts[0] : null;
        if (target) {
          setSelectedAccount(target);
          setCustomerName(target.name);
          setIsDropdownOpen(false);
        }
      }
    },
    [filteredAccounts, highlightedIndex]
  );

  async function fetchAccounts() {
    if (!aeEmail.trim()) return;
    setLoadingAccounts(true);
    setError('');
    try {
      const res = await fetch('/api/gong/calls');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAccounts(data.accounts);
      if (data.accounts.length === 0) {
        setError('No accounts found. Check your Gong API configuration.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function generateMAP() {
    if (!selectedAccount) return;
    setStep('generating');
    setError('');
    try {
      const res = await fetch('/api/generate-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callIds: selectedAccount.callIds,
          customerName: customerName || selectedAccount.name,
          aeName: aeName || 'Account Executive',
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMapContent(data.content);
      setStep('editing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate MAP');
      setStep('select');
    }
  }

  async function publishMAP() {
    if (!mapContent || !selectedAccount) return;
    setStep('publishing');
    setError('');
    try {
      const res = await fetch('/api/publish-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: mapContent,
          customerName: customerName || selectedAccount.name,
          gongCallId: selectedAccount.callIds[0],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPublishedUrl(`${window.location.origin}${data.url}`);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish MAP');
      setStep('editing');
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function updateNorthStar(value: string) {
    if (!mapContent) return;
    setMapContent({ ...mapContent, northStar: value });
  }

  function updateMilestone(index: number, field: keyof MAPMilestone, value: string) {
    if (!mapContent) return;
    const milestones = [...mapContent.milestones];
    milestones[index] = { ...milestones[index], [field]: value };
    setMapContent({ ...mapContent, milestones });
  }

  function toggleMilestoneComplete(index: number) {
    if (!mapContent) return;
    const milestones = [...mapContent.milestones];
    milestones[index] = {
      ...milestones[index],
      status: milestones[index].status === 'complete' ? 'pending' : 'complete',
    };
    setMapContent({ ...mapContent, milestones });
  }

  function addMilestone() {
    if (!mapContent) return;
    setMapContent({
      ...mapContent,
      milestones: [
        ...mapContent.milestones,
        { title: '', description: '', owner: 'Joint', targetDate: '', status: 'pending' as const },
      ],
    });
  }

  function removeMilestone(index: number) {
    if (!mapContent) return;
    setMapContent({
      ...mapContent,
      milestones: mapContent.milestones.filter((_, i) => i !== index),
    });
  }

  function updateRisk(index: number, field: keyof MAPRiskFactor, value: string) {
    if (!mapContent) return;
    const riskFactors = [...mapContent.riskFactors];
    riskFactors[index] = { ...riskFactors[index], [field]: value };
    setMapContent({ ...mapContent, riskFactors });
  }

  function addRisk() {
    if (!mapContent) return;
    setMapContent({
      ...mapContent,
      riskFactors: [
        ...mapContent.riskFactors,
        { description: '', severity: 'medium' as const, mitigation: '' },
      ],
    });
  }

  function removeRisk(index: number) {
    if (!mapContent) return;
    setMapContent({
      ...mapContent,
      riskFactors: mapContent.riskFactors.filter((_, i) => i !== index),
    });
  }

  function updateSuccessFactor(index: number, value: string) {
    if (!mapContent) return;
    const successFactors = [...mapContent.successFactors];
    successFactors[index] = value;
    setMapContent({ ...mapContent, successFactors });
  }

  function addSuccessFactor() {
    if (!mapContent) return;
    setMapContent({
      ...mapContent,
      successFactors: [...mapContent.successFactors, ''],
    });
  }

  function removeSuccessFactor(index: number) {
    if (!mapContent) return;
    setMapContent({
      ...mapContent,
      successFactors: mapContent.successFactors.filter((_, i) => i !== index),
    });
  }

  function updateStakeholder(index: number, field: 'name' | 'role' | 'company', value: string) {
    if (!mapContent) return;
    const stakeholders = [...mapContent.stakeholders];
    stakeholders[index] = { ...stakeholders[index], [field]: value };
    setMapContent({ ...mapContent, stakeholders });
  }

  function addStakeholder() {
    if (!mapContent) return;
    setMapContent({
      ...mapContent,
      stakeholders: [...mapContent.stakeholders, { name: '', role: '', company: '' }],
    });
  }

  function removeStakeholder(index: number) {
    if (!mapContent) return;
    setMapContent({
      ...mapContent,
      stakeholders: mapContent.stakeholders.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="border-b border-brand-border sticky top-0 z-20 bg-brand-bg/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo-wordmark.png" alt="Hologram" width={120} height={20} className="h-5 w-auto" />
            <span className="text-brand-muted text-sm ml-1">/</span>
            <span className="text-brand-muted text-sm">MAP Generator</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => setIsInviteOpen(true)}
                  className="flex items-center gap-1.5 text-xs bg-brand-lime/10 hover:bg-brand-lime/20 text-brand-lime border border-brand-lime/20 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Invite</span>
                </button>
                <button
                  onClick={() => setIsManageOpen(true)}
                  className="flex items-center gap-1.5 text-xs text-brand-muted border border-brand-border px-3 py-1.5 rounded-lg hover:bg-brand-card transition-colors cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Users</span>
                </button>
              </>
            )}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-white px-3 py-1.5 rounded-lg hover:bg-brand-card transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="p-4 md:p-8 lg:px-12 lg:py-10">
        {/* Header */}
        <header className="max-w-6xl mx-auto mb-10">
          <p className="text-brand-lime font-medium tracking-wide uppercase text-[11px] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-lime" />
            Mutual Action Plan Studio
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-brand-white">
            Generate. Collaborate. Close.
          </h1>
          <p className="text-brand-muted mt-2 text-sm max-w-lg">
            Transform Gong call transcripts into structured, shareable action plans powered by AI.
          </p>
        </header>

        <main className="max-w-6xl mx-auto space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center gap-1 text-xs">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1">
                {i > 0 && <div className={`w-8 h-px ${i <= currentStepIndex ? 'bg-brand-lime' : 'bg-brand-border'}`} />}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${i === currentStepIndex
                  ? 'bg-brand-lime/15 text-brand-lime font-semibold'
                  : i < currentStepIndex
                    ? 'text-brand-lime/60'
                    : 'text-brand-slate'
                  }`}>
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${i < currentStepIndex
                    ? 'bg-brand-lime/20 text-brand-lime'
                    : i === currentStepIndex
                      ? 'bg-brand-lime text-brand-bg'
                      : 'bg-brand-border text-brand-slate'
                    }`}>
                    {i < currentStepIndex ? '✓' : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
              <button onClick={() => setError('')} className="ml-auto p-2 rounded hover:bg-red-500/20 cursor-pointer transition-colors" aria-label="Dismiss error">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 1: Customer Selection */}
          <section className="bg-brand-card border border-brand-border rounded-xl p-6 md:p-8">
            <h2 className="text-sm font-semibold mb-6 flex items-center gap-2 text-brand-white">
              <Search className="w-4 h-4 text-brand-lime" />
              Select Customer Account
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="ae-email" className="block text-[11px] text-brand-muted mb-1.5 uppercase tracking-wider font-medium">
                  Your Email
                </label>
                <input
                  id="ae-email"
                  type="email"
                  value={aeEmail}
                  onChange={(e) => setAeEmail(e.target.value)}
                  placeholder="ae@hologram.io"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-white placeholder:text-brand-slate focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all"
                />
              </div>
              <div>
                <label htmlFor="ae-name" className="block text-[11px] text-brand-muted mb-1.5 uppercase tracking-wider font-medium">
                  Your Name
                </label>
                <input
                  id="ae-name"
                  type="text"
                  value={aeName}
                  onChange={(e) => setAeName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-white placeholder:text-brand-slate focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all"
                />
              </div>
            </div>

            <button
              onClick={fetchAccounts}
              disabled={loadingAccounts || !aeEmail.trim()}
              className="bg-brand-lime text-brand-bg font-semibold px-5 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-brand-lime-dim active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 mb-6"
            >
              {loadingAccounts ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Fetch Accounts from Gong
            </button>

            {/* Searchable Account Dropdown */}
            {accounts.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <label htmlFor="account-search" className="block text-[11px] text-brand-muted mb-1.5 uppercase tracking-wider font-medium">
                  Select Account ({accounts.length})
                </label>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm text-left flex items-center justify-between cursor-pointer hover:border-brand-lime/30 focus:outline-none focus:ring-2 focus:ring-brand-lime/20 transition-all"
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="listbox"
                >
                  {selectedAccount ? (
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-brand-white font-medium truncate">{selectedAccount.name}</span>
                      <span className="text-brand-muted text-xs shrink-0">
                        {new Date(selectedAccount.latestCallDate).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] bg-brand-lime/15 text-brand-lime px-2 py-0.5 rounded shrink-0">
                        {selectedAccount.dealStage}
                      </span>
                    </div>
                  ) : (
                    <span className="text-brand-slate">Search or choose an account...</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-brand-bg-light border border-brand-border rounded-lg shadow-2xl overflow-hidden">
                    <div className="p-2 border-b border-brand-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-muted" />
                        <input
                          id="account-search"
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setHighlightedIndex(-1);
                          }}
                          placeholder="Search by name or email..."
                          className="w-full bg-brand-bg border border-brand-border rounded-lg pl-9 pr-3 py-2 text-sm text-brand-white placeholder:text-brand-slate focus:outline-none focus:border-brand-lime/40 transition-all"
                          onKeyDown={handleDropdownKeyDown}
                          role="combobox"
                          aria-expanded={isDropdownOpen}
                          aria-controls="account-listbox"
                          aria-activedescendant={highlightedIndex >= 0 ? `account-${highlightedIndex}` : undefined}
                        />
                      </div>
                    </div>
                    <div ref={listRef} className="max-h-64 overflow-y-auto" role="listbox" id="account-listbox">
                      {filteredAccounts.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-brand-muted text-center">
                          No accounts match &quot;{searchQuery}&quot;
                        </p>
                      ) : (
                        filteredAccounts.map((account, idx) => (
                          <button
                            key={account.email}
                            id={`account-${idx}`}
                            data-account-item
                            role="option"
                            aria-selected={highlightedIndex === idx}
                            onClick={() => {
                              setSelectedAccount(account);
                              setCustomerName(account.name);
                              setIsDropdownOpen(false);
                            }}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                            className={`w-full px-4 py-3 text-left cursor-pointer transition-colors flex items-center justify-between border-b border-brand-border last:border-b-0 ${highlightedIndex === idx ? 'bg-brand-card-hover' : 'hover:bg-brand-card-hover'
                              }`}
                          >
                            <div className="min-w-0">
                              <p className="text-sm text-brand-white font-medium truncate">{account.name}</p>
                              <p className="text-xs text-brand-muted truncate">{account.email}</p>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="text-xs text-brand-muted">
                                {new Date(account.latestCallDate).toLocaleDateString()}
                              </p>
                              <p className="text-[10px] text-brand-muted">
                                {account.callIds.length} call{account.callIds.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedAccount && step === 'select' && (
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="customer-name" className="block text-[11px] text-brand-muted mb-1.5 uppercase tracking-wider font-medium">
                    Company Name
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Cadence"
                    className="w-full max-w-sm bg-brand-bg border border-brand-border rounded-lg px-4 py-2.5 text-sm text-brand-white placeholder:text-brand-slate focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/20 transition-all"
                  />
                  <p className="text-[10px] text-brand-slate mt-1">Auto-detected from Gong. Edit if incorrect.</p>
                </div>
                <button
                  onClick={generateMAP}
                  className="bg-brand-lime text-brand-bg font-bold px-8 py-3 rounded-lg text-sm cursor-pointer hover:bg-brand-lime-dim active:scale-[0.98] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(193,246,23,0.15)]"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Mutual Action Plan
                </button>
              </div>
            )}
          </section>

          {/* Loading State */}
          {step === 'generating' && (
            <section className="bg-brand-card border border-brand-lime/20 rounded-xl p-12 text-center">
              <Loader2 className="w-10 h-10 text-brand-lime animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-white mb-2">Analyzing Transcripts...</h3>
              <p className="text-brand-muted text-sm mb-6">
                Processing call recordings and extracting strategic insights with Claude AI.
              </p>
              {/* Skeleton preview */}
              <div className="max-w-md mx-auto space-y-3">
                <div className="h-3 bg-brand-border/50 rounded-full w-3/4 mx-auto animate-pulse" />
                <div className="h-3 bg-brand-border/50 rounded-full w-1/2 mx-auto animate-pulse" />
                <div className="h-8 bg-brand-border/30 rounded-lg w-full animate-pulse mt-4" />
                <div className="h-8 bg-brand-border/30 rounded-lg w-full animate-pulse" />
                <div className="h-8 bg-brand-border/30 rounded-lg w-full animate-pulse" />
              </div>
            </section>
          )}

          {/* Step 2: MAP Editor */}
          {(step === 'editing' || step === 'publishing') && mapContent && (
            <>
              {/* Progress Bar */}
              <section className="bg-brand-card border border-brand-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-brand-white">Plan Progress</h3>
                  <span className="text-xs text-brand-muted">
                    {progress.completed} of {progress.total} milestones complete
                  </span>
                </div>
                <div className="w-full h-2 bg-brand-bg rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-lime rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${progress.percent}%`,
                      boxShadow: progress.percent > 0 ? '0 0 12px rgba(193, 246, 23, 0.4)' : 'none',
                    }}
                  />
                </div>
                <p className="text-right text-[11px] text-brand-lime mt-1.5 font-medium">{progress.percent}%</p>
              </section>

              {/* North Star */}
              <section className="bg-brand-card border border-brand-border rounded-xl p-6 md:p-8">
                <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-brand-white">
                  <Target className="w-4 h-4 text-brand-lime" />
                  The &quot;North Star&quot; Objective
                </h2>
                <textarea
                  value={mapContent.northStar}
                  onChange={(e) => updateNorthStar(e.target.value)}
                  rows={3}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg px-4 py-3 text-sm text-brand-text leading-relaxed focus:outline-none focus:border-brand-lime/40 focus:ring-1 focus:ring-brand-lime/20 resize-none transition-all"
                />
              </section>

              {/* Milestones with Checkboxes */}
              <section className="bg-brand-card border border-brand-border rounded-xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-semibold flex items-center gap-2 text-brand-white">
                    <CheckCircle2 className="w-4 h-4 text-brand-lime" />
                    Strategic Milestones
                  </h2>
                  <button
                    onClick={addMilestone}
                    className="text-xs text-brand-lime border border-brand-lime/20 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-brand-lime/10 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>

                <div className="space-y-3">
                  {mapContent.milestones.map((milestone, i) => {
                    const isComplete = milestone.status === 'complete';
                    return (
                      <div
                        key={i}
                        className={`border rounded-lg p-4 transition-all ${isComplete
                          ? 'bg-brand-lime/5 border-brand-lime/20'
                          : 'bg-brand-bg/50 border-brand-border'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox - min 44px touch target */}
                          <button
                            onClick={() => toggleMilestoneComplete(i)}
                            className="mt-0.5 shrink-0 cursor-pointer transition-colors w-8 h-8 flex items-center justify-center -ml-1.5"
                            aria-label={isComplete ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {isComplete ? (
                              <CircleCheck className="w-5 h-5 text-brand-lime" />
                            ) : (
                              <Circle className="w-5 h-5 text-brand-slate hover:text-brand-lime/60" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <input
                                value={milestone.title}
                                onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                                placeholder="Milestone title"
                                className={`flex-1 bg-transparent font-medium text-sm focus:outline-none transition-all ${isComplete ? 'text-brand-muted line-through' : 'text-brand-white'
                                  }`}
                              />
                              <button
                                onClick={() => removeMilestone(i)}
                                className="text-brand-slate hover:text-red-400 cursor-pointer p-2 rounded transition-colors shrink-0 -mr-1"
                                aria-label="Remove milestone"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              value={milestone.description}
                              onChange={(e) => updateMilestone(i, 'description', e.target.value)}
                              placeholder="Description..."
                              rows={1}
                              className={`w-full bg-transparent text-sm focus:outline-none resize-none transition-all ${isComplete ? 'text-brand-slate' : 'text-brand-muted'
                                }`}
                            />
                            <div className="flex flex-wrap gap-2">
                              <select
                                value={milestone.owner}
                                onChange={(e) => updateMilestone(i, 'owner', e.target.value)}
                                className="bg-brand-bg border border-brand-border rounded px-2.5 py-1 text-[11px] text-brand-text focus:outline-none cursor-pointer"
                              >
                                <option value="Hologram">Hologram</option>
                                <option value="Customer">Customer</option>
                                <option value="Joint">Joint</option>
                              </select>
                              <input
                                type="date"
                                value={milestone.targetDate}
                                onChange={(e) => updateMilestone(i, 'targetDate', e.target.value)}
                                className="bg-brand-bg border border-brand-border rounded px-2.5 py-1 text-[11px] text-brand-text focus:outline-none cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Risk Factors & Success Factors */}
              <div className="grid md:grid-cols-2 gap-4">
                <section className="bg-brand-card border border-brand-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-brand-lime uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Risk Factors
                    </h3>
                    <button
                      onClick={addRisk}
                      className="text-[10px] text-brand-lime border border-brand-lime/20 px-2 py-1 rounded cursor-pointer hover:bg-brand-lime/10 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5" /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {mapContent.riskFactors.length === 0 ? (
                      <p className="text-xs text-brand-slate text-center py-4">No risk factors yet. Click Add to create one.</p>
                    ) : (
                      mapContent.riskFactors.map((risk, i) => (
                        <div key={i} className="bg-brand-bg rounded-lg p-3 border border-brand-border space-y-2">
                          <div className="flex items-start gap-2">
                            <input
                              value={risk.description}
                              onChange={(e) => updateRisk(i, 'description', e.target.value)}
                              className="flex-1 bg-transparent text-sm text-brand-text focus:outline-none"
                              placeholder="Risk description"
                            />
                            <button
                              onClick={() => removeRisk(i)}
                              className="text-brand-slate hover:text-red-400 cursor-pointer p-1.5 rounded transition-colors shrink-0"
                              aria-label="Remove risk factor"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={risk.severity}
                              onChange={(e) => updateRisk(i, 'severity', e.target.value)}
                              className="bg-brand-bg border border-brand-border rounded px-2 py-1 text-[10px] text-brand-text focus:outline-none cursor-pointer"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <input
                              value={risk.mitigation}
                              onChange={(e) => updateRisk(i, 'mitigation', e.target.value)}
                              placeholder="Mitigation..."
                              className="flex-1 bg-transparent text-[11px] text-brand-muted focus:outline-none"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="bg-brand-card border border-brand-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-brand-lime uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Critical Success Factors
                    </h3>
                    <button
                      onClick={addSuccessFactor}
                      className="text-[10px] text-brand-lime border border-brand-lime/20 px-2 py-1 rounded cursor-pointer hover:bg-brand-lime/10 transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5" /> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {mapContent.successFactors.length === 0 ? (
                      <p className="text-xs text-brand-slate text-center py-4">No success factors yet. Click Add to create one.</p>
                    ) : (
                      mapContent.successFactors.map((factor, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-brand-lime text-xs">&#8226;</span>
                          <input
                            value={factor}
                            onChange={(e) => updateSuccessFactor(i, e.target.value)}
                            className="flex-1 bg-transparent text-sm text-brand-muted focus:outline-none focus:text-brand-text transition-colors"
                          />
                          <button
                            onClick={() => removeSuccessFactor(i)}
                            className="text-brand-slate hover:text-red-400 cursor-pointer p-1.5 rounded transition-colors shrink-0"
                            aria-label="Remove success factor"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>

              {/* Stakeholders */}
              <section className="bg-brand-card border border-brand-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] font-bold text-brand-muted uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" />
                    Key Stakeholders
                  </h3>
                  <button
                    onClick={addStakeholder}
                    className="text-[10px] text-brand-lime border border-brand-lime/20 px-2 py-1 rounded cursor-pointer hover:bg-brand-lime/10 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add
                  </button>
                </div>
                <div className="space-y-2">
                  {mapContent.stakeholders.length === 0 ? (
                    <p className="text-xs text-brand-slate text-center py-4">
                      No stakeholders yet. Click Add to create one.
                    </p>
                  ) : (
                    mapContent.stakeholders.map((s, i) => (
                      <div key={i} className="bg-brand-bg rounded-lg p-3 border border-brand-border">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
                            <input
                              value={s.name}
                              onChange={(e) => updateStakeholder(i, 'name', e.target.value)}
                              placeholder="Full name"
                              className="bg-transparent text-sm text-brand-white focus:outline-none placeholder:text-brand-slate"
                            />
                            <input
                              value={s.role}
                              onChange={(e) => updateStakeholder(i, 'role', e.target.value)}
                              placeholder="Title / Role"
                              className="bg-transparent text-sm text-brand-muted focus:outline-none placeholder:text-brand-slate"
                            />
                            <input
                              value={s.company}
                              onChange={(e) => updateStakeholder(i, 'company', e.target.value)}
                              placeholder="Company"
                              className="bg-transparent text-sm text-brand-muted focus:outline-none placeholder:text-brand-slate"
                            />
                          </div>
                          <button
                            onClick={() => removeStakeholder(i)}
                            className="text-brand-slate hover:text-red-400 cursor-pointer p-1.5 rounded transition-colors shrink-0"
                            aria-label="Remove stakeholder"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Publish Button Card */}
              <button
                onClick={publishMAP}
                disabled={step === 'publishing'}
                className="w-full bg-brand-lime text-brand-bg rounded-xl p-6 cursor-pointer hover:bg-brand-lime-dim active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-4 text-left shadow-[0_0_30px_rgba(193,246,23,0.12)]"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-bg/20 flex items-center justify-center shrink-0">
                  {step === 'publishing' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Link2 className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold mb-0.5">Publish &amp; Share with Customer</h3>
                  <p className="text-xs opacity-70">Create a shareable read-only view for your customer.</p>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </>
          )}

          {/* Step 3: Published URL */}
          {step === 'done' && publishedUrl && (
            <section className="bg-brand-card border border-brand-lime/30 rounded-xl p-8 text-center shadow-[0_0_40px_rgba(193,246,23,0.06)]">
              <div className="w-14 h-14 rounded-full bg-brand-lime/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-brand-lime" />
              </div>
              <h3 className="text-lg font-bold text-brand-white mb-2">MAP Published Successfully</h3>
              <p className="text-brand-muted text-sm mb-6">
                Share this link with your customer to give them read-only access.
              </p>
              <div className="bg-brand-bg rounded-lg border border-brand-border p-4 flex items-center gap-3 max-w-xl mx-auto">
                <code className="flex-1 text-sm text-brand-lime truncate">{publishedUrl}</code>
                <button
                  onClick={copyToClipboard}
                  className="text-brand-muted hover:text-brand-white cursor-pointer p-2 rounded-lg hover:bg-brand-card-hover transition-colors"
                  title={copied ? 'Copied!' : 'Copy to clipboard'}
                  aria-label="Copy link to clipboard"
                >
                  {copied ? <Check className="w-4 h-4 text-brand-lime" /> : <Copy className="w-4 h-4" />}
                </button>
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-muted hover:text-brand-lime cursor-pointer p-2 rounded-lg hover:bg-brand-card-hover transition-colors"
                  title="Open in new tab"
                  aria-label="Open MAP in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => {
                    setStep('select');
                    setMapContent(null);
                    setSelectedAccount(null);
                    setCustomerName('');
                    setPublishedUrl('');
                    setCopied(false);
                  }}
                  className="text-sm text-brand-muted hover:text-brand-white cursor-pointer transition-colors"
                >
                  Generate Another MAP
                </button>
                <span className="text-brand-border">|</span>
                <a
                  href="https://www.hologram.io/contact-sales/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-lime hover:text-brand-lime-dim cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Follow-up
                </a>
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="max-w-6xl mx-auto mt-16 pt-6 border-t border-brand-border text-center text-brand-slate text-xs pb-8">
          <div className="flex items-center justify-center gap-1.5">
            <Image src="/logo-mark.png" alt="Hologram" width={16} height={16} className="h-4 w-auto" />
            <span className="text-brand-muted font-medium">Hologram</span>
          </div>
        </footer>
      </div>

      {/* Auth Modals */}
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <ManageUsersModal isOpen={isManageOpen} onClose={() => setIsManageOpen(false)} />
    </div>
  );
}
