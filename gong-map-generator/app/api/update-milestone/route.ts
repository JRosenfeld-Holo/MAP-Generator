import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { MAPContent } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { slug, milestoneIndex, status } = await req.json();

    if (!slug || milestoneIndex === undefined || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch current MAP
    const { data: map, error: fetchError } = await supabaseAdmin
      .from('mutual_action_plans')
      .select('content')
      .eq('slug', slug)
      .single();

    if (fetchError || !map) {
      return NextResponse.json({ error: 'MAP not found' }, { status: 404 });
    }

    const content = map.content as MAPContent;

    if (milestoneIndex < 0 || milestoneIndex >= content.milestones.length) {
      return NextResponse.json({ error: 'Invalid milestone index' }, { status: 400 });
    }

    // Update the milestone status
    content.milestones[milestoneIndex].status = status;

    const { error: updateError } = await supabaseAdmin
      .from('mutual_action_plans')
      .update({ content })
      .eq('slug', slug);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, content });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to update milestone' },
      { status: 500 }
    );
  }
}
