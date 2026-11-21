import { describe, expect, it } from "vitest";
import { parseCsv, toCsv } from "@/lib/csv";
import { parseOfx } from "@/lib/ofx";

describe("CSV", () => {
  it("neutraliza fórmulas (CSV injection) e escapa separadores", () => {
    const csv = toCsv([{ a: "=HYPERLINK(1)", b: 'x;"y"' }], [["a", "A"], ["b", "B"]]);
    expect(csv).toContain("'=HYPERLINK(1)");
    expect(csv).toContain('"x;""y"""');
    expect(csv.startsWith("﻿")).toBe(true);
  });
  it("lê CSV com ; e aspas", () => {
    const rows = parseCsv('Data;Descrição;Valor\n01/11/2026;"Pix; recebido";1.500,00\n02/11/2026;Tarifa;-12,90\n');
    expect(rows).toHaveLength(3);
    expect(rows[1][1]).toBe("Pix; recebido");
  });
});

describe("OFX", () => {
  it("extrai transações", () => {
    const ofx = `OFXHEADER:100\n<OFX><BANKTRANLIST>
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20261105120000[-3:BRT]<TRNAMT>1500.00<FITID>A1<MEMO>PIX RECEBIDO CLIENTE</STMTTRN>
<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20261106<TRNAMT>-49.90<FITID>A2<NAME>SOFTWARE</STMTTRN>
</BANKTRANLIST></OFX>`;
    const lines = parseOfx(ofx);
    expect(lines).toEqual([
      { date: "2026-11-05", description: "PIX RECEBIDO CLIENTE", amountCents: 150000, fitId: "A1" },
      { date: "2026-11-06", description: "SOFTWARE", amountCents: -4990, fitId: "A2" },
    ]);
  });
});
