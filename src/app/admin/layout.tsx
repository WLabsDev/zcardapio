import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/panel/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  return <AdminShell userName={session.name}>{children}</AdminShell>;
}
