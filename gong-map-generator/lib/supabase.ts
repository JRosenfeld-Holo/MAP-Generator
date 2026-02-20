import { createClient } from '@supabase/supabase-js';
import slugify from 'slugify';
import { nanoid } from 'nanoid';
import type { MAPContent, MutualActionPlan } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : supabaseClient;

function generateSlug(customerName: string): string {
  const base = slugify(customerName, { lower: true, strict: true });
  const id = nanoid(6);
  return `${base}-${id}`;
}

export async function saveMAP(
  content: MAPContent,
  customerName: string,
  gongCallId?: string
): Promise<{ slug: string; id: string }> {
  const slug = generateSlug(customerName);

  const { data, error } = await supabaseAdmin
    .from('mutual_action_plans')
    .insert({
      customer_name: customerName,
      gong_call_id: gongCallId ?? null,
      slug,
      content,
      is_published: true,
    })
    .select('id, slug')
    .single();

  if (error) throw new Error(`Supabase insert error: ${error.message}`);
  return { slug: data.slug, id: data.id };
}

export async function getMAPBySlug(slug: string): Promise<MutualActionPlan | null> {
  const { data, error } = await supabaseClient
    .from('mutual_action_plans')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as MutualActionPlan;
}
