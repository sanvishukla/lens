import type { Metadata } from "next";
import { VisionSimulator } from "@/components/lenses/VisionSimulator";
import { ReportPending } from "@/components/report/ReportPending";
import { loadReport, screenshotUrl } from "@/lib/reports";

export const metadata: Metadata = { title: "Vision lens" };

export default async function VisionPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const { scan, result } = await loadReport(reportId);
  if (!result) return <ReportPending scan={scan} />;

  const shot = await screenshotUrl(result, "desktop");
  const contrastIssues = result.findings.find((f) => f.ruleId === "color-contrast")?.nodes.length ?? 0;

  return (
    <>
      <h1>Vision simulation</h1>
      <p>
        Simulate color vision deficiencies (based on Machado et al., 2009), blur, and reduced contrast. Use these filters to identify information conveyed solely through color or text that loses legibility.
      </p>
      <p>
        {contrastIssues === 0
          ? "No text contrast failures detected."
          : `${contrastIssues} text element(s) fail WCAG contrast minimums (Criterion 1.4.3).`}
      </p>
      {shot ? <VisionSimulator src={shot.url} /> : <p>No screenshot was captured for this page.</p>}
    </>
  );
}
