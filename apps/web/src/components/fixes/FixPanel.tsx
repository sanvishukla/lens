"use client";

import { useEffect, useRef, useState } from "react";
import { KIND_LABELS, KIND_NOUNS, type SuggestionKind } from "@/lib/suggestion-kinds";

interface Suggestion {
  id: string;
  kind: SuggestionKind;
  content: string;
  status: string;
}

const DECISION_MESSAGES: Record<string, string> = {
  accepted: "Accepted. Copy it into your code when you're ready.",
  edited: "Your edited version is saved.",
  rejected: "Rejected. Thanks, that helps improve the drafts.",
};

export function FixPanel({
  shareId,
  findingId,
  nodeIndex,
  nodeCount,
  html,
  kinds,
}: {
  shareId: string;
  findingId: string;
  nodeIndex: number;
  nodeCount: number;
  html: string;
  kinds: SuggestionKind[];
}) {
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Buttons disappear as the draft moves through its states; move focus somewhere sensible instead of losing it.
  const focusNext = useRef<"draft" | "editor" | null>(null);
  const draftHeadingRef = useRef<HTMLHeadingElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (focusNext.current === "draft") draftHeadingRef.current?.focus();
    if (focusNext.current === "editor") editorRef.current?.focus();
    focusNext.current = null;
  });

  const baseId = `fix-${findingId}-${nodeIndex}`;
  const elementLabel = nodeCount > 1 ? `Element ${nodeIndex + 1} of ${nodeCount}` : "Affected element";

  async function request(kind: SuggestionKind) {
    if (busy) return;
    setBusy(true);
    setError(null);
    setMessage(`Drafting ${KIND_NOUNS[kind]}…`);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ shareId, findingId, nodeIndex, kind }),
      });
      const json = (await res.json().catch(() => ({}))) as Partial<Suggestion> & { error?: string };
      if (!res.ok || !json.id) throw new Error(json.error ?? "Could not get a suggestion.");
      setSuggestion(json as Suggestion);
      setDraft(json.content ?? "");
      setEditing(false);
      setMessage("Draft ready. Review it below.");
      focusNext.current = "draft";
    } catch (err) {
      setMessage(null);
      setError(err instanceof Error ? err.message : "Could not get a suggestion.");
    } finally {
      setBusy(false);
    }
  }

  async function decide(status: "accepted" | "edited" | "rejected") {
    if (!suggestion || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/suggestions/${suggestion.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ shareId, status, ...(status === "edited" ? { finalContent: draft } : {}) }),
      });
      if (!res.ok) throw new Error("Could not save your choice. Try again.");
      setSuggestion({ ...suggestion, status, content: status === "edited" ? draft : suggestion.content });
      setEditing(false);
      setMessage(DECISION_MESSAGES[status] ?? "Saved.");
      focusNext.current = "draft";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your choice.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card fix-panel">
      <h3 id={`${baseId}-title`}>{elementLabel}</h3>
      <pre className="code">
        <code>{html}</code>
      </pre>

      <div className="button-row" role="group" aria-label={`Suggestions for ${elementLabel.toLowerCase()}`}>
        {kinds.map((kind) => (
          <button key={kind} type="button" className="secondary" aria-disabled={busy || undefined} onClick={() => request(kind)}>
            {KIND_LABELS[kind]}
          </button>
        ))}
      </div>

      <p role="status" className="status-message">
        {message}
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {suggestion && (
        <div className="ai-draft">
          <h4 ref={draftHeadingRef} tabIndex={-1}>
            AI draft: {KIND_NOUNS[suggestion.kind]}
            {suggestion.status !== "pending" && <span className="badge"> {suggestion.status}</span>}
          </h4>
          <p className="hint">Written by an AI model. Check it against the page before you use it.</p>

          {editing ? (
            <div className="form-row">
              <label htmlFor={`${baseId}-edit`}>Your version</label>
              <textarea
                ref={editorRef}
                id={`${baseId}-edit`}
                rows={5}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>
          ) : (
            <pre className="code">{suggestion.content}</pre>
          )}

          {suggestion.status === "pending" && (
            <div className="button-row">
              {editing ? (
                <>
                  <button
                    type="button"
                    aria-disabled={busy || !draft.trim() || undefined}
                    onClick={() => draft.trim() && decide("edited")}
                  >
                    Save my version
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setEditing(false);
                      setDraft(suggestion.content);
                      focusNext.current = "draft";
                    }}
                  >
                    Cancel editing
                  </button>
                </>
              ) : (
                <>
                  <button type="button" aria-disabled={busy || undefined} onClick={() => decide("accepted")}>
                    Accept
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setEditing(true);
                      focusNext.current = "editor";
                    }}
                  >
                    Edit
                  </button>
                  <button type="button" className="secondary" aria-disabled={busy || undefined} onClick={() => decide("rejected")}>
                    Reject
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
