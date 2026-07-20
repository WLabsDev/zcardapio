import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/4 size-80 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-1/4 size-80 rounded-full bg-accent blur-3xl"
      />
      <Logo className="mb-8" />
      <div className="relative z-10 flex w-full flex-col items-center">
        {children}
      </div>
    </div>
  );
}
