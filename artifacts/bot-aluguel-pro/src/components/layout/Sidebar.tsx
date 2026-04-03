import { Link, useLocation } from "wouter";
import { LayoutDashboard, MessageSquare, CreditCard, Wallet, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/dashboard/bots", label: "Meus Bots", icon: MessageSquare },
  { href: "/dashboard/builder", label: "Construtor", icon: Settings },
  { href: "/dashboard/plans", label: "Planos", icon: CreditCard },
  { href: "/dashboard/payments", label: "Comprar Moedas", icon: Wallet },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 border-r border-white/5 bg-card flex flex-col h-full hidden md:flex">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary glow-primary">
            <span className="text-xl font-bold text-white">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">BotAluguel<span className="text-primary">.Pro</span></span>
        </Link>
      </div>

      <div className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
              location === item.href || (location.startsWith(item.href) && item.href !== "/dashboard")
                ? "bg-primary/10 text-primary border border-primary/20" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-4 w-4", location === item.href ? "text-primary" : "")} />
            {item.label}
          </Link>
        ))}
        {user?.isAdmin && (
          <Link 
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 mt-4",
              location.startsWith("/admin")
                ? "bg-accent/10 text-accent border border-accent/20" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
            Painel Admin
          </Link>
        )}
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 mb-4">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-white border border-white/10">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{user?.name}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3 w-3" /> {user?.coins} moedas
            </span>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
