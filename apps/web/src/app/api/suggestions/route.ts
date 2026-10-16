import { NextResponse } from "next/server";
import { z } from "zod";
import { draftSuggestion } from "@/lib/ai/suggest";
import { DEMO_SHARE_ID, demoDraft } from "@/lib/demo";
import { SUGGESTION_KINDS } from "@/lib/suggestion-kinds";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const MAX_SUGGESTIONS_PER_SCAN = 50;

const bodySchema = z.object({
  shareId: z.union([z.literal(DEMO_SHARE_ID), z.string().min(16)]),
  findingId: z.uuid(),
  nodeIndex: z.number().int().min(0).default(0),
  kind: z.enum(SUGGESTION_KINDS),
});

interface FindingWithScan {
  id: string;
  scan_id: string;
  rule_id: string;
  help: string;
  wcag: string[];
  nodes: { html: string }[];
  scans: { share_id: string; url: string | null; title: string | null; final_url: string | null };
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { shareId, findingId, nodeIndex, kind } = parsed.data;
  if (shareId === DEMO_SHARE_ID) return NextResponse.json(demoDraft(kind, findingId, nodeIndex), { status: 201 });
  const admin = getSupabaseAdmin();

  const { data: finding, error } = await admin
    .from("findings")
    .select("id, scan_id, rule_id, help, wcag, nodes, scans!inner(share_id, url, title:result->>title, final_url:result->>finalUrl)")
    .eq("id", findingId)
    .eq("scans.share_id", shareId)
    .maybeSingle<FindingWithScan>();
  if (error) return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  const node = finding?.nodes[nodeIndex];
  if (!finding || !node) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { count } = await admin
    .from("suggestions")
    .select("id, findings!inner(scan_id)", { count: "exact", head: true })
    .eq("findings.scan_id", finding.scan_id);
  if ((count ?? 0) >= MAX_SUGGESTIONS_PER_SCAN) {
    return NextResponse.json({ error: "This report has reached its AI suggestion limit." }, { status: 429 });
  }

  let draft;
  try {
    draft = await draftSuggestion({
      kind,
      ruleId: finding.rule_id,
      help: finding.help,
      wcag: finding.wcag,
      html: node.html,
      pageUrl: finding.scans.final_url ?? finding.scans.url,
      pageTitle: finding.scans.title ?? "",
    });
  } catch (err) {
    console.error("draftSuggestion failed", err);
    return NextResponse.json({ error: "The AI provider is unavailable right now. Try again later." }, { status: 502 });
  }

  const { data: suggestion, error: insertError } = await admin
    .from("suggestions")
    .insert({
      finding_id: finding.id,
      node_index: nodeIndex,
      kind,
      provider: draft.provider,
      model: draft.model,
      content: draft.content,
    })
    .select("id, kind, content, status")
    .single();
  if (insertError) return NextResponse.json({ error: "Could not save the suggestion." }, { status: 500 });

  return NextResponse.json(suggestion, { status: 201 });
}
