import { Bot, Coins, Shield, TrendingUp, Activity, Clock, ArrowRight, Cpu, Zap, Star } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const diff = value - prev.current;
    if (diff === 0) return;
    const start = prev.current;
    const startTime = performance.now();
    let raf = 0;
    const animate = (now: number) => {
      const p = Math.min((now - startTime) / 900, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + diff * e));
      if (p < 1) raf = requestAnimationFrame(animate);
      else prev.current = value;
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display.toLocaleString("pt-BR")}</>;
}

function StatBlock({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: React.ElementType; accent: string }) {
  const isNum = typeof value === "number";
  return (
    <div className={`bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-4 border-l-[3px]`} style={{ borderLeftColor: accent }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">{label}</p>
        <div className="h-7 w-7 rounded-md flex items-center justify-center" style={{ backgroundColor: accent + "20" }}>
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        </div>
      </div>
      <p className="text-[28px] font-bold text-white leading-none">
        {isNum ? <AnimatedNumber value={value as number} /> : value}
      </p>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, desc, accent }: { href: string; icon: React.ElementType; label: string; desc: string; accent: string }) {
  return (
    <Link href={href}>
      <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-4 hover:border-[#F97316]/40 hover:bg-[#F97316]/[0.03] transition-all group flex items-center gap-3">
        <div className="h-9 w-9 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: accent + "20" }}>
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#c9cadb]">{label}</p>
          <p className="text-[11px] text-[#4b4c6b] mt-0.5">{desc}</p>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-[#2a2b3e] group-hover:text-[#F97316] transition-colors" />
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const { user } = useAuth();

  const planExpiry = stats?.planExpiresAt
    ? format(new Date(stats.planExpiresAt), "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-[#1a1b28] flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Visão Geral</p>
          <h1 className="text-[20px] font-bold text-white mt-0.5">Olá, {user?.name?.split(" ")[0] ?? "Usuário"}</h1>
        </div>
        <div className="flex items-center gap-2 bg-[#0d0e16] border border-[#1a1b28] rounded-lg px-3 py-2">
          <Coins className="h-3.5 w-3.5 text-[#F97316]" />
          <span className="text-[13px] font-bold text-[#F97316]">{isLoading ? "—" : (stats?.coins ?? user?.coins ?? 0)}</span>
          <span className="text-[11px] text-[#4b4c6b]">moedas</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#0d0e16] border border-[#1a1b28] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatBlock label="Moedas" value={stats?.coins ?? 0} icon={Coins} accent="#F97316" />
          <StatBlock label="Total Bots" value={stats?.totalBots ?? 0} icon={Bot} accent="#C850C0" />
          <StatBlock label="Bots Ativos" value={stats?.activeBots ?? 0} icon={Zap} accent="#22C55E" />
          <StatBlock label="Mensagens" value={stats?.totalMessages ?? 0} icon={TrendingUp} accent="#3B82F6" />
        </div>
      )}

      <div className="bg-[#0d0e16] border border-[#1a1b28] border-l-[3px] border-l-[#F97316] rounded-lg p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1">Plano Ativo</p>
          <p className="text-[18px] font-bold text-white">{stats?.activePlan ?? "Nenhum"}</p>
          <p className="text-[11px] text-[#4b4c6b] mt-1">
            {planExpiry ? `Expira em ${planExpiry}` : "Adquira um plano para continuar"}
          </p>
        </div>
        <Link href="/dashboard/plans">
          <button className="bg-[#F97316] hover:bg-[#ea6a00] text-white text-[12px] font-bold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5">
            <Star className="h-3 w-3" />
            Planos
          </button>
        </Link>
      </div>

      <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-3">Acesso Rápido</p>
      <div className="grid md:grid-cols-3 gap-3 mb-6">
        <QuickLink href="/dashboard/bots" icon={Bot} label="Meus Bots" desc="Gerenciar bots e conexões" accent="#F97316" />
        <QuickLink href="/dashboard/builder" icon={Activity} label="Construtor Visual" desc="Editar fluxos e comandos" accent="#C850C0" />
        <QuickLink href="/dashboard/payments" icon={Coins} label="Comprar Moedas" desc="Recarregar via PIX" accent="#22C55E" />
      </div>

      <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-3">Atividade Recente</p>
      <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="space-y-px">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-[#090A0F] animate-pulse" />
            ))}
          </div>
        ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div>
            {stats.recentActivity.map((item, i) => (
              <div
                key={item.id}
                className={`flex items-center justify-between px-4 py-3 ${i < stats.recentActivity.length - 1 ? "border-b border-[#1a1b28]" : ""} hover:bg-[#090A0F] transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#F97316] shrink-0" />
                  <p className="text-[13px] text-[#c9cadb]">{item.description}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#4b4c6b] shrink-0">
                  <Clock className="h-3 w-3" />
                  {format(new Date(item.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Activity className="h-6 w-6 text-[#2a2b3e]" />
            <p className="text-[12px] text-[#4b4c6b]">Nenhuma atividade recente</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
