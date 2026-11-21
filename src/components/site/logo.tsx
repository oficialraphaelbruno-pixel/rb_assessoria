import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** A logomarca original é escura: em fundos escuros vai sobre uma placa clara (como na apresentação). */
export function Logo({ src, alt, onDark = false, className }: { src: string; alt: string; onDark?: boolean; className?: string }) {
  const isLocal = src.startsWith("/");
  return (
    <Link href="/" aria-label={`${alt} — página inicial`} className={cn("inline-flex items-center", onDark && "rounded-lg bg-white px-3 py-2", className)}>
      {isLocal ? (
        <Image src={src} alt={alt} width={1682} height={362} priority className="h-9 w-auto sm:h-10" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-9 w-auto sm:h-10" />
      )}
    </Link>
  );
}
