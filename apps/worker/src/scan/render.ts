import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { assertPublicUrl } from "../security/ssrf.ts";
import type { ScanJob } from "../queue.ts";

export const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  narrow: { width: 320, height: 640 },
} as const;

const NAVIGATION_TIMEOUT_MS = 20_000;
const SETTLE_TIMEOUT_MS = 5_000;

let browser: Browser | undefined;

async function getBrowser(): Promise<Browser> {
  browser ??= await chromium.launch();
  return browser;
}

export async function closeBrowser(): Promise<void> {
  await browser?.close();
  browser = undefined;
}

export async function openContext(viewport: { width: number; height: number }): Promise<BrowserContext> {
  const context = await (await getBrowser()).newContext({
    viewport,
    serviceWorkers: "block",
    acceptDownloads: false,
  });
  await context.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith("data:") || url.startsWith("blob:")) return route.continue();
    try {
      await assertPublicUrl(url);
      await route.continue();
    } catch {
      await route.abort("blockedbyclient");
    }
  });
  return context;
}

export async function loadPage(context: BrowserContext, job: ScanJob): Promise<Page> {
  const page = await context.newPage();
  if (job.kind === "html") {
    await page.setContent(job.html ?? "", { waitUntil: "load", timeout: NAVIGATION_TIMEOUT_MS });
  } else if (job.kind === "url" && job.url) {
    await page.goto(job.url, { waitUntil: "load", timeout: NAVIGATION_TIMEOUT_MS });
  } else {
    throw new Error(`Scan kind "${job.kind}" is not supported by the worker yet`);
  }
  // Pages with long-polling or analytics beacons never reach networkidle.
  await page.waitForLoadState("networkidle", { timeout: SETTLE_TIMEOUT_MS }).catch(() => {});
  return page;
}
