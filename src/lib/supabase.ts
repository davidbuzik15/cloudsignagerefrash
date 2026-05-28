import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Player = {
  id: string;
  name: string;
  public_slug: string;
  embed_html: string;
  content_type: 'iframe' | 'html' | 'url' | 'video';
  is_online: boolean;
  last_seen: string | null;
  refresh_version: number;
  created_at: string;
  updated_at: string;
};
