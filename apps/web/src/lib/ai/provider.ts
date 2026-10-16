import "server-only";

export type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

export type Provider = "groq" | "gemini" | "ollama";

/** All three expose an OpenAI-compatible chat completions endpoint. */
function baseUrl(provider: Provider): string {
  switch (provider) {
    case "groq":
      return "https://api.groq.com/openai/v1";
    case "gemini":
      return "https://generativelanguage.googleapis.com/v1beta/openai";
    case "ollama":
      return `${process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"}/v1`;
  }
}

const KEY_ENV: Record<Provider, string | null> = {
  groq: "GROQ_API_KEY",
  gemini: "GEMINI_API_KEY",
  ollama: null,
};

export function activeProvider(): Provider {
  const value = process.env.AI_PROVIDER ?? "groq";
  if (value === "groq" || value === "gemini" || value === "ollama") return value;
  throw new Error(`Unknown AI_PROVIDER "${value}"`);
}

export interface ChatResult {
  provider: Provider;
  model: string;
  content: string;
}

export async function chat(messages: ChatMessage[], { vision = false } = {}): Promise<ChatResult> {
  const provider = activeProvider();
  const modelEnv = vision ? "AI_VISION_MODEL" : "AI_TEXT_MODEL";
  const model = process.env[modelEnv];
  if (!model) throw new Error(`Set ${modelEnv} for provider ${provider}`);

  const headers: Record<string, string> = { "content-type": "application/json" };
  const keyEnv = KEY_ENV[provider];
  if (keyEnv) {
    const key = process.env[keyEnv];
    if (!key) throw new Error(`Set ${keyEnv} to use ${provider}`);
    headers.authorization = `Bearer ${key}`;
  }

  const res = await fetch(`${baseUrl(provider)}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages, temperature: 0.2 }),
  });
  if (!res.ok) throw new Error(`${provider} returned ${res.status}: ${await res.text()}`);

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return { provider, model, content: json.choices?.[0]?.message?.content?.trim() ?? "" };
}
