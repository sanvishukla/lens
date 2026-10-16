import { scanResultSchema, type ScanResult } from "@lens/core";
import type { ScanJob } from "../queue.ts";
import { assertPublicUrl } from "../security/ssrf.ts";
import { runAxe } from "./audit.ts";
import { capture } from "./capture.ts";
import { installDomHelpers } from "./dom-helpers.ts";
import { tabPath } from "./keyboard.ts";
import { lensFindings } from "./lens-rules.ts";
import { readingOrder } from "./reading-order.ts";
import { hasHorizontalScroll } from "./reflow.ts";
import { loadPage, openContext, VIEWPORTS } from "./render.ts";
import { measureTargets } from "./targets.ts";

export async function runScan(job: ScanJob): Promise<ScanResult> {
  if (job.kind === "url") await assertPublicUrl(job.url ?? "");

  const desktop = await openContext(VIEWPORTS.desktop);
  const narrow = await openContext(VIEWPORTS.narrow);
  try {
    const page = await loadPage(desktop, job);
    await page.evaluate(installDomHelpers);

    const { findings, axeVersion } = await runAxe(page);
    const order = await readingOrder(page);
    const targets = await measureTargets(page);
    const desktopCapture = await capture(page, job.id, "desktop");
    const { stops, trapped } = await tabPath(page);

    const narrowPage = await loadPage(narrow, job);
    const reflowFails = await hasHorizontalScroll(narrowPage);
    const narrowCapture = await capture(narrowPage, job.id, "narrow");

    findings.push(...lensFindings({ stops, trapped, reflowFails }));

    return scanResultSchema.parse({
      schemaVersion: 1,
      url: job.url ?? "about:blank",
      finalUrl: page.url(),
      title: await page.title(),
      captures: [desktopCapture, narrowCapture],
      findings,
      readingOrder: order,
      tabStops: stops,
      keyboardTrap: trapped,
      targets,
      engines: { axe: axeVersion },
    });
  } finally {
    await Promise.all([desktop.close(), narrow.close()]);
  }
}
