import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// 앱을 죽이지 말고, 문제를 노출하기 위해 export
export const SUPABASE_ENV_OK = !!(supabaseUrl && supabaseAnonKey);

export const supabase = SUPABASE_ENV_OK
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
