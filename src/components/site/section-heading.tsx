import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, text, center, dark, className }: {
  eyebrow?: string; title: string; text?: string; center?: boolean; dark?: boolean; className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", center && "mx-auto text-center", className)}>
      {eyebrow && <p className={cn("eyebrow", center && "justify-center", dark && "text-turq-300")}>{eyebrow}</p>}
      <h2 className={cn("mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem]", dark ? "text-white" : "text-navy-800")}>{title}</h2>
      {text && <p className={cn("mt-5 text-lg leading-relaxed", dark ? "text-white/70" : "text-mist-600")}>{text}</p>}
    </div>
  );
}
