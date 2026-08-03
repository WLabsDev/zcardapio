import { PanelThemeProvider } from "@/components/panel-theme-provider";

// Mesmo tema limpo dos painéis vendedor/admin/cliente (tokens neutros +
// laranja da marca), para login e cadastro manterem a identidade dos painéis.
export default function AuthWideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PanelThemeProvider />
      {children}
    </>
  );
}
