"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4. O ID chega como prop porque é lido no servidor em runtime
 * (ver `src/lib/site-config.ts`) — se fosse lido aqui via
 * `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID`, o valor ficaria congelado no
 * build. Sem ID, nada é renderizado e o GA fica desativado.
 *
 * O pageview inicial é enviado pelo gtag('config'); as navegações seguintes
 * (client-side, App Router) disparam um page_view manual.
 */
export function Analytics({ gaId }: { gaId?: string }) {
  const pathname = usePathname();
  const firstRender = useRef(true);

  useEffect(() => {
    if (!gaId) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.gtag?.("event", "page_view", { page_path: pathname });
  }, [pathname, gaId]);

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(gaId)});
        `}
      </Script>
    </>
  );
}
