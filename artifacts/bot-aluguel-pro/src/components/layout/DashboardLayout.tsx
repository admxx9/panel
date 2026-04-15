import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "../ProtectedRoute";
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, MessageSquare, Wrench, Wallet, CreditCard, Menu, Cpu, Settings, MoreHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const bottomNavItems = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bots", label: "Bots", icon: MessageSquare },
  { href: "/dashboard/builder", label: "Builder", icon: Wrench },
  { href: "/dashboard/payments", label: "Moedas", icon: Wallet },
  { href: "/dashboard/settings", label: "Config", icon: Settings },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location === href || (location.startsWith(href) && href !== "/dashboard");
  };

  return (
    <ProtectedRoute>
      <div className="flex h-[100dvh] bg-[#090A0F] overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 border-b border-[#1a1b28] bg-[#0a0b12] flex items-center justify-between px-4 md:hidden shrink-0">
            <div className="flex items-center gap-2.5">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="text-[#4b4c6b] hover:text-white transition-colors p-1" aria-label="Abrir menu">
                    <Menu className="h-4.5 w-4.5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-56 bg-[#0a0b12] border-r border-[#1a1b28]">
                  <Sidebar />
                </SheetContent>
              </Sheet>
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-5 rounded bg-[#7C3AED] flex items-center justify-center">
                  <Cpu className="h-3 w-3 text-white" />
                </div>
                <span className="font-bold text-[13px] text-white">BotAluguel<span className="text-[#7C3AED]">.Pro</span></span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-md bg-[#131420] border border-[#1a1b28] flex items-center justify-center text-[11px] font-bold text-[#7C3AED]">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="mx-auto max-w-5xl px-4 md:px-8 py-6 pb-24 md:pb-8">
              {children}
            </div>
          </main>

          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0b12] border-t border-[#1a1b28]">
            <div className="flex items-stretch justify-around h-14">
              {bottomNavItems.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    aria-label={item.label}
                    className="flex flex-col items-center justify-center gap-1 flex-1 relative"
                  >
                    {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#7C3AED] rounded-b" />}
                    <div className={cn(
                      "h-7 w-7 flex items-center justify-center rounded-md transition-colors",
                      active ? "bg-[#7C3AED]/15" : ""
                    )}>
                      <item.icon className={cn("h-[15px] w-[15px]", active ? "text-[#7C3AED]" : "text-[#4b4c6b]")} />
                    </div>
                    <span className={cn("text-[9px] font-semibold leading-none", active ? "text-[#7C3AED]" : "text-[#4b4c6b]")}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </ProtectedRoute>
  );
}
