import type { Metadata } from "next";
import { ReadingOrder } from "@/components/lenses/ReadingOrder";
import { ReportPending } from "@/components/report/ReportPending";
import { loadReport } from "@/lib/reports";

export const metadata: Metadata = { title: "Screen reader lens" };

export default async function ScreenReaderPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const { scan, result } = await loadReport(reportId);
  if (!result) return <ReportPending scan={scan} />;

  return (
    <>
      <h1>Screen reader</h1>
      <p>
        The page rendered in the sequential order a screen reader traverses it, generated from the browser&apos;s accessibility tree. This serves as an interactive preview, not a substitute for testing with full screen readers like NVDA, JAWS, or VoiceOver.
      </p>
      <ReadingOrder nodes={result.readingOrder} />
    </>
  );
}
