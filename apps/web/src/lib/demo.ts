import type { Finding, ScanResult } from "@lens/core";
import type { FindingRow, ScanRow } from "@/lib/reports";
import type { SuggestionKind } from "@/lib/suggestion-kinds";

/** A fixed example report so the UI can be explored without Supabase or an AI key. */
export const DEMO_SHARE_ID = "demo";

const DEMO_SCAN_ID = "00000000-0000-4000-8000-000000000000";

export const demoScan: ScanRow = {
  id: DEMO_SCAN_ID,
  share_id: DEMO_SHARE_ID,
  kind: "url",
  url: "https://bloom-market.example/",
  status: "done",
  error: null,
  result: null,
  created_at: "2026-10-13T00:00:00Z",
};

const findings: (Finding & { id: string })[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    ruleId: "image-alt",
    engine: "axe",
    impact: "critical",
    wcag: ["1.1.1"],
    groups: ["blind"],
    description: "Ensures <img> elements have alternate text or a role of none or presentation",
    help: "The peony and sunflower photos have no description",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.13/image-alt",
    nodes: [
      {
        selector: ".product:nth-child(1) > img",
        html: '<img src="/img/peony-bouquet.jpg" class="product-photo">',
        summary: "Peony photo. A screen reader says only \"image\". The pink bouquet is never described.",
      },
      {
        selector: ".product:nth-child(2) > img",
        html: '<img src="/img/sunflower-jar.jpg" class="product-photo">',
        summary: "Sunflower photo. Same gap: the jar of sunflowers is visible, and unspoken.",
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    ruleId: "button-name",
    engine: "axe",
    impact: "critical",
    wcag: ["4.1.2"],
    groups: ["blind"],
    description: "Ensures buttons have discernible text",
    help: "The cart is a burgundy square with no name",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.13/button-name",
    nodes: [
      {
        selector: "header > .cart",
        html: '<button class="cart"><svg viewBox="0 0 24 24">…</svg></button>',
        summary: "Top-right cart icon. Heard as \"button\", so there is no way to tell it opens the bag.",
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    ruleId: "color-contrast",
    engine: "axe",
    impact: "serious",
    wcag: ["1.4.3"],
    groups: ["low-vision", "color-vision"],
    description: "Ensures the contrast between foreground and background colors meets WCAG 2 AA thresholds",
    help: "The delivery line and the prices are light grey on white",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.13/color-contrast",
    nodes: [
      {
        selector: ".hero > p",
        html: '<p style="color:#b0b0b0">Same-day delivery on orders placed before 2pm.</p>',
        summary: "\"Same-day delivery on orders placed before 2pm.\" is #b0b0b0 on white, 2.1:1. It needs 4.5:1.",
      },
      {
        selector: ".price",
        html: '<span class="price">$48</span>',
        summary: "Prices $48, $36, and $29 use the same grey. The numbers wash out next to the product names.",
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    ruleId: "target-size",
    engine: "axe",
    impact: "serious",
    wcag: ["2.5.8"],
    groups: ["motor"],
    description: "Ensures touch targets have sufficient size and space",
    help: "The cart and the social icons are smaller than a fingertip",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.13/target-size",
    nodes: [
      {
        selector: "header > .cart",
        html: '<button class="cart">…</button>',
        summary: "Cart icon is 20 by 20 pixels. The minimum is 24 by 24.",
      },
      {
        selector: "footer .social:nth-child(1)",
        html: '<a class="social" href="https://instagram.com/">…</a>',
        summary: "Instagram and Facebook icons in the footer are 16 by 16 pixels, and they sit 8 pixels apart.",
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    ruleId: "lens-focus-not-visible",
    engine: "lens",
    impact: "serious",
    wcag: ["2.4.7"],
    groups: ["keyboard"],
    description: "Interactive elements show no visible change when they receive keyboard focus",
    help: "Tab reaches Sale and the cart, but neither shows where you are",
    nodes: [
      {
        selector: "header > .cart",
        html: '<button class="cart" style="outline:none">…</button>',
        summary: "Cart icon. outline is set to none, so the fourth Tab stop is invisible.",
      },
      {
        selector: ".hero .sale",
        html: '<a class="sale" href="/sale" style="outline:none">Sale</a>',
        summary: "Green Sale button. Focus lands on it and the outline is removed, so the highlight never appears.",
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    ruleId: "heading-order",
    engine: "axe",
    impact: "moderate",
    wcag: [],
    groups: ["blind", "cognitive"],
    description: "Ensures the order of headings is semantically correct",
    help: "\"Why Bloom\" skips from heading level 1 to level 4",
    helpUrl: "https://dequeuniversity.com/rules/axe/4.13/heading-order",
    nodes: [
      {
        selector: ".why > h4",
        html: "<h4>Why Bloom</h4>",
        summary: "The only heading after \"Fresh flowers, delivered\" is an h4. Levels 2 and 3 are missing.",
      },
    ],
  },
];

export const demoFindings: FindingRow[] = findings.map((f) => ({
  id: f.id,
  rule_id: f.ruleId,
  impact: f.impact,
  help: f.help,
  help_url: f.helpUrl ?? null,
  wcag: f.wcag,
  groups: f.groups,
  nodes: f.nodes,
}));

export const demoResult: ScanResult = {
  schemaVersion: 1,
  url: "https://bloom-market.example/",
  finalUrl: "https://bloom-market.example/",
  title: "Bloom Market: fresh flowers, delivered",
  captures: [{ name: "desktop", width: 1280, pageHeight: 1100, screenshotPath: "demo/desktop.svg" }],
  findings: findings.map(({ id: _id, ...f }) => f),
  readingOrder: [
    { role: "link", name: "Bloom Market" },
    { role: "navigation", name: "Main" },
    { role: "link", name: "Shop" },
    { role: "link", name: "About" },
    { role: "button", name: "", issue: "Cart icon. Heard as \"button\" with no name." },
    { role: "main", name: "" },
    { role: "heading", name: "Fresh flowers, delivered", level: 1 },
    { role: "text", name: "Same-day delivery on orders placed before 2pm." },
    { role: "link", name: "Buy now" },
    { role: "link", name: "Sale" },
    { role: "image", name: "", issue: "Peony photo. Heard as \"image\" with no description." },
    { role: "link", name: "Peony bouquet" },
    { role: "text", name: "$48" },
    { role: "image", name: "", issue: "Sunflower photo. Heard as \"image\" with no description." },
    { role: "link", name: "Sunflower jar" },
    { role: "text", name: "$36" },
    { role: "image", name: "Fern basket in a woven basket" },
    { role: "link", name: "Fern basket" },
    { role: "text", name: "$29" },
    { role: "heading", name: "Why Bloom", level: 4, issue: "Jumps from heading level 1, \"Fresh flowers, delivered\", to level 4." },
    { role: "text", name: "Grown locally, wrapped by hand, and delivered in reusable boxes." },
    { role: "contentinfo", name: "" },
    { role: "text", name: "© 2026 Bloom Market" },
    { role: "link", name: "Instagram" },
    { role: "link", name: "Facebook" },
  ].filter((n) => n.name || n.issue || n.role === "heading"),
  tabStops: [
    { index: 0, selector: "header > a.logo", name: "Bloom Market", label: "Logo", box: { x: 28, y: 18, width: 190, height: 36 }, focusVisible: true },
    { index: 1, selector: "nav a[href='/shop']", name: "Shop", label: "Shop", box: { x: 894, y: 24, width: 54, height: 28 }, focusVisible: true },
    { index: 2, selector: "nav a[href='/about']", name: "About", label: "About", box: { x: 964, y: 24, width: 62, height: 28 }, focusVisible: true },
    { index: 3, selector: "header > .cart", name: "", label: "Cart icon", box: { x: 1220, y: 26, width: 20, height: 20 }, focusVisible: false },
    { index: 4, selector: ".hero .buy", name: "Buy now", label: "Buy now", box: { x: 80, y: 280, width: 160, height: 48 }, focusVisible: true },
    { index: 5, selector: ".hero .sale", name: "Sale", label: "Sale button", box: { x: 260, y: 280, width: 120, height: 48 }, focusVisible: false },
    { index: 6, selector: ".product:nth-child(1) a", name: "Peony bouquet", label: "Peony bouquet", box: { x: 96, y: 620, width: 160, height: 28 }, focusVisible: true },
    { index: 7, selector: ".product:nth-child(2) a", name: "Sunflower jar", label: "Sunflower jar", box: { x: 476, y: 620, width: 150, height: 28 }, focusVisible: true },
    { index: 8, selector: ".product:nth-child(3) a", name: "Fern basket", label: "Fern basket", box: { x: 856, y: 620, width: 130, height: 28 }, focusVisible: true },
    { index: 9, selector: "footer .social:nth-child(1)", name: "Instagram", label: "Instagram", box: { x: 1100, y: 1046, width: 16, height: 16 }, focusVisible: true },
    { index: 10, selector: "footer .social:nth-child(2)", name: "Facebook", label: "Facebook", box: { x: 1124, y: 1046, width: 16, height: 16 }, focusVisible: true },
  ],
  keyboardTrap: false,
  targets: [
    { selector: "header > .cart", label: "Cart icon", box: { x: 1220, y: 26, width: 20, height: 20 }, tooSmall: true },
    { selector: ".hero .buy", box: { x: 80, y: 280, width: 160, height: 48 }, tooSmall: false },
    { selector: ".hero .sale", box: { x: 260, y: 280, width: 120, height: 48 }, tooSmall: false },
    { selector: "footer .social:nth-child(1)", label: "Instagram icon", box: { x: 1100, y: 1046, width: 16, height: 16 }, tooSmall: true },
    { selector: "footer .social:nth-child(2)", label: "Facebook icon", box: { x: 1124, y: 1046, width: 16, height: 16 }, tooSmall: true },
  ],
  engines: { axe: "4.13.0" },
};

const PEONY = "00000000-0000-4000-8000-000000000001";
const CART_NAME = "00000000-0000-4000-8000-000000000002";
const CONTRAST = "00000000-0000-4000-8000-000000000003";
const TARGETS = "00000000-0000-4000-8000-000000000004";
const FOCUS = "00000000-0000-4000-8000-000000000005";
const HEADING = "00000000-0000-4000-8000-000000000006";

/** Drafts are specific to the element, so the peony photo never gets the cart's label. */
const DEMO_DRAFTS: Record<string, Record<number, Partial<Record<SuggestionKind, string>>>> = {
  [PEONY]: {
    0: {
      alt_text: "Pink peonies wrapped in brown paper",
      explanation:
        "This is the first product photo, the peony bouquet. With no alt text a screen reader says \"image\" and moves on. Add alt=\"Pink peonies wrapped in brown paper\". The product name beside it does not replace the description.",
      patch: '<img src="/img/peony-bouquet.jpg" class="product-photo" alt="Pink peonies wrapped in brown paper">',
    },
    1: {
      alt_text: "Sunflowers in a glass jar",
      explanation:
        "This is the second product photo. It shows sunflowers in a jar and has no alt text, so it is announced as \"image\". Add alt=\"Sunflowers in a glass jar\".",
      patch: '<img src="/img/sunflower-jar.jpg" class="product-photo" alt="Sunflowers in a glass jar">',
    },
  },
  [CART_NAME]: {
    0: {
      label: "Shopping cart",
      explanation:
        "The burgundy square in the header is a cart button. It has an icon and no text, so a screen reader says \"button\". Add aria-label=\"Shopping cart\" and aria-hidden=\"true\" on the icon.",
      patch: '<button class="cart" aria-label="Shopping cart"><svg viewBox="0 0 24 24" aria-hidden="true">…</svg></button>',
    },
  },
  [CONTRAST]: {
    0: {
      explanation:
        "\"Same-day delivery on orders placed before 2pm.\" is #b0b0b0 on white, about 2.1:1. Body text needs 4.5:1. #595959 on white is about 7:1 and stays grey.",
      patch: '<p style="color:#595959">Same-day delivery on orders placed before 2pm.</p>',
    },
    1: {
      explanation: "The prices $48, $36, and $29 use the same #b0b0b0. Darken .price to #595959 so the numbers stay readable next to the product names.",
      patch: ".price { color: #595959; }",
    },
  },
  [TARGETS]: {
    0: {
      explanation: "The cart icon is 20 by 20 pixels. Give the button at least 24 by 24 pixels of padding so a thumb can hit it.",
      patch: ".cart { width: 44px; height: 44px; }",
    },
    1: {
      explanation: "The Instagram and Facebook icons are 16 by 16 pixels and nearly touching. Make each link 44 by 44 pixels so the icons stay small and the hit area does not.",
      patch: ".social { display: inline-flex; width: 44px; height: 44px; align-items: center; justify-content: center; }",
    },
  },
  [FOCUS]: {
    0: {
      explanation: "The cart button sets outline to none, so the fourth Tab stop has no visible marker. Remove that line and let the browser outline show, or draw a 3px ring.",
      patch: ".cart:focus-visible { outline: 3px solid #4b2bd6; outline-offset: 3px; }",
    },
    1: {
      explanation: "The green Sale link also removes its outline. Keyboard focus lands on it and nothing on screen changes. Keep a 3px ring on :focus-visible.",
      patch: ".sale:focus-visible { outline: 3px solid #17142b; outline-offset: 3px; }",
    },
  },
  [HEADING]: {
    0: {
      explanation:
        "\"Fresh flowers, delivered\" is an h1. \"Why Bloom\" is an h4, so anyone jumping by heading skips two levels. Change it to an h2.",
      patch: "<h2>Why Bloom</h2>",
    },
  },
};

export function demoDraft(kind: SuggestionKind, findingId: string, nodeIndex: number) {
  const content =
    DEMO_DRAFTS[findingId]?.[nodeIndex]?.[kind] ??
    "This example has no draft for that combination. On a real scan, the model writes one from the element.";
  return { id: crypto.randomUUID(), kind, content, status: "pending" };
}
