import type { FieldDef } from "./fields";
import { ICON_NAMES } from "@/components/ui/icon";

export interface ListColumn { name: string; label: string; format?: "money" | "date" | "status" | "boolean" | "badge" | "image" | "relation" }

export interface ResourceDef {
  key: string;
  table: string;
  label: string;
  plural: string;
  /** rota base no painel */
  path: string;
  adminOnly: boolean;
  /** possui status rascunho/publicado e afeta o site público */
  publishable?: boolean;
  /** invalida o cache do site ao salvar */
  affectsSite?: boolean;
  /** caminho público para pré-visualização (use {slug}) */
  previewPath?: string;
  titleField: string;
  orderBy: { column: string; ascending: boolean }[];
  searchColumns: string[];
  columns: ListColumn[];
  fields: FieldDef[];
  filters?: { name: string; label: string; options: { value: string; label: string }[] }[];
  description?: string;
}

const status: FieldDef = { name: "status", label: "Status", type: "select", options: [{ value: "draft", label: "Rascunho (oculto)" }, { value: "published", label: "Publicado" }] };
const sort: FieldDef = { name: "sort_order", label: "Ordem de exibição", type: "number", help: "Menor aparece primeiro." };

export const RESOURCES: Record<string, ResourceDef> = {
  services: {
    key: "services", table: "services", label: "Serviço", plural: "Serviços", path: "/admin/servicos", adminOnly: false,
    publishable: true, affectsSite: true, previewPath: "/servicos/{slug}", titleField: "title",
    orderBy: [{ column: "sort_order", ascending: true }], searchColumns: ["title", "summary"],
    columns: [{ name: "title", label: "Serviço" }, { name: "slug", label: "Endereço" }, { name: "sort_order", label: "Ordem" }, { name: "status", label: "Status", format: "status" }],
    fields: [
      { name: "title", label: "Nome do serviço", type: "text", required: true },
      { name: "slug", label: "Endereço (URL)", type: "slug", from: "title", required: true, help: "Ex.: social-media → /servicos/social-media" },
      { name: "eyebrow", label: "Chamada pequena", type: "text" },
      { name: "icon", label: "Ícone", type: "select", options: ICON_NAMES.map((i) => ({ value: i, label: i })) },
      { name: "summary", label: "Resumo (cards)", type: "textarea", span: 2 },
      { name: "description", label: "Descrição completa", type: "textarea", span: 2 },
      { name: "features", label: "Tópicos do serviço", type: "items", span: 2, fields: [{ name: "title", label: "Título", type: "text" }, { name: "text", label: "Texto", type: "textarea" }] },
      { name: "deliverables", label: "Entregas / etapas", type: "list", span: 2 },
      { name: "cover_url", label: "Imagem de capa", type: "image" },
      { name: "cta_label", label: "Texto do botão", type: "text" },
      { name: "seo_title", label: "Título SEO", type: "text" },
      { name: "seo_description", label: "Descrição SEO", type: "textarea" },
      { name: "show_on_home", label: "Exibir na página inicial", type: "boolean" },
      { name: "has_page", label: "Possui página própria", type: "boolean" },
      sort, status,
    ],
  },
  plans: {
    key: "plans", table: "plans", label: "Plano", plural: "Planos SaaS", path: "/admin/planos", adminOnly: false,
    publishable: true, affectsSite: true, previewPath: "/servicos/sistemas-saas", titleField: "name",
    description: "Planos do sistema de agendamento (Bronze, Prata, Ouro, Ultra Diamante). Deixe o preço vazio para exibir “Sob consulta”.",
    orderBy: [{ column: "sort_order", ascending: true }], searchColumns: ["name"],
    columns: [{ name: "name", label: "Plano" }, { name: "price_cents", label: "Preço", format: "money" }, { name: "billing_period", label: "Período" }, { name: "status", label: "Status", format: "status" }],
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "tagline", label: "Descrição curta", type: "text" },
      { name: "price_cents", label: "Preço (R$)", type: "money", help: "Vazio = Sob consulta" },
      { name: "setup_cents", label: "Taxa de implantação (R$)", type: "money" },
      { name: "billing_period", label: "Cobrança", type: "select", options: [{ value: "mensal", label: "Mensal" }, { value: "anual", label: "Anual" }, { value: "unico", label: "Pagamento único" }] },
      { name: "cta_label", label: "Texto do botão", type: "text" },
      { name: "features", label: "Recursos incluídos", type: "list", span: 2 },
      { name: "highlighted", label: "Destacar este plano", type: "boolean" },
      sort, status,
    ],
  },
  faqs: {
    key: "faqs", table: "faqs", label: "Pergunta", plural: "Perguntas frequentes", path: "/admin/faq", adminOnly: false,
    publishable: true, affectsSite: true, previewPath: "/", titleField: "question",
    orderBy: [{ column: "sort_order", ascending: true }], searchColumns: ["question", "answer"],
    columns: [{ name: "question", label: "Pergunta" }, { name: "category", label: "Categoria", format: "badge" }, { name: "status", label: "Status", format: "status" }],
    fields: [
      { name: "question", label: "Pergunta", type: "text", required: true, span: 2 },
      { name: "answer", label: "Resposta", type: "textarea", required: true, span: 2 },
      { name: "category", label: "Categoria", type: "text" },
      { name: "show_on_home", label: "Exibir na página inicial", type: "boolean" },
      sort, status,
    ],
  },
  portfolio: {
    key: "portfolio", table: "portfolio_clients", label: "Cliente/Projeto", plural: "Clientes & Projetos", path: "/admin/portfolio", adminOnly: false,
    publishable: true, affectsSite: true, previewPath: "/clientes-e-projetos/{slug}", titleField: "name",
    description: "Vitrine pública. Só aparece no site o que estiver “Publicado”.",
    orderBy: [{ column: "sort_order", ascending: true }, { column: "created_at", ascending: false }], searchColumns: ["name", "segment"],
    columns: [{ name: "logo_url", label: "", format: "image" }, { name: "name", label: "Cliente" }, { name: "segment", label: "Segmento" }, { name: "created_at", label: "Cadastro", format: "date" }, { name: "status", label: "Status", format: "status" }],
    filters: [{ name: "status", label: "Status", options: [{ value: "draft", label: "Rascunhos" }, { value: "published", label: "Publicados" }] }],
    fields: [
      { name: "name", label: "Nome do cliente", type: "text", required: true },
      { name: "slug", label: "Endereço (URL)", type: "slug", from: "name", required: true },
      { name: "segment", label: "Segmento", type: "text" },
      { name: "category", label: "Categoria", type: "select", options: [{ value: "esporte", label: "Esporte" }, { value: "marca-pessoal", label: "Marca pessoal" }, { value: "negocio-local", label: "Negócio local" }, { value: "empresa", label: "Empresa" }, { value: "geral", label: "Outros" }] },
      { name: "logo_url", label: "Logomarca", type: "image" },
      { name: "cover_url", label: "Foto de capa", type: "image" },
      { name: "summary", label: "Resumo (card)", type: "textarea", span: 2 },
      { name: "description", label: "Descrição do projeto", type: "textarea", span: 2 },
      { name: "services", label: "Serviços prestados", type: "list", span: 2 },
      { name: "gallery", label: "Galeria de imagens", type: "gallery", span: 2 },
      { name: "metrics", label: "Resultados (somente dados reais e autorizados)", type: "items", span: 2, fields: [{ name: "value", label: "Valor", type: "text" }, { name: "label", label: "Descrição", type: "text" }] },
      { name: "metrics_source", label: "Fonte dos resultados", type: "text", span: 2 },
      { name: "instagram_url", label: "Link do Instagram", type: "url" },
      { name: "website_url", label: "Link do site", type: "url" },
      { name: "extra_links", label: "Links adicionais", type: "links", span: 2 },
      { name: "featured", label: "Destaque na página inicial", type: "boolean" },
      sort, status,
    ],
  },
  knowledge: {
    key: "knowledge", table: "knowledge_items", label: "Item de conhecimento", plural: "Base de conhecimento", path: "/admin/chatbot/conhecimento", adminOnly: true,
    titleField: "title", description: "Informações oficiais que o chatbot usa para responder. Escreva de forma objetiva; o bot não inventa o que não estiver aqui.",
    orderBy: [{ column: "category", ascending: true }, { column: "title", ascending: true }], searchColumns: ["title", "content"],
    columns: [{ name: "title", label: "Título" }, { name: "category", label: "Categoria", format: "badge" }, { name: "active", label: "Ativo", format: "boolean" }],
    fields: [
      { name: "title", label: "Título / pergunta", type: "text", required: true, span: 2 },
      { name: "content", label: "Conteúdo / resposta oficial", type: "textarea", required: true, span: 2 },
      { name: "category", label: "Categoria", type: "select", options: ["empresa", "servicos", "precos", "faq", "politicas", "documento", "geral"].map((v) => ({ value: v, label: v })) },
      { name: "source_document", label: "Documento de origem", type: "text" },
      { name: "active", label: "Ativo", type: "boolean" },
    ],
  },
  crm: {
    key: "crm", table: "crm_clients", label: "Cliente", plural: "Clientes (CRM)", path: "/admin/clientes", adminOnly: true, titleField: "name",
    orderBy: [{ column: "name", ascending: true }], searchColumns: ["name", "company", "email", "phone"],
    columns: [{ name: "name", label: "Nome" }, { name: "company", label: "Empresa" }, { name: "service", label: "Serviço" }, { name: "monthly_value_cents", label: "Mensal", format: "money" }, { name: "due_day", label: "Venc." }, { name: "status", label: "Status", format: "badge" }],
    filters: [{ name: "status", label: "Status", options: [{ value: "ativo", label: "Ativos" }, { value: "pausado", label: "Pausados" }, { value: "encerrado", label: "Encerrados" }, { value: "prospect", label: "Prospects" }] }],
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "company", label: "Empresa", type: "text" },
      { name: "phone", label: "Telefone/WhatsApp", type: "text" },
      { name: "email", label: "E-mail", type: "email" },
      { name: "service", label: "Serviço contratado", type: "text" },
      { name: "monthly_value_cents", label: "Valor mensal (R$)", type: "money" },
      { name: "start_date", label: "Data de início", type: "date" },
      { name: "due_day", label: "Dia de vencimento", type: "number" },
      { name: "status", label: "Status", type: "select", options: [{ value: "ativo", label: "Ativo" }, { value: "pausado", label: "Pausado" }, { value: "encerrado", label: "Encerrado" }, { value: "prospect", label: "Prospect" }] },
      { name: "notes", label: "Observações", type: "textarea", span: 2 },
    ],
  },
  projects: {
    key: "projects", table: "projects", label: "Projeto", plural: "Projetos", path: "/admin/projetos", adminOnly: true, titleField: "name",
    orderBy: [{ column: "due_date", ascending: true }], searchColumns: ["name", "description"],
    columns: [{ name: "name", label: "Projeto" }, { name: "client_id", label: "Cliente", format: "relation" }, { name: "due_date", label: "Prazo", format: "date" }, { name: "status", label: "Status", format: "badge" }],
    filters: [{ name: "status", label: "Status", options: ["planejado", "ativo", "pausado", "concluido", "cancelado"].map((v) => ({ value: v, label: v })) }],
    fields: [
      { name: "name", label: "Nome do projeto", type: "text", required: true },
      { name: "client_id", label: "Cliente", type: "relation", relation: { table: "crm_clients", labelColumn: "name" } },
      { name: "status", label: "Status", type: "select", options: ["planejado", "ativo", "pausado", "concluido", "cancelado"].map((v) => ({ value: v, label: v })) },
      { name: "start_date", label: "Início", type: "date" },
      { name: "due_date", label: "Prazo de entrega", type: "date" },
      { name: "description", label: "Descrição / tarefas", type: "textarea", span: 2 },
    ],
  },
  categories: {
    key: "categories", table: "fin_categories", label: "Categoria", plural: "Categorias financeiras", path: "/admin/financeiro/categorias", adminOnly: true, titleField: "name",
    orderBy: [{ column: "kind", ascending: true }, { column: "name", ascending: true }], searchColumns: ["name"],
    columns: [{ name: "name", label: "Categoria" }, { name: "kind", label: "Tipo", format: "badge" }],
    fields: [
      { name: "name", label: "Nome", type: "text", required: true },
      { name: "kind", label: "Tipo", type: "select", required: true, options: [{ value: "receita", label: "Receita" }, { value: "despesa", label: "Despesa" }] },
    ],
  },
};

export function getResource(key: string) {
  const r = RESOURCES[key];
  if (!r) throw new Error(`Recurso desconhecido: ${key}`);
  return r;
}
