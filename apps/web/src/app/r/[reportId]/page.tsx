import { GROUP_LABELS, type AffectedGroup, type Impact } from "@lens/core";
import type { Metadata } from "next";
import { FindingCard } from "@/components/report/FindingCard";
import { ReportPending } from "@/components/report/ReportPending";
import { loadFindings, loadReport } from "@/lib/reports";

export const metadata: Metadata = { title: "Report summary" };

const IMPACTS: { id: Impact; label: string }[] = [
  { id: "critical", label: "Critical" },
  { id: "serious", label: "Serious" },
  { id: "moderate", label: "Moderate" },
  { id: "minor", label: "Minor" },
];

export default async function ReportSummaryPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const { scan, result } = await loadReport(reportId);
  if (!result) return <ReportPending scan={scan} />;

  const findings = await loadFindings(scan.id);
  const elementCount = findings.reduce((n, f) => n + f.nodes.length, 0);
  const byGroup = new Map<AffectedGroup, number>();
  for (const f of findings) {
    for (const g of f.groups as AffectedGroup[]) byGroup.set(g, (byGroup.get(g) ?? 0) + 1);
  }
  const maxGroup = Math.max(1, ...byGroup.values());

  return (
    <>
      <h1>What&apos;s snagging</h1>
      <p className="lede">
        {findings.length === 0
          ? "No automated issues found. That's a good start; still try it with a keyboard and a screen reader."
          : `${findings.length} barriers on ${elementCount} parts of this page. The notes name the part, not just the rule.`}
      </p>

      <ul className="tiles" aria-label="Issues by impact">
        {IMPACTS.map(({ id, label }) => (
          <li key={id} className="tile" data-impact={id}>
            <span className="tile-number">{findings.filter((f) => f.impact === id).length}</span>
            <span className="impact-chip" data-impact={id}>
              {label}
            </span>
          </li>
        ))}
      </ul>

      {byGroup.size > 0 && (
        <section className="section-tight" aria-labelledby="who-title">
          <h2 id="who-title">Where these barriers show up</h2>
          <ul className="bars">
            {[...byGroup]
              .sort((a, b) => b[1] - a[1])
              .map(([group, count]) => (
                <li key={group}>
                  <span className="bar-label">
                    {GROUP_LABELS[group]}: {count} {count === 1 ? "issue" : "issues"}
                  </span>
                  <span className="bar" aria-hidden="true">
                    <span style={{ width: `${(count / maxGroup) * 100}%` }} />
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <section className="section-tight" aria-labelledby="issues-title">
        <h2 id="issues-title">Issues, most severe first</h2>
        {findings.map((f) => (
          <FindingCard key={f.id} finding={f} />
        ))}
      </section>

      <p className="hint">Checked with axe-core {result.engines.axe} and Lens&apos;s own keyboard, reflow, and focus rules.</p>
    </>
  );
}
