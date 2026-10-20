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
      <h1>Touch & target sizes</h1>
      <p>
        Interactive targets that are too small are difficult to activate accurately, especially for users with motor tremors, those using a stylus, or anyone navigating on a touch screen. WCAG 2.5.8 requires interactive targets to be at least 24×24 CSS pixels.{" "}
        {small.length === 0 ? (
          "Every evaluated target meets the minimum size requirement."
        ) : (
          <span className="problem">Issue: {small.length} target(s) are smaller than 24×24 pixels.</span>
        )}
      </p>
      <p>
        {reflowFails ? (
          <span className="problem">
            Issue: At 320px viewport width, the page requires horizontal scrolling (WCAG 1.4.10), presenting barriers for users who rely on screen magnification.
          </span>
        ) : (
          "The layout fits a 320px-wide viewport without horizontal scrolling."
        )}
      </p>

      {shot && small.length > 0 && (
        <>
          <h2>Undersized targets on page</h2>
          <ul className="legend">
            <li data-tone="problem">Dashed outline: Smaller than 24×24 pixels</li>
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
