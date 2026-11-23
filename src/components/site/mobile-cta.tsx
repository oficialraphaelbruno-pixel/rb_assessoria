import Link from "next/link";
import { MessageCircle, Send } from "lucide-react";

/** Barra fixa de contato no celular (some no desktop). */
export function MobileCta({ whatsappHref }: { whatsappHref: string | null }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-mist-200 bg-white/95 p-3 pr-20 backdrop-blur md:hidden">
      <Link href="/contato#orcamento" className="btn-dark flex-1 px-3 py-2.5 text-xs"><Send className="h-4 w-4" aria-hidden /> Orçamento</Link>
      {whatsappHref && (
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 px-3 py-2.5 text-xs"><MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp</a>
      )}
    </div>
  );
}
