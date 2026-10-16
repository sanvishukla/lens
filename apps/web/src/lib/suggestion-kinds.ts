export const SUGGESTION_KINDS = ["alt_text", "label", "patch", "explanation"] as const;
export type SuggestionKind = (typeof SUGGESTION_KINDS)[number];

export const KIND_LABELS: Record<SuggestionKind, string> = {
  alt_text: "Draft alt text",
  label: "Draft a label",
  patch: "Suggest a code fix",
  explanation: "Explain this",
};

export const KIND_NOUNS: Record<SuggestionKind, string> = {
  alt_text: "alt text",
  label: "label",
  patch: "code fix",
  explanation: "explanation",
};

const ALT_RULES = new Set(["image-alt", "input-image-alt", "role-img-alt", "svg-img-alt", "area-alt"]);
const LABEL_RULES = new Set([
  "button-name",
  "input-button-name",
  "link-name",
  "label",
  "select-name",
  "aria-input-field-name",
]);

export function suggestionKindsFor(ruleId: string): SuggestionKind[] {
  if (ALT_RULES.has(ruleId)) return ["alt_text", "explanation", "patch"];
  if (LABEL_RULES.has(ruleId)) return ["label", "explanation", "patch"];
  return ["explanation", "patch"];
}
