import type { GongTranscript } from './types';

const FILLER_PATTERN = /\b(um|uh|you know|sort of|kind of|basically|actually|literally|like|right)\b/gi;
const TIMESTAMP_PATTERN = /\[\d{2}:\d{2}:\d{2}\]/g;
const MAX_CHARS = 15000;

export function cleanTranscript(transcripts: GongTranscript[]): string {
  let combined = '';

  for (const t of transcripts) {
    for (const entry of t.transcript ?? []) {
      const speakerLabel = entry.speakerId?.includes('0') ? 'Hologram AE' : 'Customer';
      const text = entry.sentences?.map((s) => s.text).join(' ') ?? '';
      if (text.trim()) {
        combined += `${speakerLabel}: ${text}\n\n`;
      }
    }
  }

  // Remove fillers
  let cleaned = combined.replace(FILLER_PATTERN, '');

  // Remove timestamps
  cleaned = cleaned.replace(TIMESTAMP_PATTERN, '');

  // Consolidate whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Restore paragraph breaks between speakers
  cleaned = cleaned.replace(/(Hologram AE:|Customer:)/g, '\n\n$1');

  // Trim to max length
  if (cleaned.length > MAX_CHARS) {
    cleaned = cleaned.slice(0, MAX_CHARS);
  }

  return cleaned.trim();
}
