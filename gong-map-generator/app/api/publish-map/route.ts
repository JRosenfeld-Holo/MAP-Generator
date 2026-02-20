import { NextRequest, NextResponse } from 'next/server';
import { saveMAP } from '@/lib/supabase';
import type { MAPContent } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { content, customerName, gongCallId } = (await request.json()) as {
      content: MAPContent;
      customerName: string;
      gongCallId?: string;
    };

    if (!content || !customerName) {
      return NextResponse.json(
        { error: 'content and customerName are required' },
        { status: 400 }
      );
    }

    const { slug, id } = await saveMAP(content, customerName, gongCallId);
    const url = `/v/${slug}`;

    return NextResponse.json({ slug, id, url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
