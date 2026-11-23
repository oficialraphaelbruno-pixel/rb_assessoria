// Gera os modelos de planilha em /modelos (os mesmos baixados no painel).
// Uso: npx tsx --conditions=react-server scripts/gerar-modelos.mts
import { writeFileSync } from "node:fs";
import { buildTemplate } from "../src/lib/spreadsheet.ts";

for (const kind of ["leads", "clientes"] as const) {
  const buf = await buildTemplate(kind);
  writeFileSync(`modelos/modelo-${kind}-rb.xlsx`, buf);
  console.log(`modelos/modelo-${kind}-rb.xlsx`);
}
