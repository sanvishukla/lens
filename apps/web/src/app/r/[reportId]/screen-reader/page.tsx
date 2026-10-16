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
      <h1>Listen</h1>
      <p>
        The page in the order a screen reader moves through it, from the browser&apos;s accessibility tree. This is a
        sketch, not a stand-in for NVDA, JAWS, or VoiceOver.
      </p>
      <ReadingOrder nodes={result.readingOrder} />
    </>
  );
}
