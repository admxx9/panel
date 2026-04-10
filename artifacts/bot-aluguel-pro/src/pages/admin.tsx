import { useState } from "react";
import { Users, Bot, DollarSign, Clock, Shield, Coins, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdminGetStats, useAdminListUsers, useAdminListPayments } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "#F59E0B" },
  paid:    { label: "Pago",     color: "#22C55E" },
  expired: { label: "Expirado", color: "#4b4c6b" },
  error:   { label: "Erro",     color: "#EF4444" },
};

type Tab = "users" | "payments";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const { data: stats, isLoading: statsLoading } = useAdminGetStats();
  const { data: users, isLoading: usersLoading } = useAdminListUsers();
  const { data: payments, isLoading: paymentsLoading } = useAdminListPayments();

  const userList = (users as any[] | undefined) ?? [];
  const paymentList = (payments as any[] | undefined) ?? [];

  const statItems = stats ? [
    { label: "Usuários",    value: stats.totalUsers,                   icon: Users,   color: "#F97316" },
    { label: "Total Bots",  value: stats.totalBots,                    icon: Bot,     color: "#C850C0" },
    { label: "Bots Ativos", value: stats.activeBots,                   icon: Zap,     color: "#22C55E" },
    { label: "Receita",     value: `R$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "#3B82F6" },
    { label: "PIX Pend.",   value: stats.pendingPayments,              icon: Clock,   color: "#F59E0B" },
    { label: "Planos",      value: stats.totalPlans,                   icon: Coins,   color: "#8B5CF6" },
  ] : [];

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-[#1a1b28] flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-[#C850C0]/15 flex items-center justify-center">
          <Shield className="h-4 w-4 text-[#C850C0]" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Plataforma</p>
          <h1 className="text-[20px] font-bold text-white">Painel Admin</h1>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#0d0e16] border border-[#1a1b28] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statItems.map((item) => (
            <div key={item.label} className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-3 border-l-[3px]" style={{ borderLeftColor: item.color }}>
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                <p className="text-[10px] text-[#4b4c6b] font-semibold">{item.label}</p>
              </div>
              <p className="text-[20px] font-extrabold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 mb-4 bg-[#0d0e16] border border-[#1a1b28] rounded-md p-1 w-fit">
        {(["users", "payments"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded text-[12px] font-semibold transition-colors",
              tab === t ? "bg-[#F97316] text-white" : "text-[#4b4c6b] hover:text-[#8b8ea0]"
            )}
          >
            {t === "users" ? "Usuários" : "Pagamentos"}
          </button>
        ))}
      </div>

      {tab === "users" && (
        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 border-b border-[#1a1b28]">
            <div className="w-4" />
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Nome</p>
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Telefone</p>
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Moedas</p>
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Tipo</p>
          </div>
          {usersLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-[#090A0F] animate-pulse" />
              ))}
            </div>
          ) : (
            userList.map((user: any, i: number) => (
              <div
                key={user.id}
                className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-[#090A0F] transition-colors ${i < userList.length - 1 ? "border-b border-[#1a1b28]" : ""}`}
              >
                <div className="h-4 w-4 rounded bg-[#F97316]/20 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-[#F97316]">{user.name?.[0]?.toUpperCase()}</span>
                </div>
                <p className="text-[13px] font-semibold text-[#c9cadb]">{user.name}</p>
                <p className="text-[12px] text-[#4b4c6b]">{user.phone}</p>
                <p className="text-[13px] font-bold text-[#F97316]">{user.coins}</p>
                <div
                  className="px-2 py-0.5 rounded text-[10px] font-bold border"
                  style={user.isAdmin
                    ? { color: "#C850C0", backgroundColor: "#C850C015", borderColor: "#C850C030" }
                    : { color: "#4b4c6b", backgroundColor: "#1a1b28", borderColor: "#2a2b3e" }
                  }
                >
                  {user.isAdmin ? "Admin" : "User"}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "payments" && (
        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 border-b border-[#1a1b28]">
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Usuário</p>
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Valor</p>
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Moedas</p>
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Status</p>
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Data</p>
          </div>
          {paymentsLoading ? (
            <div className="space-y-px">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-[#090A0F] animate-pulse" />
              ))}
            </div>
          ) : paymentList.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-[12px] text-[#4b4c6b]">
              Nenhum pagamento encontrado
            </div>
          ) : (
            paymentList.map((payment: any, i: number) => {
              const cfg = STATUS_CFG[payment.status] ?? STATUS_CFG.pending;
              return (
                <div
                  key={payment.id}
                  className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-[#090A0F] transition-colors ${i < paymentList.length - 1 ? "border-b border-[#1a1b28]" : ""}`}
                >
                  <p className="text-[11px] text-[#4b4c6b] font-mono truncate">{payment.userId.substring(0, 12)}...</p>
                  <p className="text-[13px] font-semibold text-[#c9cadb]">R$ {payment.amount.toFixed(2)}</p>
                  <p className="text-[13px] font-bold text-[#F97316]">{payment.coins}</p>
                  <div
                    className="px-2 py-0.5 rounded text-[10px] font-bold border"
                    style={{ color: cfg.color, backgroundColor: cfg.color + "15", borderColor: cfg.color + "30" }}
                  >
                    {cfg.label}
                  </div>
                  <p className="text-[11px] text-[#4b4c6b]">
                    {format(new Date(payment.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
