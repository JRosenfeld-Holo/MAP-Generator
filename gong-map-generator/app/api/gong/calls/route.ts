import { NextResponse } from 'next/server';
import { GongClient } from '@/lib/gong-client';

export async function GET() {
  try {
    const gong = new GongClient();
    // Fetch calls from the last 90 days
    const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const calls = await gong.getCalls(fromDate);
    const accounts = gong.parseAccounts(calls);

    return NextResponse.json({ accounts, totalCalls: calls.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
