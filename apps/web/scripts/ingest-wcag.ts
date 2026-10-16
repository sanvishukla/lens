/**
 * Builds the retrieval corpus in `wcag_chunks` from W3C sources
 * (W3C Document License: redistribution with attribution is allowed).
 *
 * Planned steps:
 *   1. Fetch WCAG 2.2, Understanding WCAG 2.2, and ACT Rules pages.
 *   2. Split into one chunk per success criterion / rule section (~300–600 words).
 *   3. Embed with Xenova/all-MiniLM-L6-v2 (same model as src/lib/rag/retrieve.ts).
 *   4. Upsert into wcag_chunks with source, criterion, heading, url.
 *
 * Run: node --env-file=../../.env scripts/ingest-wcag.ts
 */
const SOURCES = [
  { source: "wcag22", url: "https://www.w3.org/TR/WCAG22/" },
  { source: "understanding", url: "https://www.w3.org/WAI/WCAG22/Understanding/" },
  { source: "act-rules", url: "https://www.w3.org/WAI/standards-guidelines/act/rules/" },
];

console.error(`ingest-wcag is not implemented yet. Sources to ingest:\n${SOURCES.map((s) => `- ${s.url}`).join("\n")}`);
process.exit(1);
