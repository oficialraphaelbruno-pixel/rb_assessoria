import { Fragment, type ReactNode } from "react";

/**
 * Renderizador mínimo e seguro (sem HTML bruto): "## " vira subtítulo,
 * "- " vira lista, linhas em branco separam parágrafos, **negrito**.
 */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="prose-rb">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean);
        if (!lines.length) return null;
        if (lines[0].startsWith("## ")) {
          return (
            <Fragment key={i}>
              <h2>{lines[0].slice(3)}</h2>
              {lines.slice(1).length > 0 && <p>{inline(lines.slice(1).join(" "))}</p>}
            </Fragment>
          );
        }
        if (lines.every((l) => l.startsWith("- "))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}</ul>;
        }
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
