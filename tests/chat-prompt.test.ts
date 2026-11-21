import { describe, expect, it } from "vitest";
import { buildSystemPrompt, HANDOFF_MARKER, type ChatSettings } from "@/lib/ai/engine";
import { estimateCostUsd } from "@/lib/ai/providers";

const s = { assistant_name: "Assistente RB", tone: "Cordial", rules: "- Não invente preços" } as ChatSettings;

describe("prompt do chatbot", () => {
  it("contém regras de segurança e a base de conhecimento", () => {
    const p = buildSystemPrompt(s, [{ title: "Sobre", content: "Fica em BH" }], "ctx");
    expect(p).toContain("dados não confiáveis");
    expect(p).toContain("não tem acesso a dados financeiros");
    expect(p).toContain("Fica em BH");
    expect(p).toContain(HANDOFF_MARKER);
    expect(p).toContain("Não invente preços");
  });
  it("estima custo por tokens", () => {
    expect(estimateCostUsd(1_000_000, 1_000_000, 0.1, 0.5)).toBeCloseTo(0.6);
    expect(estimateCostUsd(2000, 300, 0.1, 0.5)).toBeCloseTo(0.00035);
  });
});
