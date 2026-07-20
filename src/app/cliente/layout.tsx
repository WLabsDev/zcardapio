import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ClienteShell } from "@/components/panel/cliente-shell";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "cliente") redirect("/login");

  return <ClienteShell userName={session.name}>{children}</ClienteShell>;
}
