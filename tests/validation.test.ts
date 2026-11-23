import { describe, expect, it } from "vitest";
import { chatSchema, leadSchema } from "@/lib/validation";

const ok = { name: "Maria", email: "MARIA@EXEMPLO.COM ", consent: true };

describe("formulário de orçamento", () => {
  it("aceita dados válidos e normaliza e-mail", () => {
    const r = leadSchema.parse(ok);
    expect(r.email).toBe("maria@exemplo.com");
    expect(r.source).toBe("site");
  });
  it("exige consentimento", () => {
    expect(leadSchema.safeParse({ ...ok, consent: false }).success).toBe(false);
  });
  it("rejeita e-mail inválido e telefone curto", () => {
    expect(leadSchema.safeParse({ ...ok, email: "x" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...ok, phone: "123" }).success).toBe(false);
  });
  it("honeypot é aceito pelo schema (a rota descarta em silêncio)", () => {
    expect(leadSchema.parse({ ...ok, website: "spam" }).website).toBe("spam");
  });
  it("limita tamanho da mensagem", () => {
    expect(leadSchema.safeParse({ ...ok, message: "a".repeat(5000) }).success).toBe(false);
  });
});

describe("chat", () => {
  it("valida visitante e tamanho", () => {
    expect(chatSchema.safeParse({ visitorId: "abc12345", message: "Oi" }).success).toBe(true);
    expect(chatSchema.safeParse({ visitorId: "<script>", message: "Oi" }).success).toBe(false);
    expect(chatSchema.safeParse({ visitorId: "abc12345", message: "a".repeat(2000) }).success).toBe(false);
  });
});
