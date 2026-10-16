import "server-only";
import { createHash } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const SCANS_PER_HOUR = 20;

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(`${process.env.RATE_LIMIT_SALT ?? ""}:${ip}`).digest("hex");
}

export async function scanLimitReached(ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await getSupabaseAdmin()
    .from("scans")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (error) throw error;
  return (count ?? 0) >= SCANS_PER_HOUR;
}
