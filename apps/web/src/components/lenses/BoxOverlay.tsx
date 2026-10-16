import type { Box } from "@lens/core";

export interface OverlayBox {
  box: Box;
  label: string;
  tone: "ok" | "problem";
}

/** Boxes are in page pixels; they're placed as percentages so the screenshot can scale. */
export function BoxOverlay({
  src,
  alt,
  width,
  height,
  boxes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  boxes: OverlayBox[];
}) {
  return (
    <div className="overlay">
      {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL */}
      <img src={src} alt={alt} width={width} height={height} />
      {boxes
        .filter((b) => b.box.y < height)
        .map((b, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="overlay-box"
            data-tone={b.tone}
            style={{
              left: `${(b.box.x / width) * 100}%`,
              top: `${(b.box.y / height) * 100}%`,
              width: `${(b.box.width / width) * 100}%`,
              height: `${(b.box.height / height) * 100}%`,
            }}
          >
            {b.label && <span>{b.label}</span>}
          </div>
        ))}
    </div>
  );
}
