import ReactMarkdown, { type Components } from "react-markdown";

// Renderiza o markdown dos posts como HTML semântico e estilizado.
// react-markdown produz elementos React (não dangerouslySetInnerHTML), então não
// há vetor de XSS mesmo sem sanitização extra — e o resultado é markup real
// (h2, p, ul…), que é o que o Google lê para entender e ranquear o artigo.
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-10 font-display text-3xl font-extrabold text-foreground">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 font-display text-2xl font-bold text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 font-display text-xl font-bold text-foreground">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mt-5 leading-relaxed text-foreground/85">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="mt-5 list-disc space-y-2 pl-6 text-foreground/85">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-5 list-decimal space-y-2 pl-6 text-foreground/85">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 border-primary pl-4 italic text-foreground/70">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-sm">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-5 overflow-x-auto rounded-lg bg-foreground/5 p-4">
      {children}
    </pre>
  ),
  hr: () => <hr className="mt-10 border-foreground/10" />,
  strong: ({ children }) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
};

export function PostMarkdown({ content }: { content: string }) {
  return <ReactMarkdown components={components}>{content}</ReactMarkdown>;
}
