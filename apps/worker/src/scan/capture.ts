import type { Page } from "playwright";
import type { Capture } from "@lens/core";
import { SCREENSHOT_BUCKET, supabase } from "../supabase.ts";

const MAX_CAPTURE_HEIGHT = 6000;

export async function capture(page: Page, scanId: string, name: Capture["name"]): Promise<Capture> {
  const width = page.viewportSize()?.width ?? 1280;
  const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const pageHeight = Math.min(fullHeight, MAX_CAPTURE_HEIGHT);

  const image = await page.screenshot({
    fullPage: true,
    type: "jpeg",
    quality: 70,
    clip: { x: 0, y: 0, width, height: pageHeight },
  });

  const screenshotPath = `${scanId}/${name}.jpg`;
  const { error } = await supabase.storage
    .from(SCREENSHOT_BUCKET)
    .upload(screenshotPath, image, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;

  return { name, width, pageHeight, screenshotPath };
}
