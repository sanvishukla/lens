import "server-only";

export const SYSTEM_PROMPT = [
  "You help web developers and designers fix accessibility problems.",
  "Follow WCAG 2.2. Prefer native HTML over ARIA.",
  "Never guess a person's identity, race, gender, age, or disability from an image; describe only what is visible and relevant.",
  "Reply with only the requested text. No preamble, no markdown fences unless asked for code.",
].join(" ");

export function altTextPrompt(input: { html: string; pageTitle: string }): string {
  return [
    `Write alt text for the image in this element on the page "${input.pageTitle}".`,
    "Keep it under 125 characters and describe the image's purpose in context.",
    'If the image is purely decorative, reply with exactly: DECORATIVE',
    "",
    input.html,
  ].join("\n");
}

export function labelPrompt(input: { html: string; pageTitle: string }): string {
  return [
    `This control on the page "${input.pageTitle}" has no accessible name.`,
    "Suggest a short, specific name (2–5 words) that says what it does, as a screen reader user would hear it.",
    "",
    input.html,
  ].join("\n");
}

export function explanationPrompt(input: { ruleId: string; help: string; wcag: string[]; guidance: string }): string {
  return [
    `Explain this accessibility problem in plain language for someone new to accessibility.`,
    `Rule: ${input.ruleId}. Summary: ${input.help}. WCAG: ${input.wcag.join(", ") || "best practice"}.`,
    "Cover: who it affects, what they experience, and how to fix it. Under 120 words.",
    "",
    "Relevant W3C guidance:",
    input.guidance || "(none retrieved)",
  ].join("\n");
}

export function patchPrompt(input: { ruleId: string; help: string; html: string; guidance: string }): string {
  return [
    `Fix this HTML so it passes the axe-core rule "${input.ruleId}" (${input.help}).`,
    "Change as little as possible and keep the visual result the same. Reply with only the corrected HTML.",
    "",
    "Relevant W3C guidance:",
    input.guidance || "(none retrieved)",
    "",
    "HTML:",
    input.html,
  ].join("\n");
}
