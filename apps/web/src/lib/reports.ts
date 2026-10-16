import "server-only";
import { notFound } from "next/navigation";
import { IMPACT_ORDER, scanResultSchema, type Capture, type Impact, type ScanResult } from "@lens/core";
import { DEMO_SHARE_ID, demoFindings, demoResult, demoScan } from "@/lib/demo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface ScanRow {
  id: string;
  share_id: string;
  kind: "url" | "html" | "image";
  url: string | null;
  status: "queued" | "running" | "done" | "failed";
  error: string | null;
  result: unknown;
  created_at: string;
}

export interface FindingRow {
  id: string;
  rule_id: string;
  impact: Impact;
  help: string;
  help_url: string | null;
  wcag: string[];
  groups: string[];
  nodes: { selector: string; html: string; summary?: string }[];
}

export async function loadReport(shareId: string): Promise<{ scan: ScanRow; result: ScanResult | null }> {
  if (shareId === DEMO_SHARE_ID) return { scan: demoScan, result: demoResult };
  if (!process.env.SUPABASE_SECRET_KEY) notFound();
  const { data, error } = await getSupabaseAdmin()
    .from("scans")
    .select("id, share_id, kind, url, status, error, result, created_at")
    .eq("share_id", shareId)
    .maybeSingle<ScanRow>();
  if (error) throw error;
  if (!data) notFound();

  const parsed = data.status === "done" ? scanResultSchema.safeParse(data.result) : null;
  return { scan: data, result: parsed?.success ? parsed.data : null };
}

export async function loadFindings(scanId: string): Promise<FindingRow[]> {
  if (scanId === demoScan.id) return demoFindings;
  const { data, error } = await getSupabaseAdmin()
    .from("findings")
    .select("id, rule_id, impact, help, help_url, wcag, groups, nodes")
    .eq("scan_id", scanId)
    .returns<FindingRow[]>();
  if (error) throw error;
  return (data ?? []).sort((a, b) => IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact]);
}

export async function screenshotUrl(result: ScanResult, name: Capture["name"]): Promise<{ url: string; capture: Capture } | null> {
  const capture = result.captures.find((c) => c.name === name);
  if (!capture) return null;
  if (capture.screenshotPath.startsWith("demo/")) return { url: `/${capture.screenshotPath}`, capture };
  const { data } = await getSupabaseAdmin()
    .storage.from("screenshots")
    .createSignedUrl(capture.screenshotPath, 60 * 60);
  return data ? { url: data.signedUrl, capture } : null;
}
