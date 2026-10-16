/** sRGB channels in 0–255. */
export type Rgb = readonly [number, number, number];

export function srgbToLinear(channel: number): number {
  const s = channel / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function linearToSrgb(value: number): number {
  const v = Math.min(1, Math.max(0, value));
  const s = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055;
  return Math.round(s * 255);
}

export function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG 2.x contrast ratio, 1–21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** WCAG 1.4.3: 4.5:1 for normal text, 3:1 for large text (≥24px, or ≥18.66px bold). */
export function passesContrastAA(ratio: number, largeText = false): boolean {
  return ratio >= (largeText ? 3 : 4.5);
}
