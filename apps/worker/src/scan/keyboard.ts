import type { Page } from "playwright";
import type { TabStop } from "@lens/core";

const MAX_STOPS = 150;

/** Presses Tab through the page, recording each focused element. Requires `installDomHelpers`. */
export async function tabPath(page: Page): Promise<{ stops: TabStop[]; trapped: boolean }> {
  const stops: TabStop[] = [];
  const seen = new Set<string>();
  let trapped = false;

  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

  for (let i = 0; i < MAX_STOPS; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body || el === document.documentElement) return null;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
      return {
        selector: window.__lensPath!(el),
        name: (
          el.getAttribute("aria-label") ||
          (el as HTMLElement).innerText ||
          el.getAttribute("title") ||
          ""
        )
          .trim()
          .slice(0, 80),
        box: { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height },
        focusVisible: outline || style.boxShadow !== "none",
      };
    });

    if (!info) break;
    if (seen.has(info.selector)) {
      trapped = info.selector !== stops[0]?.selector;
      break;
    }
    seen.add(info.selector);
    stops.push({ index: stops.length, ...info });
  }

  return { stops, trapped };
}
