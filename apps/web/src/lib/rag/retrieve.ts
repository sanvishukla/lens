import "server-only";
import { pipeline } from "@huggingface/transformers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Must match the model used by scripts/ingest-wcag.ts (384-dim). */
export const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

let extractor: ReturnType<typeof loadExtractor> | undefined;

function loadExtractor() {
  return pipeline("feature-extraction", EMBEDDING_MODEL);
}

export async function embed(text: string): Promise<number[]> {
  extractor ??= loadExtractor();
  const output = await (await extractor)(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

interface Chunk {
  heading: string;
  url: string;
  content: string;
}

/** Top W3C guidance passages for a query, formatted for a prompt. Empty if the corpus isn't ingested. */
export async function retrieveGuidance(query: string, count = 4): Promise<string> {
  const { data, error } = await getSupabaseAdmin().rpc("match_wcag_chunks", {
    query_embedding: await embed(query),
    match_count: count,
  });
  if (error || !data) return "";
  return (data as Chunk[]).map((c) => `## ${c.heading} (${c.url})\n${c.content}`).join("\n\n");
}
