import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Null until configured; the dashboard falls back to demo data. */
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export const isCloudEnabled = supabase !== null;
