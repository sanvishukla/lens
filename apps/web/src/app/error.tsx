"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    document.title = "Something went wrong · Lens";
    headingRef.current?.focus();
  }, []);

  return (
    <div className="sheet">
      <h1 ref={headingRef} tabIndex={-1}>
        Something went wrong
      </h1>
      <p>Lens couldn&apos;t load this page. It may be a temporary problem.</p>
      <div className="button-row">
        <button type="button" onClick={reset}>
          Try again
        </button>
        <Link href="/">Go to the home page</Link>
      </div>
    </div>
  );
}
