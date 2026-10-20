import type { Metadata } from "next";
import { FixPanel } from "@/components/fixes/FixPanel";
import { ReportPending } from "@/components/report/ReportPending";
import { loadFindings, loadReport } from "@/lib/reports";
import { suggestionKindsFor } from "@/lib/suggestion-kinds";

export const metadata: Metadata = { title: "Fixes" };

export default async function FixesPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const { scan, result } = await loadReport(reportId);
  if (!result) return <ReportPending scan={scan} />;

  const findings = await loadFindings(scan.id);

  return (
    <>
      <h1>Remediation & fixes</h1>
      <p>
        AI-assisted recommendations provide a starting point for addressing accessibility barriers. Review each draft in context before implementing it in your codebase. Your accept, edit, or reject feedback helps refine future suggestions.
      </p>
      {findings.length === 0 && <p>No issues requiring remediation were identified by the automated checks.</p>}
      {findings.map((f) => (
        <section key={f.id} className="finding" data-impact={f.impact} aria-labelledby={`fix-${f.id}`}>
          <h2 id={`fix-${f.id}`}>{f.help}</h2>
          {f.nodes.slice(0, 5).map((node, i) => (
            <FixPanel
              key={i}
              shareId={reportId}
              findingId={f.id}
              nodeIndex={i}
              nodeCount={Math.min(f.nodes.length, 5)}
              html={node.html}
              kinds={suggestionKindsFor(f.rule_id)}
            />
          ))}
          {f.nodes.length > 5 && <p>{f.nodes.length - 5} additional elements have the same issue.</p>}
        </section>
      ))}
    </>
  );
}
