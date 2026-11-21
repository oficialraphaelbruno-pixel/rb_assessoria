export const STAGES = [
  { value: "novo", label: "Novo lead" },
  { value: "contato", label: "Contato iniciado" },
  { value: "qualificado", label: "Qualificado" },
  { value: "proposta", label: "Proposta enviada" },
  { value: "negociacao", label: "Negociação" },
  { value: "fechado", label: "Cliente fechado" },
  { value: "perdido", label: "Perdido" },
] as const;
export const SOURCES = ["site", "chatbot", "instagram", "whatsapp", "manychat", "indicacao", "meta_ads", "google_ads", "email", "evento", "outro"];
export const SOURCE_LABEL: Record<string, string> = {
  site: "Site", chatbot: "Chatbot", instagram: "Instagram", whatsapp: "WhatsApp", manychat: "ManyChat", indicacao: "Indicação",
  meta_ads: "Meta Ads", google_ads: "Google Ads", email: "E-mail", evento: "Evento", outro: "Outro",
};
