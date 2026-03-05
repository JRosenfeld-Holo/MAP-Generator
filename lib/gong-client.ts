import type { GongCall, GongAccount, GongTranscript } from './types';

const GONG_BASE_URL = 'https://us-11211.api.gong.io/v2';

// Common domain suffixes that aren't part of the company name
const DOMAIN_NOISE = new Set([
  'rpm', 'hq', 'app', 'io', 'inc', 'corp', 'llc', 'ltd', 'co',
  'tech', 'labs', 'dev', 'eng', 'digital', 'global', 'group',
  'solutions', 'systems', 'services', 'software', 'online', 'cloud',
  'team', 'works', 'hub', 'platform', 'ai', 'us', 'uk', 'eu',
]);

/**
 * Clean up a domain name into a presentable company name.
 * e.g., "cadencerpm.com" → "Cadence", "acme-tech.com" → "Acme"
 */
function cleanDomainName(domain: string): string {
  const base = domain.split('.')[0]; // "cadencerpm" from "cadencerpm.com"

  // Split on hyphens and underscores
  let parts = base.split(/[-_]/);

  // For single-word domains, try stripping known noise suffixes
  if (parts.length === 1) {
    const word = parts[0].toLowerCase();
    for (const suffix of DOMAIN_NOISE) {
      if (word.endsWith(suffix) && word.length > suffix.length) {
        parts = [word.slice(0, -suffix.length)];
        break;
      }
    }
  }

  // Filter out noise words from hyphenated domains
  parts = parts.filter((p) => !DOMAIN_NOISE.has(p.toLowerCase()));

  const cleaned = parts.join(' ');
  if (!cleaned) return base.charAt(0).toUpperCase() + base.slice(1);

  // Title case
  return cleaned
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export class GongClient {
  private authHeader: string;

  constructor() {
    const accessKey = process.env.GONG_ACCESS_KEY;
    const secret = process.env.GONG_SECRET;
    if (!accessKey || !secret) throw new Error('Missing Gong API credentials');
    this.authHeader = 'Basic ' + Buffer.from(`${accessKey}:${secret}`).toString('base64');
  }

  private async request(path: string, options: RequestInit = {}) {
    const res = await fetch(`${GONG_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.authHeader,
        ...options.headers,
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Gong API error ${res.status}: ${body}`);
    }
    return res.json();
  }

  async getCalls(fromDate?: string): Promise<GongCall[]> {
    const filter: Record<string, unknown> = {};
    if (fromDate) {
      filter.fromDateTime = fromDate;
    }
    const allCalls: GongCall[] = [];
    let cursor: string | undefined;

    do {
      const body: Record<string, unknown> = {
        filter,
        contentSelector: {
          exposedFields: {
            parties: true,
          },
        },
      };
      if (cursor) body.cursor = cursor;

      const data = await this.request('/calls/extensive', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      // Gong nests id/started/title under metaData — flatten for our GongCall type
      const calls = (data.calls ?? []).map((c: Record<string, unknown>) => ({
        id: (c.metaData as Record<string, unknown>)?.id as string,
        title: (c.metaData as Record<string, unknown>)?.title as string,
        started: (c.metaData as Record<string, unknown>)?.started as string,
        duration: (c.metaData as Record<string, unknown>)?.duration as number,
        scope: (c.metaData as Record<string, unknown>)?.scope as string,
        parties: c.parties as GongCall['parties'],
      }));
      allCalls.push(...calls);
      cursor = data.records?.cursor;
    } while (cursor);

    return allCalls;
  }

  async getTranscripts(callIds: string[]): Promise<GongTranscript[]> {
    const data = await this.request('/calls/transcript', {
      method: 'POST',
      body: JSON.stringify({
        filter: { callIds },
      }),
    });
    return data.callTranscripts ?? [];
  }

  parseAccounts(calls: GongCall[]): GongAccount[] {
    const accountMap = new Map<string, GongAccount>();

    for (const call of calls) {
      const externalParties = (call.parties ?? []).filter(
        (p) => p.affiliation === 'External' && p.emailAddress
      );

      for (const party of externalParties) {
        const domain = party.emailAddress!.split('@')[1];
        const key = domain;

        if (!accountMap.has(key)) {
          accountMap.set(key, {
            name: cleanDomainName(domain),
            email: party.emailAddress!,
            callIds: [call.id],
            latestCallDate: call.started,
            dealStage: 'Discovery',
          });
        } else {
          const existing = accountMap.get(key)!;
          if (!existing.callIds.includes(call.id)) {
            existing.callIds.push(call.id);
          }
          if (new Date(call.started) > new Date(existing.latestCallDate)) {
            existing.latestCallDate = call.started;
          }
        }
      }
    }

    return Array.from(accountMap.values()).sort(
      (a, b) => new Date(b.latestCallDate).getTime() - new Date(a.latestCallDate).getTime()
    );
  }
}
