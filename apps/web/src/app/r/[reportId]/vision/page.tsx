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
      <h1>See</h1>
      <p>
        Color-vision filters (Machado et al., 2009), blur, and washed-out contrast. Use them to catch meaning that lives
        only in hue, and type that fades.
      </p>
      <p>
        {contrastIssues === 0
          ? "No text contrast failures found."
          : `${contrastIssues} text elements fail WCAG contrast (1.4.3).`}
      </p>
      {shot ? <VisionSimulator src={shot.url} /> : <p>No screenshot was captured for this page.</p>}
    </>
  );
}
