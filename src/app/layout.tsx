import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "zCardápio — Cardápio online para o seu restaurante",
    template: "%s | zCardápio",
  },
  description:
    "Crie o cardápio digital do seu restaurante em minutos. QR code, pedidos online e personalização completa.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://zcardapio.com.br"
  ),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "zCardápio",
    title: "zCardápio — Cardápio digital sem comissão por pedido",
    description:
      "Monte o cardápio do seu restaurante, cole o QR code na mesa e receba pedidos no painel. Sem comissão por venda.",
  },
  // Verificação do Google Search Console (só ativa se a env estiver definida).
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <Analytics />
      </body>
    </html>
  );
}
