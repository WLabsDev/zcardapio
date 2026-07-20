import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
    default: "zCardapio — Cardápio online para o seu restaurante",
    template: "%s | zCardapio",
  },
  description:
    "Crie o cardápio digital do seu restaurante em minutos. QR code, pedidos online e personalização completa.",
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
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
