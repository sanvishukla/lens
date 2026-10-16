import "server-only";
import { chat, type ChatResult, type ContentPart } from "@/lib/ai/provider";
import { altTextPrompt, explanationPrompt, labelPrompt, patchPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { retrieveGuidance } from "@/lib/rag/retrieve";
import type { SuggestionKind } from "@/lib/suggestion-kinds";

export interface SuggestionInput {
  kind: SuggestionKind;
  ruleId: string;
  help: string;
  wcag: string[];
  html: string;
  pageUrl: string | null;
  pageTitle: string;
}

function imageSrc(html: string, pageUrl: string | null): string | null {
  const src = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(html)?.[1];
  if (!src) return null;
  if (src.startsWith("data:image/")) return src;
  try {
    const url = new URL(src, pageUrl ?? undefined);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function draftSuggestion(input: SuggestionInput): Promise<ChatResult> {
  const system = { role: "system" as const, content: SYSTEM_PROMPT };

  switch (input.kind) {
    case "alt_text": {
      const src = imageSrc(input.html, input.pageUrl);
      const parts: ContentPart[] = [{ type: "text", text: altTextPrompt(input) }];
      if (src) parts.push({ type: "image_url", image_url: { url: src } });
      return chat([system, { role: "user", content: parts }], { vision: Boolean(src) });
    }
    case "label":
      return chat([system, { role: "user", content: labelPrompt(input) }]);
    case "explanation": {
      const guidance = await retrieveGuidance(`${input.ruleId} ${input.help}`);
      return chat([system, { role: "user", content: explanationPrompt({ ...input, guidance }) }]);
    }
    case "patch": {
      const guidance = await retrieveGuidance(`${input.ruleId} ${input.help}`);
      return chat([system, { role: "user", content: patchPrompt({ ...input, guidance }) }]);
    }
  }
}
