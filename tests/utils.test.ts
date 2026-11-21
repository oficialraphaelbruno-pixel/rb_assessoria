import { describe, expect, it } from "vitest";
import { formatBRL, parseBRLToCents, safeUrl, slugify, whatsappLink } from "@/lib/utils";

describe("utils", () => {
  it("converte valores em reais para centavos", () => {
    expect(parseBRLToCents("1.234,56")).toBe(123456);
    expect(parseBRLToCents("1234,5")).toBe(123450);
    expect(parseBRLToCents("R$ 99")).toBe(9900);
    expect(parseBRLToCents("12.5")).toBe(1250);
    expect(parseBRLToCents("")).toBeNull();
    expect(parseBRLToCents("abc")).toBeNull();
  });
  it("formata BRL", () => {
    expect(formatBRL(123456).replace(/\s/g, " ")).toBe("R$ 1.234,56");
    expect(formatBRL(null)).toBe("—");
  });
  it("bloqueia URLs perigosas (XSS)", () => {
    expect(safeUrl("javascript:alert(1)")).toBeNull();
    expect(safeUrl("data:text/html,<script>")).toBeNull();
    expect(safeUrl("//evil.com")).toBeNull();
    expect(safeUrl("https://instagram.com/rb")).toBe("https://instagram.com/rb");
    expect(safeUrl("/contato")).toBe("/contato");
    expect(safeUrl("mailto:a@b.com")).toBe("mailto:a@b.com");
  });
  it("gera slugs", () => {
    expect(slugify("Júlia Santos Epil")).toBe("julia-santos-epil");
    expect(slugify("  IMEF — Futebol de Base!! ")).toBe("imef-futebol-de-base");
  });
  it("gera link de WhatsApp", () => {
    expect(whatsappLink("(31) 98295-4000", "Olá")).toBe("https://wa.me/31982954000?text=Ol%C3%A1");
    expect(whatsappLink("")).toBeNull();
  });
});
