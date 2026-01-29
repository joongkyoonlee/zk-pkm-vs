import { supabase } from "@/lib/supabase";

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) {
    return { ok: false, message: "Supabase 환경변수가 설정되지 않았습니다." };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: error.message };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function signUpWithPassword(email: string, password: string) {
  if (!supabase) {
    return { ok: false, message: "Supabase 환경변수가 설정되지 않았습니다." };
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { ok: false, message: error.message };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function signOut() {
  if (!supabase) return { ok: true };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function getCurrentUser() {
  if (!supabase) return { ok: false, user: null as null, message: "Supabase not initialized" };

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return { ok: false, user: null, message: error.message };
    return { ok: true, user: data.user ?? null };
  } catch (e) {
    return { ok: false, user: null, message: e instanceof Error ? e.message : "Unknown error" };
  }
}
