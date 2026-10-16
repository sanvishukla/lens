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
          <strong>Bloom Market, a made-up flower shop.</strong> Each note below names the part of the page it is about:
          the cart icon, the peony photo, the grey prices, the Sale button.
        </p>
      )}
      <div className="report-head">
        <p className="eyebrow">Looking at</p>
        <p className="report-title">{result?.title || target}</p>
        {result?.title && <p className="report-url">{target}</p>}
      </div>
      {result && <ReportNav reportId={reportId} />}
      {children}
    </div>
  );
}
