export interface StatementLine { date: string; description: string; amountCents: number; fitId: string | null }

/** Parser OFX (SGML ou XML) para extratos bancários — lê apenas STMTTRN. */
export function parseOfx(text: string): StatementLine[] {
  const blocks = text.split(/<STMTTRN>/i).slice(1);
  const tag = (b: string, name: string) => {
    const m = b.match(new RegExp(`<${name}>([^<\\r\\n]*)`, "i"));
    return m ? m[1].trim() : "";
  };
  return blocks.map((b) => {
    const dt = tag(b, "DTPOSTED");
    const amt = tag(b, "TRNAMT").replace(",", ".");
    const date = dt.length >= 8 ? `${dt.slice(0, 4)}-${dt.slice(4, 6)}-${dt.slice(6, 8)}` : "";
    const desc = [tag(b, "NAME"), tag(b, "MEMO")].filter(Boolean).join(" — ") || "Lançamento";
    return { date, description: desc.slice(0, 300), amountCents: Math.round(Number(amt) * 100), fitId: tag(b, "FITID") || null };
  }).filter((l) => /^\d{4}-\d{2}-\d{2}$/.test(l.date) && Number.isFinite(l.amountCents) && l.amountCents !== 0);
}
