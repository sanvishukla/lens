import type { ScanRow } from "@/lib/reports";
import { ScanProgress } from "@/components/report/ScanProgress";

export function ReportPending({ scan }: { scan: ScanRow }) {
  if (scan.status === "failed") {
    return (
      <>
        <h1>The scan failed</h1>
        <p className="error">{scan.error ?? "Something went wrong while loading the page."}</p>
      </>
    );
  }
  return (
    <>
      <h1>Scanning…</h1>
      <ScanProgress shareId={scan.share_id} initialStatus={scan.status} />
    </>
  );
}
