import { linearToSrgb, srgbToLinear, type Rgb } from "./contrast.ts";

export const COLOR_VISION_TYPES = [
  "protanopia",
  "deuteranopia",
  "tritanopia",
  "achromatopsia",
] as const;
export type ColorVisionType = (typeof COLOR_VISION_TYPES)[number];

export function isColorVisionType(value: string): value is ColorVisionType {
  return (COLOR_VISION_TYPES as readonly string[]).includes(value);
}

type Row = readonly [number, number, number];
export type Matrix3 = readonly [Row, Row, Row];

/** Machado, Oliveira & Fernandes (2009), severity 1.0. Defined on linear RGB. */
const FULL_SEVERITY: Record<ColorVisionType, Matrix3> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
  achromatopsia: [
    [0.2126, 0.7152, 0.0722],
    [0.2126, 0.7152, 0.0722],
    [0.2126, 0.7152, 0.0722],
  ],
};

/**
 * Severity below 1 linearly blends toward identity. This approximates the
 * anomalous trichromacy tables in Machado et al.; swap in the per-severity
 * tables when exact anomalous simulation matters.
 */
export function colorVisionMatrix(type: ColorVisionType, severity = 1): Matrix3 {
  const s = Math.min(1, Math.max(0, severity));
  const full = FULL_SEVERITY[type];
  const blendRow = (row: Row, i: number): Row => [
    (i === 0 ? 1 : 0) * (1 - s) + row[0] * s,
    (i === 1 ? 1 : 0) * (1 - s) + row[1] * s,
    (i === 2 ? 1 : 0) * (1 - s) + row[2] * s,
  ];
  return [blendRow(full[0], 0), blendRow(full[1], 1), blendRow(full[2], 2)];
}

/** `values` for an SVG `<feColorMatrix type="matrix">`, which filters in linearRGB by default. */
export function toFeColorMatrixValues(matrix: Matrix3): string {
  return [...matrix.map((row) => [...row, 0, 0].join(" ")), "0 0 0 1 0"].join(" ");
}

export function simulateColor(rgb: Rgb, type: ColorVisionType, severity = 1): Rgb {
  const [m0, m1, m2] = colorVisionMatrix(type, severity);
  const lin = [srgbToLinear(rgb[0]), srgbToLinear(rgb[1]), srgbToLinear(rgb[2])] as const;
  const apply = (row: Row) => row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2];
  return [linearToSrgb(apply(m0)), linearToSrgb(apply(m1)), linearToSrgb(apply(m2))];
}
