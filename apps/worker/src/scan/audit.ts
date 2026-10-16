import AxeBuilder from "@axe-core/playwright";
import type { Page } from "playwright";
import { groupsForRule, wcagFromAxeTags, type Finding } from "@lens/core";

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

export async function runAxe(page: Page): Promise<{ findings: Finding[]; axeVersion: string }> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const findings: Finding[] = results.violations.map((v) => ({
    ruleId: v.id,
    engine: "axe",
    impact: v.impact ?? "minor",
    wcag: wcagFromAxeTags(v.tags),
    groups: groupsForRule(v.id),
    description: v.description,
    help: v.help,
    helpUrl: v.helpUrl,
    nodes: v.nodes.map((n) => ({
      selector: n.target.map((t) => (Array.isArray(t) ? t.join(" >>> ") : t)).join(" "),
      html: n.html,
      summary: n.failureSummary,
    })),
  }));
  return { findings, axeVersion: results.testEngine.version };
}
