import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

let admin: SupabaseClient | undefined;

/**
 * Service-role client. Bypasses RLS: only use in server code that has
 * already checked the caller is allowed (e.g. holds the report's share ID).
 */
export function getSupabaseAdmin(): SupabaseClient {
  admin ??= createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
