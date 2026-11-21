import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);

export const leadSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(120),
  company: trimmed(160).optional().default(""),
  email: z.string().trim().toLowerCase().email("E-mail inválido").max(200),
  phone: trimmed(30).optional().default("").refine((v) => !v || v.replace(/\D/g, "").length >= 10, "WhatsApp inválido"),
  service: trimmed(120).optional().default(""),
  message: trimmed(4000).optional().default(""),
  consent: z.literal(true, { error: "É necessário autorizar o uso dos dados" }),
  source: trimmed(40).optional().default("site"),
  landing_page: trimmed(300).optional().default(""),
  utm: z.record(z.string().max(40), z.string().max(200)).optional().default({}),
  website: z.string().max(0).optional().default(""), // honeypot
});
export type LeadInput = z.infer<typeof leadSchema>;

export const chatSchema = z.object({
  conversationId: z.string().uuid().nullable().optional(),
  visitorId: z.string().min(8).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  message: z.string().trim().min(1).max(1500),
  page: z.string().max(300).optional(),
});
