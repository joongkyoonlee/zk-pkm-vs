import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const SUPABASE_ENV_OK = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

// 절대 throw 하지 않습니다. (GitHub Pages에서 env 누락 시 흰 화면 방지)
export const supabase: SupabaseClient | null = SUPABASE_ENV_OK
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
