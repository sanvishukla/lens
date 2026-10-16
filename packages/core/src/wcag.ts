import type { AffectedGroup } from "./report.ts";

const WCAG_TAG = /^wcag(\d)(\d)(\d+)$/;

/** axe tags like `wcag1410` → `1.4.10`. Level tags (`wcag2aa`) are ignored. */
export function wcagFromAxeTags(tags: readonly string[]): string[] {
  return tags.flatMap((tag) => {
    const match = WCAG_TAG.exec(tag);
    return match ? [`${match[1]}.${match[2]}.${match[3]}`] : [];
  });
}

const RULE_GROUPS: Record<string, AffectedGroup[]> = {
  "image-alt": ["blind"],
  "input-image-alt": ["blind"],
  "role-img-alt": ["blind"],
  "svg-img-alt": ["blind"],
  "area-alt": ["blind"],
  "button-name": ["blind"],
  "input-button-name": ["blind"],
  "link-name": ["blind"],
  label: ["blind", "cognitive"],
  "select-name": ["blind"],
  "aria-input-field-name": ["blind"],
  "frame-title": ["blind"],
  "color-contrast": ["low-vision", "color-vision"],
  "link-in-text-block": ["color-vision"],
  "html-has-lang": ["blind"],
  "html-lang-valid": ["blind"],
  "document-title": ["blind", "cognitive"],
  "heading-order": ["blind", "cognitive"],
  "page-has-heading-one": ["blind"],
  "empty-heading": ["blind"],
  region: ["blind"],
  "landmark-one-main": ["blind"],
  bypass: ["blind", "keyboard"],
  list: ["blind"],
  listitem: ["blind"],
  "meta-viewport": ["low-vision"],
  "scrollable-region-focusable": ["keyboard"],
  "aria-hidden-focus": ["blind", "keyboard"],
  "nested-interactive": ["blind", "keyboard"],
  "target-size": ["motor"],
  "video-caption": ["deaf-hoh"],
  "lens-focus-not-visible": ["keyboard", "low-vision"],
  "lens-keyboard-trap": ["keyboard"],
  "lens-reflow": ["low-vision"],
};

export function groupsForRule(ruleId: string): AffectedGroup[] {
  return RULE_GROUPS[ruleId] ?? [];
}
