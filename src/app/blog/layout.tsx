import Link from "next/link";

// Casca visual do blog (header + footer próprios, com CTA de cadastro em toda
// página — o blog é topo de funil, então toda tela vira porta de entrada).
// O metadata fica em cada página: o título usa o template do layout raiz
// ("%s | zCardápio") para manter a marca consistente no site todo.
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b-2 border-foreground/10 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-4">
          <Link href="/" className="font-display text-lg font-extrabold">
            zCardápio<span className="text-primary">.</span>
            <span className="ml-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              blog
            </span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold">
            <Link href="/blog" className="hover:text-primary">
              Artigos
            </Link>
            <Link
              href="/cadastro-restaurante"
              className="rounded-full bg-primary px-4 py-2 text-primary-foreground shadow-offset-sm transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Começar grátis
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t-2 border-foreground/10 bg-foreground text-background/70">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm md:flex-row">
          <p>© 2026 zCardápio · zcardapio.com.br</p>
          <div className="flex gap-5">
            <Link href="/" className="hover:text-background">
              Site
            </Link>
            <Link href="/login" className="hover:text-background">
              Entrar
            </Link>
            <Link href="/cadastro-restaurante" className="hover:text-background">
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
