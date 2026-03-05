import { NextRequest, NextResponse } from 'next/server';
import { GongClient } from '@/lib/gong-client';
import { cleanTranscript } from '@/lib/transcript-cleaner';
import { analyzeTranscript } from '@/lib/claude-client';

export async function POST(request: NextRequest) {
  try {
    const { callIds, customerName, aeName } = await request.json();

    if (!callIds?.length || !customerName || !aeName) {
      return NextResponse.json(
        { error: 'callIds, customerName, and aeName are required' },
        { status: 400 }
      );
    }

    // 1. Fetch transcripts from Gong
    const gong = new GongClient();
    const recentIds = callIds.slice(0, 3);
    const transcripts = await gong.getTranscripts(recentIds);

    // 2. Clean the transcript
    const cleaned = cleanTranscript(transcripts);

    if (!cleaned || cleaned.length < 50) {
      return NextResponse.json(
        { error: 'Transcript too short or empty. Ensure calls have recordings.' },
        { status: 400 }
      );
    }

    // 3. Analyze with Claude
    const mapContent = await analyzeTranscript(cleaned, customerName, aeName);

    return NextResponse.json({ content: mapContent });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
