"use client";

import { colorVisionMatrix, COLOR_VISION_TYPES, toFeColorMatrixValues, type ColorVisionType } from "@lens/core";
import { useId, useState } from "react";

type Mode = ColorVisionType | "blur" | "low-contrast";

const MODE_LABELS: Record<Mode, string> = {
  protanopia: "Protanopia (red-blind)",
  deuteranopia: "Deuteranopia (green-blind)",
  tritanopia: "Tritanopia (blue-blind)",
  achromatopsia: "Achromatopsia (no color)",
  blur: "Blurred vision",
  "low-contrast": "Reduced contrast sensitivity",
};

const MODES: Mode[] = [...COLOR_VISION_TYPES, "blur", "low-contrast"];

export function VisionSimulator({ src }: { src: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `cvd-${id}`;
  const [mode, setMode] = useState<Mode>("deuteranopia");
  const [severity, setSeverity] = useState(1);
  const percent = `${Math.round(severity * 100)}%`;

  const filter =
    mode === "blur"
      ? `blur(${severity * 4}px)`
      : mode === "low-contrast"
        ? `contrast(${1 - severity * 0.6}) brightness(${1 + severity * 0.15})`
        : `url(#${filterId})`;

  return (
    <>
      <div className="controls">
        <div className="form-row">
          <label htmlFor={`${id}-mode`}>Simulation</label>
          <select id={`${id}-mode`} value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            {MODES.map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label htmlFor={`${id}-severity`}>Severity</label>
          <div className="range-row">
            <input
              id={`${id}-severity`}
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={severity}
              aria-valuetext={percent}
              onChange={(e) => setSeverity(Number(e.target.value))}
            />
            <output htmlFor={`${id}-severity`} aria-hidden="true">
              {percent}
            </output>
          </div>
        </div>
      </div>

      <svg aria-hidden="true" focusable="false" width="0" height="0" className="filter-defs">
        {mode !== "blur" && mode !== "low-contrast" && (
          <filter id={filterId}>
            <feColorMatrix type="matrix" values={toFeColorMatrixValues(colorVisionMatrix(mode, severity))} />
          </filter>
        )}
      </svg>

      <div className="side-by-side">
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URL */}
          <img src={src} alt="Screenshot of the scanned page, unchanged" />
          <figcaption>Original</figcaption>
        </figure>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URL */}
          <img src={src} alt={`The same screenshot simulating ${MODE_LABELS[mode]} at ${percent} severity`} style={{ filter }} />
          <figcaption>
            {MODE_LABELS[mode]}, {percent}
          </figcaption>
        </figure>
      </div>
    </>
  );
}
