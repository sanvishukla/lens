import type { ScanResult } from "@lens/core";
import { supabase } from "./supabase.ts";

export interface ScanJob {
  id: string;
  kind: "url" | "html" | "image";
  url: string | null;
  html: string | null;
}

export async function claimNextScan(): Promise<ScanJob | null> {
  const { data, error } = await supabase.rpc("claim_next_scan");
  if (error) throw error;
  const rows = (data ?? []) as ScanJob[];
  return rows[0] ?? null;
}

export async function completeScan(id: string, result: ScanResult): Promise<void> {
  if (result.findings.length > 0) {
    const { error: findingsError } = await supabase.from("findings").insert(
      result.findings.map((f) => ({
        scan_id: id,
        rule_id: f.ruleId,
        engine: f.engine,
        impact: f.impact,
        wcag: f.wcag,
        groups: f.groups,
        help: f.help,
        help_url: f.helpUrl ?? null,
        nodes: f.nodes,
      })),
    );
    if (findingsError) throw findingsError;
  }

  const { error } = await supabase
    .from("scans")
    .update({ status: "done", result, finished_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function failScan(id: string, message: string): Promise<void> {
  const { error } = await supabase
    .from("scans")
    .update({ status: "failed", error: message.slice(0, 500), finished_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
