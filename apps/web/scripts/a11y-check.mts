/**
 * Accessibility checks for Lens's own UI. Start the app first (npm run dev or npm start), then:
 *   npm run a11y --workspace @lens/web          (BASE_URL defaults to http://localhost:3000)
 *
 * Runs axe (WCAG 2.2 A/AA + best practice) on every page in light and dark mode at 1280px and 320px,
 * checks for sideways scrolling at 320px, and walks the main keyboard flows.
 */
import AxeBuilder from "@axe-core/playwright";
import { chromium, type Page } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const PAGES = [
  "/",
  "/login",
  "/accessibility",
  "/r/demo",
  "/r/demo/screen-reader",
  "/r/demo/vision",
  "/r/demo/keyboard",
  "/r/demo/targets",
  "/r/demo/fixes",
  "/r/does-not-exist",
];
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "320px", width: 320, height: 640 },
];
const SCHEMES = ["light", "dark"] as const;

const failures: string[] = [];
const fail = (msg: string) => failures.push(msg);

async function focusInfo(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    if (el.tagName.toLowerCase() === "nextjs-portal") return null;
    const style = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 60),
      outline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) >= 2,
      invalid: el.getAttribute("aria-invalid"),
    };
  });
}

const browser = await chromium.launch();

for (const scheme of SCHEMES) {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ colorScheme: scheme, viewport: vp, reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const path of PAGES) {
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      const label = `${path} [${scheme}, ${vp.name}]`;
      // .lens-ring is the home page's sample shop: deliberately flawed, aria-hidden, and described in text beside it.
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"])
        .exclude(".lens-ring")
        .analyze();
      for (const v of violations) {
        fail(`${label} axe ${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")})`);
      }
      if (vp.width === 320) {
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (overflow > 0) fail(`${label} scrolls sideways by ${overflow}px (WCAG 1.4.10)`);
      }
      if (!(await page.title())) fail(`${label} has no <title>`);
    }
    await context.close();
  }
}

// Keyboard flows ---------------------------------------------------------------------------------
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.keyboard.press("Tab");
let f = await focusInfo(page);
if (f?.text !== "Skip to main content") fail(`first Tab should reach the skip link, got ${JSON.stringify(f)}`);
if (!f?.outline) fail("skip link has no visible focus outline");
await page.keyboard.press("Enter");
f = await focusInfo(page);
if (f?.tag !== "main") fail(`skip link should move focus to <main>, got ${JSON.stringify(f)}`);

await page.goto(BASE + "/", { waitUntil: "networkidle" });
for (let i = 0; i < 30; i++) {
  await page.keyboard.press("Tab");
  f = await focusInfo(page);
  if (!f) break;
  if (!f.outline) fail(`home tab stop ${i + 1} (${f.tag} "${f.text}") has no visible focus`);
}

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Scan page" }).focus();
await page.keyboard.press("Enter");
f = await focusInfo(page);
if (f?.tag !== "input" || f.invalid !== "true") fail(`empty scan should focus the invalid field, got ${JSON.stringify(f)}`);

await page.goto(BASE + "/r/demo/fixes", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Draft alt text" }).first().focus();
await page.keyboard.press("Enter");
await page.getByRole("heading", { name: /AI draft/ }).first().waitFor();
f = await focusInfo(page);
if (f?.tag !== "h4" || !f.text.startsWith("AI draft")) fail(`new AI draft should receive focus, got ${JSON.stringify(f)}`);
await page.getByRole("button", { name: "Edit" }).first().focus();
await page.keyboard.press("Enter");
f = await focusInfo(page);
if (f?.tag !== "textarea") fail(`Edit should focus the editor, got ${JSON.stringify(f)}`);
await page.getByRole("button", { name: "Save my version" }).first().focus();
await page.keyboard.press("Enter");
await page.getByText("Your edited version is saved.").first().waitFor();
f = await focusInfo(page);
if (f?.tag !== "h4") fail(`after saving, focus should return to the draft heading, got ${JSON.stringify(f)}`);

await browser.close();

if (failures.length) {
  console.error(`${failures.length} accessibility problem(s):\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log(`OK: ${PAGES.length} pages x ${SCHEMES.length} color schemes x ${VIEWPORTS.length} widths, plus keyboard flows`);
