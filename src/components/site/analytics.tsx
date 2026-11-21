"use client";
import Script from "next/script";
import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "rb_cookie_consent";
const valid = (id: string, re: RegExp) => (re.test(id) ? id : "");

/** Analytics só carregam após consentimento (LGPD). Sem IDs configurados, nada é exibido. */
export function Analytics({ ga4, pixel }: { ga4: string; pixel: string }) {
  const ga = valid(ga4.trim(), /^G-[A-Z0-9]{4,15}$/);
  const px = valid(pixel.trim(), /^\d{6,20}$/);
  const [consent, setConsent] = useState<"granted" | "denied" | null>("denied");

  useEffect(() => {
    try { setConsent((localStorage.getItem(KEY) as "granted" | "denied" | null) ?? null); } catch { setConsent(null); }
  }, []);

  if (!ga && !px) return null;
  const decide = (v: "granted" | "denied") => { try { localStorage.setItem(KEY, v); } catch { /* noop */ } setConsent(v); };

  return (
    <>
      {consent === "granted" && ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {consent === "granted" && px && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${px}');fbq('track','PageView');`}</Script>
      )}
      {consent === null && (
        <div role="region" aria-label="Aviso de cookies" className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-xl rounded-2xl border border-mist-200 bg-white p-4 text-sm shadow-2xl sm:bottom-5 sm:left-5 sm:right-auto">
          <p className="text-mist-600">Usamos cookies de medição para entender como o site é usado e melhorar a experiência. Veja a <Link href="/privacidade" className="underline">Política de Privacidade</Link>.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => decide("granted")} className="btn-dark px-4 py-2">Aceitar</button>
            <button type="button" onClick={() => decide("denied")} className="btn-ghost px-4 py-2">Recusar</button>
          </div>
        </div>
      )}
    </>
  );
}
