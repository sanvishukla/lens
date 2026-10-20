import { ReportNav } from "@/components/report/ReportNav";
import { DEMO_SHARE_ID } from "@/lib/demo";
import { loadReport } from "@/lib/reports";

export default async function ReportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const { scan, result } = await loadReport(reportId);
  const target = result?.finalUrl ?? scan.url ?? "Pasted HTML";

  return (
    <div className="sheet">
      {reportId === DEMO_SHARE_ID && (
        <p className="notice">
          <strong>Bloom Market, a sample e-commerce storefront.</strong> Each finding below highlights a specific accessibility issue on the page: missing button names, absent image descriptions, low-contrast text, and invisible focus indicators.
        </p>
      )}
      <div className="report-head">
        <p className="eyebrow">Audited page</p>
        <p className="report-title">{result?.title || target}</p>
        {result?.title && <p className="report-url">{target}</p>}
      </div>
      {result && <ReportNav reportId={reportId} />}
      {children}
    </div>
  );
}
