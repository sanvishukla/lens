"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <head>
        <title>Something went wrong · Lens</title>
      </head>
      <body style={{ fontFamily: "system-ui, sans-serif", margin: "2rem", lineHeight: 1.5 }}>
        <main>
          <h1>Something went wrong</h1>
          <p>Lens couldn&apos;t load. It may be a temporary problem.</p>
          <button type="button" onClick={reset} style={{ font: "inherit", minHeight: 44, padding: "0.5rem 1rem" }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
