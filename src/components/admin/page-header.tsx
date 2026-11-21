import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({ title, description, back, actions }: { title: string; description?: string; back?: { href: string; label: string }; actions?: React.ReactNode }) {
  return (
    <div className="mb-6">
      {back && <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-sm text-mist-600 hover:text-teal-600"><ChevronLeft className="h-4 w-4" />{back.label}</Link>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-800">{title}</h1>
          {description && <p className="mt-1 max-w-3xl text-sm text-mist-600">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({ children, className = "", title, actions }: { children: React.ReactNode; className?: string; title?: string; actions?: React.ReactNode }) {
  return (
    <section className={`rounded-2xl border border-mist-200 bg-white p-6 ${className}`}>
      {(title || actions) && <div className="mb-4 flex items-center justify-between gap-3">{title && <h2 className="font-bold text-navy-800">{title}</h2>}{actions}</div>}
      {children}
    </section>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const map: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700", draft: "bg-amber-50 text-amber-700",
    pago: "bg-emerald-50 text-emerald-700", previsto: "bg-sky-50 text-sky-700", vencido: "bg-red-50 text-red-700", cancelado: "bg-mist-100 text-mist-600",
    ativo: "bg-emerald-50 text-emerald-700", pausado: "bg-amber-50 text-amber-700", encerrado: "bg-mist-100 text-mist-600", concluido: "bg-emerald-50 text-emerald-700",
  };
  const label: Record<string, string> = { published: "Publicado", draft: "Rascunho", pago: "Pago/Recebido", previsto: "Previsto", vencido: "Vencido", cancelado: "Cancelado" };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${map[value] ?? "bg-mist-100 text-mist-600"}`}>{label[value] ?? value}</span>;
}
