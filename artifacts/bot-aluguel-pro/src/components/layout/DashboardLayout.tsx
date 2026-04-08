import { Sidebar } from "./Sidebar";
import { ProtectedRoute } from "../ProtectedRoute";
import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, MessageSquare, Wrench, Wallet, CreditCard, Menu, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/dashboard/bots", label: "Bots", icon: MessageSquare },
  { href: "/dashboard/builder", label: "Builder", icon: Wrench },
  { href: "/dashboard/plans", label: "Planos", icon: CreditCard },
  { href: "/dashboard/payments", label: "Moedas", icon: Wallet },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <ProtectedRoute>
      <div className="flex h-[100dvh] bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-white/5 bg-card/80 backdrop-blur-lg flex items-center justify-between px-4 md:hidden">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white h-9 w-9" aria-label="Abrir menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64 bg-card border-r border-white/5">
                  <Sidebar />
                </SheetContent>
              </Sheet>
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <span className="font-bold text-sm text-white">BotAluguel<span className="text-primary">.Pro</span></span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8 pb-20 md:pb-8">
            <div className="mx-auto max-w-6xl">
              {children}
            </div>
          </main>
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-white/10 safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-1">
              {bottomNavItems.map((item) => {
                const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/dashboard");
                return (
                  <Link key={item.href} href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-[56px]",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 flex items-center justify-center rounded-lg transition-all",
                      isActive ? "bg-primary/15 scale-110" : ""
                    )}>
                      <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "")} />
                    </div>
                    <span className={cn("text-[10px] font-medium", isActive ? "text-primary" : "")}>{item.label}</span>
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
