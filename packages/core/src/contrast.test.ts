import { describe, expect, it } from "vitest";
import { contrastRatio, passesContrastAA } from "./contrast.ts";
import { simulateColor } from "./color-vision.ts";
import { wcagFromAxeTags } from "./wcag.ts";

describe("contrastRatio", () => {
  it("is 21:1 for black on white", () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
  });

  it("is 1:1 for identical colors", () => {
    expect(contrastRatio([120, 40, 200], [120, 40, 200])).toBeCloseTo(1, 5);
  });

  it("fails AA for #777 on white but passes for large text", () => {
    const ratio = contrastRatio([0x77, 0x77, 0x77], [255, 255, 255]);
    expect(passesContrastAA(ratio)).toBe(false);
    expect(passesContrastAA(ratio, true)).toBe(true);
  });
});

describe("simulateColor", () => {
  it("leaves grays unchanged for achromatopsia", () => {
    expect(simulateColor([128, 128, 128], "achromatopsia")).toEqual([128, 128, 128]);
  });

  it("is identity at severity 0", () => {
    expect(simulateColor([200, 30, 60], "protanopia", 0)).toEqual([200, 30, 60]);
  });
});

describe("wcagFromAxeTags", () => {
  it("maps criterion tags and ignores level tags", () => {
    expect(wcagFromAxeTags(["wcag2aa", "wcag143", "wcag1410", "best-practice"])).toEqual([
      "1.4.3",
      "1.4.10",
    ]);
  });
});
