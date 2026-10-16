"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

type Mode = "url" | "html";

function validate(mode: Mode, value: string): string | null {
  if (!value.trim()) return mode === "url" ? "Enter a web address to scan." : "Paste some HTML to scan.";
  if (mode === "url") {
    try {
      const url = new URL(value.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") return "The address must start with http:// or https://.";
    } catch {
      return "That isn't a full web address. Include https://, for example https://example.com.";
    }
  }
  if (mode === "html" && value.length > 200_000) return "That HTML is too long. Paste up to 200,000 characters.";
  return null;
}

export function ScanForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("url");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  const fieldId = mode === "url" ? "scan-url" : "scan-html";
  const hintId = `${fieldId}-hint`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const value = fieldRef.current?.value ?? "";
    const problem = validate(mode, value);
    setError(problem);
    if (problem) {
      fieldRef.current?.focus();
      return;
    }

    setPending(true);
    const body = mode === "url" ? { kind: "url", url: value.trim() } : { kind: "html", html: value };
    try {
      const res = await fetch("/api/scans", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as { shareId?: string; error?: string };
      if (!res.ok || !json.shareId) throw new Error(json.error ?? "Could not start the scan. Try again in a moment.");
      router.push(`/r/${json.shareId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the scan. Try again in a moment.");
      setPending(false);
      fieldRef.current?.focus();
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="scan-form" autoComplete="off">
      <fieldset>
        <legend>Load a page</legend>
        <div className="choice-row">
          <label className="choice">
            <input type="radio" name="mode" value="url" checked={mode === "url"} onChange={() => { setMode("url"); setError(null); }} />
            A web address
          </label>
          <label className="choice">
            <input type="radio" name="mode" value="html" checked={mode === "html"} onChange={() => { setMode("html"); setError(null); }} />
            Pasted HTML
          </label>
        </div>
      </fieldset>

      <div className="form-row">
        <label htmlFor={fieldId}>{mode === "url" ? "Page address" : "HTML"}</label>
        <p id={hintId} className="hint">
          {mode === "url"
            ? "A public page, starting with https://. Pages behind a login can't be scanned yet."
            : "A full page or a snippet. Nothing you paste is shared unless you share the report link."}
        </p>
        {error && (
          <p id={`${fieldId}-error`} className="error">
            <span className="visually-hidden">Error: </span>
            {error}
          </p>
        )}
        {mode === "url" ? (
          <input
            ref={fieldRef}
            id={fieldId}
            name="url"
            type="url"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${hintId} ${fieldId}-error` : hintId}
          />
        ) : (
          <textarea
            ref={fieldRef}
            id={fieldId}
            name="html"
            rows={8}
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${hintId} ${fieldId}-error` : hintId}
          />
        )}
      </div>

      <button type="submit" aria-disabled={pending || undefined}>
        {pending ? "Starting scan…" : "Scan page"}
      </button>
      <p role="status" className="visually-hidden">
        {pending ? "Starting scan. You'll be taken to the report." : ""}
      </p>
    </form>
  );
}
