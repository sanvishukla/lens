"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MESSAGES: Record<string, string> = {
  queued: "Waiting for an available scanner. This usually takes a few seconds.",
  running: "Loading the page and running accessibility checks. This usually takes under a minute.",
  done: "Scan completed. Loading your report.",
  failed: "The scan could not be completed. Loading details.",
};

export function ScanProgress({ shareId, initialStatus }: { shareId: string; initialStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const timer = setInterval(async () => {
      const res = await fetch(`/api/scans/${shareId}`, { cache: "no-store" }).catch(() => null);
      if (!res?.ok) return;
      const json = (await res.json()) as { status: string };
      setStatus(json.status);
      if (json.status === "done" || json.status === "failed") {
        clearInterval(timer);
        router.refresh();
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [shareId, router]);

  return (
    <p role="status">
      {MESSAGES[status] ?? "Processing…"} This page updates automatically; no need to refresh.
    </p>
  );
}
