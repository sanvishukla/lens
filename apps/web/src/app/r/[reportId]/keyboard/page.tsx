import type { Metadata } from "next";
import { BoxOverlay } from "@/components/lenses/BoxOverlay";
import { ReportPending } from "@/components/report/ReportPending";
import { loadReport, screenshotUrl } from "@/lib/reports";

export const metadata: Metadata = { title: "Keyboard lens" };

export default async function KeyboardPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const { scan, result } = await loadReport(reportId);
  if (!result) return <ReportPending scan={scan} />;

  const shot = await screenshotUrl(result, "desktop");
  const stops = result.tabStops;
  const invisible = stops.filter((s) => !s.focusVisible).length;

  return (
    <>
      <h1>Keyboard navigation</h1>
      <p>
        Lens navigated through the page using Tab key presses and mapped the focus path. {stops.length} tab stop(s) recorded.{" "}
        {invisible > 0 && <span className="problem">Issue: {invisible} stop(s) show no visible focus indicator. </span>}
        {result.keyboardTrap && (
          <span className="problem">Issue: Focus gets trapped within a component before reaching the end of the page.</span>
        )}
      </p>

      {shot && (
        <>
          <h2>Tab sequence on page</h2>
          <ul className="legend">
            <li>Solid outline: Focus indicator is visible</li>
            <li data-tone="problem">Dashed outline: Missing visible focus indicator</li>
          </ul>
          <BoxOverlay
            src={shot.url}
            alt="Screenshot of the page with each tab stop numbered in sequential order. The same stops are listed under Tab sequence."
            width={shot.capture.width}
            height={shot.capture.pageHeight}
            boxes={stops.map((s) => ({
              box: s.box,
              label: String(s.index + 1),
              tone: s.focusVisible ? "ok" : "problem",
            }))}
          />
        </>
      )}

      <h2>Tab sequence</h2>
      <ol>
        {stops.map((s) => (
          <li key={s.index}>
            <strong>{s.label ?? s.name}</strong>
            {!s.name && <span className="problem"> Missing accessible name.</span>}{" "}
            <code>{s.selector}</code>
            {!s.focusVisible && <span className="problem"> No visible focus indicator.</span>}
          </li>
        ))}
      </ol>
    </>
  );
}
