import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";

// Deixa os robôs indexarem o site e o blog, mas mantém as áreas logadas
// (painéis e API) fora dos resultados de busca.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/vendedor", "/cliente", "/api", "/novo-design"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
