import { Bot, Coins, Shield, TrendingUp, Activity, Clock, ArrowUpRight, Sparkles } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

function AnimatedNumber({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = value - start;
    if (diff === 0) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setDisplay(value); prev.current = value; return; }
    const startTime = performance.now();
    let rafId = 0;
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) rafId = requestAnimationFrame(animate);
      else prev.current = value;
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [value, duration]);
  return <>{display.toLocaleString("pt-BR")}</>;
}

function StatCard({ label, value, icon: Icon, sub, accent = false, delay = 0 }: {
  label: string; value: string | number; icon: React.ElementType; sub?: string; accent?: boolean; delay?: number;
}) {
  const isNum = typeof value === "number";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`rounded-xl p-6 border transition-all hover:scale-[1.02] hover:shadow-lg ${accent ? "border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 shadow-primary/5" : "border-white/5 bg-card hover:border-white/10"}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${accent ? "bg-primary/20" : "bg-white/5"}`}>
          <Icon className={`h-5 w-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        {accent && <Sparkles className="h-4 w-4 text-primary/40" />}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ? "text-primary" : "text-white"}`}>
        {isNum ? <AnimatedNumber value={value} /> : value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-1.5">{sub}</p>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStats();

  const planExpiry = stats?.planExpiresAt
    ? format(new Date(stats.planExpiresAt), "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <DashboardLayout>
      <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold text-white">Visao Geral</h1>
        <p className="text-muted-foreground text-sm mt-1">Bem-vindo ao seu painel de controle</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Moedas" value={stats?.coins ?? 0} icon={Coins} accent sub="Saldo disponivel" delay={0} />
          <StatCard label="Total de Bots" value={stats?.totalBots ?? 0} icon={Bot} sub={`${stats?.activeBots ?? 0} conectados`} delay={0.1} />
          <StatCard label="Plano Ativo" value={stats?.activePlan ?? "Nenhum"} icon={Shield} sub={planExpiry ? `Expira em ${planExpiry}` : "Adquira um plano"} delay={0.2} />
          <StatCard label="Mensagens" value={stats?.totalMessages ?? 0} icon={TrendingUp} sub="Total processado" delay={0.3} />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Link href="/dashboard/bots" className="block p-5 rounded-xl border border-white/5 bg-card hover:border-primary/20 hover:bg-primary/[0.02] transition-all group">
            <div className="flex items-center justify-between mb-2">
              <Bot className="h-5 w-5 text-primary" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-white font-semibold text-sm">Meus Bots</h3>
            <p className="text-muted-foreground text-xs mt-1">Gerenciar bots e conexoes</p>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Link href="/dashboard/builder" className="block p-5 rounded-xl border border-white/5 bg-card hover:border-primary/20 hover:bg-primary/[0.02] transition-all group">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-5 w-5 text-accent" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-white font-semibold text-sm">Construtor Visual</h3>
            <p className="text-muted-foreground text-xs mt-1">Editar fluxos e comandos</p>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Link href="/dashboard/plans" className="block p-5 rounded-xl border border-white/5 bg-card hover:border-primary/20 hover:bg-primary/[0.02] transition-all group">
            <div className="flex items-center justify-between mb-2">
              <Coins className="h-5 w-5 text-yellow-400" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-yellow-400 transition-colors" />
            </div>
            <h3 className="text-white font-semibold text-sm">Planos e Moedas</h3>
            <p className="text-muted-foreground text-xs mt-1">Ver planos e recarregar</p>
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="bg-card border border-white/5 rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-white font-semibold">Atividade Recente</h2>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg bg-background" />
            ))}
          </div>
        ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-background border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-white">{item.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(new Date(item.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Nenhuma atividade recente</p>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
