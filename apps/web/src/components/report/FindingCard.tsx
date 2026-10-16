import { GROUP_LABELS, type AffectedGroup } from "@lens/core";
import type { FindingRow } from "@/lib/reports";

const IMPACT_LABELS: Record<FindingRow["impact"], string> = {
  critical: "Critical",
  serious: "Serious",
  moderate: "Moderate",
  minor: "Minor",
};

export function FindingCard({ finding }: { finding: FindingRow }) {
  const count = finding.nodes.length;
  return (
    <article className="finding" data-impact={finding.impact} aria-labelledby={`finding-${finding.id}`}>
      <h3 id={`finding-${finding.id}`}>{finding.help}</h3>
      <dl className="meta">
        <div>
          <dt>Impact</dt>
          <dd>
            <span className="impact-chip" data-impact={finding.impact}>
              {IMPACT_LABELS[finding.impact]}
            </span>
          </dd>
        </div>
        <div>
          <dt>WCAG</dt>
          <dd>{finding.wcag.length ? finding.wcag.join(", ") : "Best practice"}</dd>
        </div>
        <div>
          <dt>Gets in the way of</dt>
          <dd>{(finding.groups as AffectedGroup[]).map((g) => GROUP_LABELS[g]).join(", ")}</dd>
        </div>
      </dl>
      <ul className="node-list">
        {finding.nodes.slice(0, 8).map((node, i) => (
          <li key={i}>
            {node.summary ? <p>{node.summary}</p> : null}
            <code>{node.selector}</code>
          </li>
        ))}
      </ul>
      {count > 8 && (
        <p>
          And {count - 8} more {count - 8 === 1 ? "element" : "elements"}.
        </p>
      )}
      {finding.help_url && (
        <p>
          <a href={finding.help_url}>
            How to fix<span className="visually-hidden">: {finding.help}</span>
          </a>
        </p>
      )}
    </article>
  );
}
