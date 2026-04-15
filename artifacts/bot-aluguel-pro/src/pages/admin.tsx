import { useState } from "react";
import { Users, Bot, DollarSign, Clock, Shield, Coins, Zap, Bell, Send } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdminGetStats, useAdminListUsers, useAdminListPayments, useAdminSendNotification, useAdminListNotifications } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "#F59E0B" },
  paid:    { label: "Pago",     color: "#22C55E" },
  expired: { label: "Expirado", color: "#4b4c6b" },
  error:   { label: "Erro",     color: "#EF4444" },
};

const NOTIF_TYPES = [
  { value: "info", label: "Info", color: "#3B82F6" },
  { value: "success", label: "Sucesso", color: "#22C55E" },
  { value: "warning", label: "Aviso", color: "#F59E0B" },
  { value: "error", label: "Erro", color: "#EF4444" },
  { value: "bot", label: "Bot", color: "#7C3AED" },
  { value: "coins", label: "Moedas", color: "#8B5CF6" },
];

type Tab = "users" | "payments" | "notifications";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const { data: stats, isLoading: statsLoading } = useAdminGetStats();
  const { data: users, isLoading: usersLoading } = useAdminListUsers();
  const { data: payments, isLoading: paymentsLoading } = useAdminListPayments();
  const { data: allNotifs, isLoading: notifsLoading, refetch: refetchNotifs } = useAdminListNotifications();
  const sendNotif = useAdminSendNotification();

  const [nTitle, setNTitle] = useState("");
  const [nBody, setNBody] = useState("");
  const [nType, setNType] = useState("info");
  const [nTarget, setNTarget] = useState("all");
  const [sendSuccess, setSendSuccess] = useState("");
  const [sendError, setSendError] = useState("");

  const userList = (users as any[] | undefined) ?? [];
  const paymentList = (payments as any[] | undefined) ?? [];
  const notifList = (allNotifs as any[] | undefined) ?? [];

  const statItems = stats ? [
    { label: "Usuários",    value: stats.totalUsers,                   icon: Users,   color: "#7C3AED" },
    { label: "Total Bots",  value: stats.totalBots,                    icon: Bot,     color: "#7C3AED" },
    { label: "Bots Ativos", value: stats.activeBots,                   icon: Zap,     color: "#22C55E" },
    { label: "Receita",     value: `R$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "#3B82F6" },
    { label: "PIX Pend.",   value: stats.pendingPayments,              icon: Clock,   color: "#F59E0B" },
    { label: "Planos",      value: stats.totalPlans,                   icon: Coins,   color: "#8B5CF6" },
  ] : [];

  const handleSend = () => {
    if (!nTitle.trim() || !nBody.trim()) return;
    setSendError("");
    sendNotif.mutate(
      { data: { title: nTitle.trim(), body: nBody.trim(), type: nType, targetUserId: nTarget } },
      {
        onSuccess: (res: any) => {
          setSendSuccess(`Enviado para ${res.sent} usuário(s)!`);
          setNTitle("");
          setNBody("");
          refetchNotifs();
          setTimeout(() => setSendSuccess(""), 3000);
        },
        onError: () => {
          setSendError("Erro ao enviar notificação. Tente novamente.");
          setTimeout(() => setSendError(""), 4000);
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-[#1a1b28] flex items-center gap-3">
        <div className="h-9 w-9 rounded-md bg-[#7C3AED]/15 flex items-center justify-center">
          <Shield className="h-4 w-4 text-[#7C3AED]" />
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
        {(["users", "payments", "notifications"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-1.5 rounded text-[12px] font-semibold transition-colors flex items-center gap-1.5",
              tab === t ? "bg-[#7C3AED] text-white" : "text-[#4b4c6b] hover:text-[#8b8ea0]"
            )}
          >
            {t === "notifications" && <Bell className="h-3 w-3" />}
            {t === "users" ? "Usuários" : t === "payments" ? "Pagamentos" : "Notificações"}
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
                <div className="h-4 w-4 rounded bg-[#7C3AED]/20 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-[#7C3AED]">{user.name?.[0]?.toUpperCase()}</span>
                </div>
                <p className="text-[13px] font-semibold text-[#c9cadb]">{user.name}</p>
                <p className="text-[12px] text-[#4b4c6b]">{user.phone}</p>
                <p className="text-[13px] font-bold text-[#7C3AED]">{user.coins}</p>
                <div
                  className="px-2 py-0.5 rounded text-[10px] font-bold border"
                  style={user.isAdmin
                    ? { color: "#7C3AED", backgroundColor: "#7C3AED15", borderColor: "#7C3AED30" }
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
                  <p className="text-[11px] text-[#4b4c6b] truncate">{userList.find((u: any) => u.id === payment.userId)?.name ?? payment.userId.substring(0, 12)}</p>
                  <p className="text-[13px] font-semibold text-[#c9cadb]">R$ {payment.amount.toFixed(2)}</p>
                  <p className="text-[13px] font-bold text-[#7C3AED]">{payment.coins}</p>
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

      {tab === "notifications" && (
        <div className="space-y-4">
          <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Send className="h-4 w-4 text-[#7C3AED]" />
              <h3 className="text-[14px] font-bold text-white">Enviar Notificação</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1 block">Destinatário</label>
                <select
                  value={nTarget}
                  onChange={(e) => setNTarget(e.target.value)}
                  className="w-full bg-[#090A0F] border border-[#1a1b28] rounded-md px-3 py-2 text-[13px] text-[#c9cadb] outline-none focus:border-[#7C3AED]/50"
                >
                  <option value="all">📢 Todos os usuários</option>
                  {userList.map((u: any) => (
                    <option key={u.id} value={u.id}>👤 {u.name} ({u.phone || "sem telefone"})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1 block">Tipo</label>
                <div className="flex gap-1.5 flex-wrap">
                  {NOTIF_TYPES.map((nt) => (
                    <button
                      key={nt.value}
                      onClick={() => setNType(nt.value)}
                      className={cn(
                        "px-3 py-1 rounded text-[11px] font-semibold border transition-colors",
                        nType === nt.value
                          ? "text-white"
                          : "text-[#4b4c6b] border-[#1a1b28] hover:text-[#8b8ea0]"
                      )}
                      style={nType === nt.value ? { backgroundColor: nt.color, borderColor: nt.color } : {}}
                    >
                      {nt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1 block">Título</label>
                <input
                  type="text"
                  value={nTitle}
                  onChange={(e) => setNTitle(e.target.value)}
                  placeholder="Ex: Novidade no BotAluguel!"
                  className="w-full bg-[#090A0F] border border-[#1a1b28] rounded-md px-3 py-2 text-[13px] text-[#c9cadb] placeholder:text-[#4b4c6b]/50 outline-none focus:border-[#7C3AED]/50"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1 block">Mensagem</label>
                <textarea
                  value={nBody}
                  onChange={(e) => setNBody(e.target.value)}
                  placeholder="Descreva a notificação..."
                  rows={3}
                  className="w-full bg-[#090A0F] border border-[#1a1b28] rounded-md px-3 py-2 text-[13px] text-[#c9cadb] placeholder:text-[#4b4c6b]/50 outline-none focus:border-[#7C3AED]/50 resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSend}
                  disabled={!nTitle.trim() || !nBody.trim() || sendNotif.isPending}
                  className="px-5 py-2 rounded-md bg-[#7C3AED] text-white text-[13px] font-semibold hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  {sendNotif.isPending ? "Enviando..." : "Enviar"}
                </button>
                {sendSuccess && (
                  <p className="text-[12px] text-[#22C55E] font-semibold">{sendSuccess}</p>
                )}
                {sendError && (
                  <p className="text-[12px] text-[#EF4444] font-semibold">{sendError}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg overflow-hidden">
            <div className="px-4 py-2 border-b border-[#1a1b28] flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-[#4b4c6b]" />
              <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Histórico de Notificações</p>
              <span className="ml-auto text-[10px] text-[#4b4c6b]">{notifList.length} total</span>
            </div>
            {notifsLoading ? (
              <div className="space-y-px">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-[#090A0F] animate-pulse" />
                ))}
              </div>
            ) : notifList.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-[12px] text-[#4b4c6b]">
                Nenhuma notificação enviada
              </div>
            ) : (
              notifList.slice(0, 50).map((n: any, i: number) => {
                const typeCfg = NOTIF_TYPES.find((t) => t.value === n.type) ?? NOTIF_TYPES[0];
                const targetUser = userList.find((u: any) => u.id === n.userId);
                return (
                  <div
                    key={n.id}
                    className={`px-4 py-3 hover:bg-[#090A0F] transition-colors ${i < Math.min(notifList.length, 50) - 1 ? "border-b border-[#1a1b28]" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: typeCfg.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-semibold text-[#c9cadb] truncate">{n.title}</p>
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-bold border shrink-0"
                            style={{ color: typeCfg.color, backgroundColor: typeCfg.color + "15", borderColor: typeCfg.color + "30" }}
                          >
                            {typeCfg.label}
                          </span>
                          {!n.read && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 shrink-0">
                              Não lida
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#4b4c6b] truncate mt-0.5">{n.body}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-[#4b4c6b]">{targetUser?.name ?? n.userId.substring(0, 8)}</p>
                        <p className="text-[10px] text-[#4b4c6b]">
                          {format(new Date(n.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
