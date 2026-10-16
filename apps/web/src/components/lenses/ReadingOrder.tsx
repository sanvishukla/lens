"use client";

import type { ReadingNode } from "@lens/core";
import { useEffect, useRef, useState } from "react";

function announce(node: ReadingNode): string {
  const parts = [node.name || "unlabeled", node.role];
  if (node.level) parts.push(`level ${node.level}`);
  return parts.join(", ");
}

export function ReadingOrder({ nodes }: { nodes: ReadingNode[] }) {
  const [current, setCurrent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(false);
  const runToken = useRef(0);
  const issueCount = nodes.filter((n) => n.issue).length;

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  function stop() {
    runToken.current++;
    window.speechSynthesis.cancel();
    setPlaying(false);
  }

  function play(from: number) {
    stop();
    const token = runToken.current;
    setPlaying(true);

    const speak = (i: number) => {
      if (token !== runToken.current) return;
      const node = nodes[i];
      if (!node) {
        setPlaying(false);
        setCurrent(null);
        return;
      }
      setCurrent(i);
      const utterance = new SpeechSynthesisUtterance(announce(node));
      utterance.rate = 1.2;
      utterance.onend = () => speak(i + 1);
      window.speechSynthesis.speak(utterance);
    };
    speak(from);
  }

  return (
    <>
      {supported && (
        <div className="toolbar">
          {/* One button whose label changes, so keyboard focus stays put when playback starts or stops. */}
          <button type="button" onClick={() => (playing ? stop() : play(current ?? 0))}>
            {playing ? "Stop listening" : current !== null ? "Resume listening" : "Listen to the page"}
          </button>
          <p className="hint">
            Uses your device&apos;s voice. If you already use a screen reader, you may prefer to read the list below
            directly.
          </p>
        </div>
      )}
      <h2 id="reading-order-title">Reading order</h2>
      <p>
        {nodes.length} items{issueCount > 0 && <>, {issueCount} with problems (marked &ldquo;Problem&rdquo;)</>}.
      </p>
      <ol className="reading-order" aria-labelledby="reading-order-title">
        {nodes.map((node, i) => (
          <li key={i} data-current={current === i || undefined}>
            <span className="role">{node.role}</span>
            {node.level ? <span className="role"> level {node.level}</span> : null}{" "}
            {node.name ? <span>{node.name}</span> : <em>(no name)</em>}
            {node.issue && (
              <span className="problem">
                {" "}
                Problem: {node.issue}
              </span>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
