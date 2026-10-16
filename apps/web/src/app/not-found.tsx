import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="sheet">
      <h1>Nothing in the frame</h1>
      <p>This link may have expired. Shared reports are kept for 30 days unless the owner pins them.</p>
      <p>
        <Link href="/">Load a new page</Link>
      </p>
    </div>
  );
}
