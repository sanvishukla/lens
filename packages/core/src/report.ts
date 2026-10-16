import { z } from "zod";

export const impactSchema = z.enum(["critical", "serious", "moderate", "minor"]);
export type Impact = z.infer<typeof impactSchema>;

export const IMPACT_ORDER: Record<Impact, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

export const affectedGroupSchema = z.enum([
  "blind",
  "low-vision",
  "color-vision",
  "keyboard",
  "motor",
  "cognitive",
  "deaf-hoh",
]);
export type AffectedGroup = z.infer<typeof affectedGroupSchema>;

export const GROUP_LABELS: Record<AffectedGroup, string> = {
  blind: "Screen readers",
  "low-vision": "Zoom and low vision",
  "color-vision": "Color as the only cue",
  keyboard: "Keyboard only",
  motor: "Touch and motor",
  cognitive: "Reading and focus",
  "deaf-hoh": "Sound off",
};

export const boxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});
export type Box = z.infer<typeof boxSchema>;

export const findingNodeSchema = z.object({
  selector: z.string(),
  html: z.string(),
  summary: z.string().optional(),
  box: boxSchema.optional(),
});
export type FindingNode = z.infer<typeof findingNodeSchema>;

export const findingSchema = z.object({
  ruleId: z.string(),
  engine: z.enum(["axe", "lens"]),
  impact: impactSchema,
  wcag: z.array(z.string()),
  groups: z.array(affectedGroupSchema),
  description: z.string(),
  help: z.string(),
  helpUrl: z.url().optional(),
  nodes: z.array(findingNodeSchema),
});
export type Finding = z.infer<typeof findingSchema>;

export const readingNodeSchema = z.object({
  role: z.string(),
  name: z.string(),
  level: z.number().int().optional(),
  issue: z.string().optional(),
});
export type ReadingNode = z.infer<typeof readingNodeSchema>;

export const tabStopSchema = z.object({
  index: z.number().int(),
  selector: z.string(),
  name: z.string(),
  /** Plain-language place on the page, shown ahead of the CSS selector. */
  label: z.string().optional(),
  box: boxSchema,
  focusVisible: z.boolean(),
});
export type TabStop = z.infer<typeof tabStopSchema>;

export const targetSchema = z.object({
  selector: z.string(),
  /** Plain-language place on the page, shown ahead of the CSS selector. */
  label: z.string().optional(),
  box: boxSchema,
  tooSmall: z.boolean(),
});
export type Target = z.infer<typeof targetSchema>;

export const captureSchema = z.object({
  name: z.enum(["desktop", "narrow"]),
  width: z.number(),
  pageHeight: z.number(),
  screenshotPath: z.string(),
});
export type Capture = z.infer<typeof captureSchema>;

export const scanResultSchema = z.object({
  schemaVersion: z.literal(1),
  url: z.string(),
  finalUrl: z.string(),
  title: z.string(),
  captures: z.array(captureSchema),
  findings: z.array(findingSchema),
  readingOrder: z.array(readingNodeSchema),
  tabStops: z.array(tabStopSchema),
  keyboardTrap: z.boolean(),
  targets: z.array(targetSchema),
  engines: z.object({ axe: z.string() }),
});
export type ScanResult = z.infer<typeof scanResultSchema>;
