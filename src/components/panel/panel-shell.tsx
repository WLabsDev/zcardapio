"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, type LucideIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
};

export function PanelShell({
  title,
  nav,
  userName,
  userRole,
  children,
}: {
  title: string;
  nav: NavItem[];
  userName: string;
  userRole: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const navList = (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((item) => {
        const active =
          item.href === nav[0].href
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-all",
              active
                ? "border-foreground bg-accent text-foreground shadow-offset-sm"
                : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="size-4.5" />
            {item.label}
            {item.badge}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo className="text-lg" />
        </div>
        {navList}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="lg:hidden">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex h-16 items-center border-b px-5">
                <Logo className="text-lg" />
              </div>
              {navList}
            </SheetContent>
          </Sheet>
          <h1 className="flex-1 truncate font-display text-lg font-bold">
            {title}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full">
                <Avatar className="border-2 border-foreground">
                  <AvatarFallback className="bg-accent font-display font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <p>{userName}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {userRole}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/")}>
                <LogOut className="size-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 bg-muted/30 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border-2 border-foreground/15 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-foreground hover:shadow-offset-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
