import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { env } from "@/lib/env";

export interface ChatTurn { role: "user" | "assistant"; content: string }
export interface GenerateInput { model: string; system: string; messages: ChatTurn[]; maxOutputTokens: number }
export interface GenerateOutput { text: string; tokensIn: number; tokensOut: number; refused?: boolean }

export interface ChatProvider {
  id: "anthropic" | "openai";
  available(): boolean;
  generate(input: GenerateInput): Promise<GenerateOutput>;
}

const TIMEOUT_MS = 25_000;

const anthropicProvider: ChatProvider = {
  id: "anthropic",
  available: () => !!env.anthropicKey,
  async generate({ model, system, messages, maxOutputTokens }) {
    const client = new Anthropic({ apiKey: env.anthropicKey, timeout: TIMEOUT_MS, maxRetries: 1 });
    const res = await client.messages.create({
      model,
      // margem para o raciocínio interno do modelo além do texto visível
      max_tokens: maxOutputTokens + 1024,
      system,
      messages,
      output_config: { effort: "low" },
    });
    if (res.stop_reason === "refusal") {
      return { text: "", tokensIn: res.usage.input_tokens, tokensOut: res.usage.output_tokens, refused: true };
    }
    const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
    return { text, tokensIn: res.usage.input_tokens, tokensOut: res.usage.output_tokens };
  },
};

const openaiProvider: ChatProvider = {
  id: "openai",
  available: () => !!env.openaiKey,
  async generate({ model, system, messages, maxOutputTokens }) {
    const client = new OpenAI({ apiKey: env.openaiKey, timeout: TIMEOUT_MS, maxRetries: 1 });
    const res = await client.chat.completions.create({
      model,
      max_completion_tokens: maxOutputTokens + 1024,
      messages: [{ role: "system", content: system }, ...messages],
    });
    const choice = res.choices[0];
    return {
      text: (choice?.message?.content ?? "").trim(),
      tokensIn: res.usage?.prompt_tokens ?? 0,
      tokensOut: res.usage?.completion_tokens ?? 0,
      refused: !!choice?.message?.refusal,
    };
  },
};

export const PROVIDERS = { anthropic: anthropicProvider, openai: openaiProvider } as const;
export type ProviderId = keyof typeof PROVIDERS;

export const MODEL_SUGGESTIONS: Record<ProviderId, { id: string; label: string; input: number; output: number }[]> = {
  anthropic: [
    { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 (recomendado: mais barato)", input: 0.1, output: 0.5 },
    { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 (mais capaz)", input: 2, output: 10 },
  ],
  openai: [
    { id: "gpt-4o-mini", label: "GPT-4o mini", input: 0.15, output: 0.6 },
    { id: "gpt-5-mini", label: "GPT-5 mini", input: 0.25, output: 2 },
  ],
};

export function estimateCostUsd(tokensIn: number, tokensOut: number, pricePerMIn: number, pricePerMOut: number) {
  return (tokensIn / 1_000_000) * pricePerMIn + (tokensOut / 1_000_000) * pricePerMOut;
}
