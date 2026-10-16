import type { Page } from "playwright";
import type { Target } from "@lens/core";

/** WCAG 2.5.8 minimum target size, in CSS px. */
const MIN_TARGET_PX = 24;

/**
 * Measures interactive targets for the overlay. Inline links inside text are
 * exempt under 2.5.8 and skipped; axe's `target-size` rule handles the
 * spacing exception for pass/fail findings. Requires `installDomHelpers`.
 */
export async function measureTargets(page: Page): Promise<Target[]> {
  return page.evaluate((min) => {
    const selector = [
      "a[href]",
      "button",
      "input:not([type=hidden])",
      "select",
      "textarea",
      "summary",
      "[role=button]",
      "[role=link]",
      "[role=checkbox]",
      "[role=tab]",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");
    return Array.from(document.querySelectorAll(selector)).flatMap((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return [];
      if (el.tagName === "A" && getComputedStyle(el).display === "inline") return [];
      return [
        {
          selector: window.__lensPath!(el),
          box: { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height },
          tooSmall: rect.width < min || rect.height < min,
        },
      ];
    });
  }, MIN_TARGET_PX);
}
