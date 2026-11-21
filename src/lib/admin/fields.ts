/** Definição de campos usada pelos formulários do painel (CMS e CRUDs). */
export type FieldType =
  | "text" | "textarea" | "url" | "email" | "image" | "boolean" | "list" | "items" | "markdown"
  | "number" | "money" | "date" | "select" | "slug" | "gallery" | "links" | "relation";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  required?: boolean;
  /** select */
  options?: { value: string; label: string }[];
  /** items */
  fields?: FieldDef[];
  /** relation: tabela e coluna exibida */
  relation?: { table: string; labelColumn: string; filter?: Record<string, string> };
  /** slug: campo de origem */
  from?: string;
  /** largura no grid (2 = linha inteira) */
  span?: 1 | 2;
  placeholder?: string;
}
