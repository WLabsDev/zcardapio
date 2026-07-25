import type { Metadata } from "next";
import { connection } from "next/server";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/analytics";
import {
  getGaMeasurementId,
  getGoogleSiteVerification,
  getSiteUrl,
} from "@/lib/site-config";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// `generateMetadata` (e não um objeto `metadata` no topo do módulo) para que a
// URL do site e o token do Search Console sejam lidos a cada requisição, e não
// no momento em que o bundle é carregado/gerado.
export function generateMetadata(): Metadata {
  const verification = getGoogleSiteVerification();

  return {
    title: {
      default: "zCardápio — Cardápio online para o seu restaurante",
      template: "%s | zCardápio",
    },
    description:
      "Crie o cardápio digital do seu restaurante em minutos. QR code, pedidos online e personalização completa.",
    metadataBase: new URL(getSiteUrl()),
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "zCardápio",
      title: "zCardápio — Cardápio digital sem comissão por pedido",
      description:
        "Monte o cardápio do seu restaurante, cole o QR code na mesa e receba pedidos no painel. Sem comissão por venda.",
    },
    // Verificação do Google Search Console (só ativa se a env estiver definida).
    verification: verification ? { google: verification } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Impede que este layout seja pré-renderizado no build: as variáveis de
  // ambiente (GA, URL do site) precisam ser lidas em runtime, senão as poucas
  // páginas estáticas — cadastro, recuperar senha — ficariam com o valor do
  // build assado no HTML.
  await connection();
  const gaId = getGaMeasurementId();

  return (
    <html
      lang="pt-BR"
      className={`${jakarta.variable} ${bricolage.variable} h-full antialiased`}
      // Extensões de navegador (ex.: LanguageTool) injetam atributos no <html>
      // antes da hidratação; isso ignora divergências só neste elemento.
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="bottom-right" duration={2500} />
        <Analytics gaId={gaId} />
      </body>
    </html>
  );
}
