import { Link, useLocation } from "wouter";
import { LayoutDashboard, MessageSquare, CreditCard, Wallet, LogOut, Settings, Wrench, SlidersHorizontal, Shield, Cpu, Upload, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bots", label: "Meus Bots", icon: MessageSquare },
  { href: "/dashboard/hosted", label: "Hospedar Bot", icon: Upload },
  { href: "/dashboard/builder", label: "Construtor", icon: Wrench },
  { href: "/dashboard/settings", label: "Configurações", icon: SlidersHorizontal },
  { href: "/dashboard/plans", label: "Planos", icon: CreditCard },
  { href: "/dashboard/payments", label: "Comprar Moedas", icon: Wallet },
  { href: "/dashboard/profile", label: "Meu Perfil", icon: User },
];

function NavItem({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: React.ElementType; isActive: boolean }) {
  return (
    <Link href={href}>
      <div className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-all duration-150 select-none relative group",
        isActive
          ? "text-primary bg-primary/8 border-l-2 border-primary ml-[-1px]"
          : "text-[#5a5b7a] hover:text-[#c9cadb] hover:bg-white/[0.04] border-l-2 border-transparent ml-[-1px]"
      )}>
        <Icon className={cn("h-[15px] w-[15px] shrink-0", isActive ? "text-primary" : "")} />
        <span className="truncate">{label}</span>
      </div>
    </Link>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location === href || (location.startsWith(href) && href !== "/dashboard");
  };

  return (
    <aside className="w-56 border-r border-[#1a1b28] bg-[#0a0b12] flex flex-col h-full hidden md:flex shrink-0">
      <div className="px-5 py-5 border-b border-[#1a1b28]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#7C3AED] shadow-[0_0_12px_rgba(124,58,237,0.4)]">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-white leading-none">
            BotAluguel<span className="text-[#7C3AED]">.Pro</span>
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
        <p className="text-[9px] font-semibold text-[#2a2b3e] tracking-[1px] uppercase px-3 mb-2">Painel</p>
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isActive(item.href, item.exact)}
          />
        ))}

        {user?.isAdmin && (
          <>
            <div className="my-3 h-px bg-[#1a1b28]" />
            <p className="text-[9px] font-semibold text-[#2a2b3e] tracking-[1px] uppercase px-3 mb-2">Admin</p>
            <NavItem
              href="/admin"
              label="Painel Admin"
              icon={Shield}
              isActive={isActive("/admin")}
            />
          </>
        )}
      </div>

      <div className="border-t border-[#1a1b28] p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-7 w-7 rounded-md bg-[#131420] border border-[#1a1b28] flex items-center justify-center text-xs font-bold text-[#7C3AED]">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-[#c9cadb] truncate">{user?.name}</span>
            <span className="text-[11px] text-[#4b4c6b] flex items-center gap-1">
              <Wallet className="h-2.5 w-2.5" /> {user?.coins} moedas
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 px-3 py-2 text-[12px] font-medium text-[#4b4c6b] hover:text-red-400 hover:bg-red-500/10 rounded-sm transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sair da conta
        </button>
      </div>
    </aside>
  );
}
