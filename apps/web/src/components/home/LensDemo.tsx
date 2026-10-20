"use client";

import { colorVisionMatrix, toFeColorMatrixValues } from "@lens/core";
import { useId, useState } from "react";

const MODES = [
  {
    id: "original",
    label: "Default view",
    caption: "The standard storefront design as rendered for users without vision impairments.",
  },
  {
    id: "color",
    label: "Color vision",
    caption:
      "With deuteranopia (green blindness), the red Buy button and green Sale button appear as the same olive tone, leaving color as the sole differentiator.",
  },
  {
    id: "blur",
    label: "Low vision",
    caption:
      "Under blurred vision, low-contrast text such as delivery details fades significantly, failing WCAG contrast guidelines (2.1:1 vs required 4.5:1).",
  },
  {
    id: "speech",
    label: "Screen reader",
    caption:
      "A screen reader announces an unnamed 'button' for the cart and an undescribed 'image' for the bouquet, creating navigation dead ends.",
  },
  {
    id: "keys",
    label: "Keyboard",
    caption: "Tabbing moves through interactive elements. On the Sale button, focus is completely invisible, causing users to lose their position.",
  },
] as const;

type ModeId = (typeof MODES)[number]["id"];

const TRANSCRIPT = [
  { text: "Bloom, link" },
  { text: "Fresh flowers, heading level 1" },
  { text: "Buy, button" },
  { text: "button", problem: "No name" },
  { text: "image", problem: "No description" },
];

export function LensDemo() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [mode, setMode] = useState<ModeId>("original");
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];

  return (
    <div className="lens-demo">
      <svg aria-hidden="true" focusable="false" width="0" height="0" className="filter-defs">
        <filter id={`${uid}-cvd`}>
          <feColorMatrix type="matrix" values={toFeColorMatrixValues(colorVisionMatrix("deuteranopia", 1))} />
        </filter>
      </svg>

      {/* The mock is decorative; the caption below carries the meaning for screen reader users. */}
      <div className="lens-ring" aria-hidden="true">
        <div
          className="lens-view"
          data-mode={mode}
          style={mode === "color" ? { filter: `url(#${uid}-cvd)` } : undefined}
        >
          <div className="mock">
            <div className="mock-bar">
              <span className="mock-logo">Bloom</span>
              <span className="mock-cart" data-key="1" />
            </div>
            <div className="mock-title">Fresh flowers</div>
            <div className="mock-sub">Same-day delivery before 2pm</div>
            <div className="mock-actions">
              <span className="mock-btn buy" data-key="2">Buy</span>
              <span className="mock-btn sale" data-key="3" data-nofocus="true">Sale</span>
            </div>
            <div className="mock-product" data-key="4">
              <span className="mock-photo" />
              <span className="mock-name">Peony bouquet</span>
              <span className="mock-price">$48</span>
            </div>
          </div>

          {mode === "speech" && (
            <ol className="mock-transcript">
              {TRANSCRIPT.map((line) => (
                <li key={line.text} data-problem={line.problem ? "true" : undefined}>
                  {line.text}
                  {line.problem && <strong> {line.problem}</strong>}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <fieldset className="lens-picker">
        <legend>Switch the glass</legend>
        <div className="lens-options">
          {MODES.map((m) => (
            <label key={m.id} className="lens-option">
              <input
                type="radio"
                name={`${uid}-mode`}
                value={m.id}
                checked={mode === m.id}
                onChange={() => setMode(m.id)}
              />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p className="lens-caption" aria-live="polite">
        {current.caption}
      </p>
    </div>
  );
}
