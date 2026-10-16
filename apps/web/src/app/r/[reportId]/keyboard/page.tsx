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
      <h1>Tab</h1>
      <p>
        Lens pressed Tab through the page and recorded where focus went. {stops.length} tab stops.{" "}
        {invisible > 0 && <span className="problem">Problem: {invisible} show no visible focus. </span>}
        {result.keyboardTrap && (
          <span className="problem">Problem: focus gets trapped before reaching the end of the page.</span>
        )}
      </p>

      {shot && (
        <>
          <h2>Tab path on the page</h2>
          <ul className="legend">
            <li>Solid outline: focus is visible</li>
            <li data-tone="problem">Dashed outline: no visible focus</li>
          </ul>
          <BoxOverlay
            src={shot.url}
            alt="Screenshot of the page with each tab stop numbered in order. The same stops are listed under Tab order."
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

      <h2>Tab order</h2>
      <ol>
        {stops.map((s) => (
          <li key={s.index}>
            <strong>{s.label ?? s.name}</strong>
            {!s.name && <span className="problem"> No accessible name.</span>}{" "}
            <code>{s.selector}</code>
            {!s.focusVisible && <span className="problem"> No visible focus.</span>}
          </li>
        ))}
      </ol>
    </>
  );
}
