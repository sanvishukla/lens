import type { Page } from "playwright";

/** WCAG 1.4.10: at 320 CSS px wide, content should not need horizontal scrolling. */
export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
}
