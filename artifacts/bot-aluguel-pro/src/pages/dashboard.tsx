import { motion } from "framer-motion";
import { Bot, Coins, Shield, TrendingUp, Activity, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetDashboardStats } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function StatCard({ label, value, icon: Icon, sub, accent = false }: {
  label: string; value: string | number; icon: React.ElementType; sub?: string; accent?: boolean;
}) {
  return (
    <motion.div
      className={`rounded-xl p-6 border ${accent ? "border-primary/20 bg-primary/5" : "border-white/5 bg-card"}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${accent ? "bg-primary/20" : "bg-white/5"}`}>
          <Icon className={`h-5 w-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-3xl font-bold ${accent ? "text-primary" : "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Visao Geral</h1>
        <p className="text-muted-foreground text-sm mt-1">Bem-vindo ao seu painel de controle</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-card" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Moedas"
            value={stats?.coins ?? 0}
            icon={Coins}
            accent
            sub="Saldo disponivel"
          />
          <StatCard
            label="Total de Bots"
            value={stats?.totalBots ?? 0}
            icon={Bot}
            sub={`${stats?.activeBots ?? 0} conectados`}
          />
          <StatCard
            label="Plano Ativo"
            value={stats?.activePlan ?? "Nenhum"}
            icon={Shield}
            sub={planExpiry ? `Expira em ${planExpiry}` : "Adquira um plano"}
          />
          <StatCard
            label="Mensagens"
            value={stats?.totalMessages ?? 0}
            icon={TrendingUp}
            sub="Total processado"
          />
        </div>
      )}

      <div className="bg-card border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-white font-semibold">Atividade Recente</h2>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg bg-background" />
            ))}
          </div>
        ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.map((item) => (
              <motion.div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background border border-white/5"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
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
      </div>
    </DashboardLayout>
  );
}
