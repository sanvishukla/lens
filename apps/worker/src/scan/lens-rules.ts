import { groupsForRule, type Finding, type TabStop } from "@lens/core";

/** Findings from Lens's own checks that axe-core doesn't cover. */
export function lensFindings(input: {
  stops: TabStop[];
  trapped: boolean;
  reflowFails: boolean;
}): Finding[] {
  const findings: Finding[] = [];

  const invisible = input.stops.filter((s) => !s.focusVisible);
  if (invisible.length > 0) {
    findings.push({
      ruleId: "lens-focus-not-visible",
      engine: "lens",
      impact: "serious",
      wcag: ["2.4.7"],
      groups: groupsForRule("lens-focus-not-visible"),
      description: "Keyboard focus should be visible on every focusable element.",
      help: "Focused elements have no visible focus indicator",
      nodes: invisible.map((s) => ({ selector: s.selector, html: "", box: s.box })),
    });
  }

  if (input.trapped) {
    const last = input.stops.at(-1);
    findings.push({
      ruleId: "lens-keyboard-trap",
      engine: "lens",
      impact: "critical",
      wcag: ["2.1.2"],
      groups: groupsForRule("lens-keyboard-trap"),
      description: "Keyboard users must be able to move focus away from every component.",
      help: "Tabbing gets stuck in a loop and never reaches the rest of the page",
      nodes: last ? [{ selector: last.selector, html: "", box: last.box }] : [],
    });
  }

  if (input.reflowFails) {
    findings.push({
      ruleId: "lens-reflow",
      engine: "lens",
      impact: "serious",
      wcag: ["1.4.10"],
      groups: groupsForRule("lens-reflow"),
      description: "At 320 CSS px wide (400% zoom), content should fit without horizontal scrolling.",
      help: "Page scrolls horizontally at 320 px width",
      nodes: [{ selector: "html", html: "" }],
    });
  }

  return findings;
}
