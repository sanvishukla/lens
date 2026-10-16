import type { Metadata } from "next";
import { BoxOverlay } from "@/components/lenses/BoxOverlay";
import { ReportPending } from "@/components/report/ReportPending";
import { loadReport, screenshotUrl } from "@/lib/reports";

export const metadata: Metadata = { title: "Motor and touch lens" };

export default async function TargetsPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const { scan, result } = await loadReport(reportId);
  if (!result) return <ReportPending scan={scan} />;

  const shot = await screenshotUrl(result, "desktop");
  const small = result.targets.filter((t) => t.tooSmall);
  const reflowFails = result.findings.some((f) => f.ruleId === "lens-reflow");

  return (
    <>
      <h1>Tap</h1>
      <p>
        Small targets are hard to hit with a tremor, a stylus, or a thumb. WCAG 2.5.8 asks for at least 24 by 24 CSS
        pixels.{" "}
        {small.length === 0 ? (
          "Every target measured meets it."
        ) : (
          <span className="problem">Problem: {small.length} targets are smaller.</span>
        )}
      </p>
      <p>
        {reflowFails ? (
          <span className="problem">
            Problem: at 320px wide the page scrolls sideways (WCAG 1.4.10), which is hard for people who zoom in.
          </span>
        ) : (
          "The page fits a 320px-wide screen without sideways scrolling."
        )}
      </p>

      {shot && small.length > 0 && (
        <>
          <h2>Small targets on the page</h2>
          <ul className="legend">
            <li data-tone="problem">Dashed outline: smaller than 24 by 24 pixels</li>
          </ul>
          <BoxOverlay
            src={shot.url}
            alt="Screenshot of the page with undersized targets outlined. They are listed under Undersized targets."
            width={shot.capture.width}
            height={shot.capture.pageHeight}
            boxes={small.map((t) => ({ box: t.box, label: "", tone: "problem" }))}
          />
        </>
      )}

      {small.length > 0 && (
        <>
          <h2>Undersized targets</h2>
          <ul>
            {small.map((t) => (
              <li key={t.selector}>
                {t.label && <strong>{t.label}. </strong>}
                <code>{t.selector}</code>, {Math.round(t.box.width)} by {Math.round(t.box.height)} pixels
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
