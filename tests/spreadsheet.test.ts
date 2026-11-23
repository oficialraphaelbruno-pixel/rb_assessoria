import { describe, expect, it } from "vitest";
import { parseSheet, leadToSheetRow, COLUMNS } from "@/lib/spreadsheet";

const header = COLUMNS.leads.map((c) => c.header + (c.required ? " *" : ""));

describe("importação de planilha de leads", () => {
  it("lê o modelo, converte valores e aplica padrões", () => {
    const r = parseSheet("leads", [header, ["Ana Souza", "Escolinha Bola de Ouro", "ANA@EXEMPLO.COM", "(31) 98888-7777", "Contagem/MG", "Clube / escolinha", "Site para clube", "Instagram", "", "1.500,00", "05/12/2026", "Indicação do IMEF", "Sim", "Não"]]);
    expect(r.errors).toEqual([]);
    expect(r.rows[0].data).toMatchObject({ name: "Ana Souza", email: "ana@exemplo.com", audience: "clube", source: "instagram", stage: "novo", estimated_value_cents: 150000, next_followup_at: "2026-12-05", consent: true, marketing_consent: false });
  });
  it("aceita títulos alternativos (Escola, Telefone, Contato)", () => {
    const r = parseSheet("leads", [["Nome", "Escola", "Telefone"], ["João", "Escolinha X", "31999998888"]]);
    expect(r.rows[0].data).toMatchObject({ name: "João", company: "Escolinha X", phone: "31999998888" });
  });
  it("aponta erros por linha", () => {
    const r = parseSheet("leads", [["Nome", "E-mail", "WhatsApp", "Origem", "Aceita e-mails de marketing?"],
      ["", "x@x.com", "", "", ""], ["Bia", "", "", "", ""], ["Caio", "nao-email", "", "", ""], ["Duda", "", "31999990000", "Rádio", ""], ["Eva", "", "31999990001", "", "Sim"]]);
    expect(r.rows).toHaveLength(0);
    expect(r.errors.map((e) => e.row)).toEqual([2, 3, 4, 5, 6]);
    expect(r.errors[3].message).toContain("origem desconhecida");
    expect(r.errors[4].message).toContain("exige e-mail");
  });
  it("exige linha de títulos", () => {
    expect(() => parseSheet("leads", [["a", "b"], ["c", "d"]])).toThrow(/títulos/);
  });
  it("exportação usa os mesmos rótulos do modelo (ida e volta)", () => {
    const row = leadToSheetRow({ name: "Ana", email: "ana@x.com", audience: "clube", source: "meta_ads", stage: "proposta", estimated_value_cents: 99000, next_followup_at: "2026-12-01", consent: true, marketing_consent: true });
    expect(row).toMatchObject({ audience: "Clube / escolinha", source: "Meta Ads", stage: "Proposta enviada", estimated_value: "990,00", next_followup_at: "01/12/2026", marketing: "Sim" });
    const back = parseSheet("leads", [COLUMNS.leads.map((c) => c.header), COLUMNS.leads.map((c) => String((row as Record<string, unknown>)[c.key] ?? ""))]);
    expect(back.errors).toEqual([]);
    expect(back.rows[0].data).toMatchObject({ name: "Ana", email: "ana@x.com", audience: "clube", source: "meta_ads", stage: "proposta", estimated_value_cents: 99000, next_followup_at: "2026-12-01", marketing_consent: true });
  });
});

describe("importação de planilha de clientes", () => {
  it("valida vencimento e status", () => {
    const r = parseSheet("clientes", [["Nome", "Valor mensal (R$)", "Dia de vencimento", "Status", "Data de início"], ["Clube A", "1.200,00", "10", "Ativo", "01/02/2026"], ["Clube B", "x", "40", "Talvez", "31/31/2026"]]);
    expect(r.rows[0].data).toMatchObject({ name: "Clube A", monthly_value_cents: 120000, due_day: 10, status: "ativo", start_date: "2026-02-01" });
    expect(r.errors[0].message).toMatch(/valor mensal inválido.*vencimento inválido|status desconhecido/);
  });
});
