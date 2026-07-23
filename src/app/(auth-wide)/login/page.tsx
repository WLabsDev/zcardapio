import { redirect } from "next/navigation";
import { AuthSplitShell } from "@/components/auth-split-shell";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

const roleHome: Record<string, string> = {
  admin: "/admin",
  restaurante: "/vendedor",
  cliente: "/cliente",
};

export default async function LoginPage() {
  // Se já estiver logado, vai direto para o painel do seu perfil.
  const session = await getSession();
  if (session) {
    redirect(roleHome[session.role] ?? "/");
  }

  return (
    <AuthSplitShell>
      <LoginForm />
    </AuthSplitShell>
  );
}
