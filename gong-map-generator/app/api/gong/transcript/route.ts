import { NextRequest, NextResponse } from 'next/server';
import { GongClient } from '@/lib/gong-client';
import { cleanTranscript } from '@/lib/transcript-cleaner';

export async function POST(request: NextRequest) {
  try {
    const { callIds } = await request.json();

    if (!callIds || !Array.isArray(callIds) || callIds.length === 0) {
      return NextResponse.json({ error: 'callIds array is required' }, { status: 400 });
    }

    // Use the 3 most recent call IDs
    const recentIds = callIds.slice(0, 3);

    const gong = new GongClient();
    const transcripts = await gong.getTranscripts(recentIds);
    const cleaned = cleanTranscript(transcripts);

    return NextResponse.json({
      transcript: cleaned,
      callCount: transcripts.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
