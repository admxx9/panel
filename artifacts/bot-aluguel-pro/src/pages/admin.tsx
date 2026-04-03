import { motion } from "framer-motion";
import { Users, Bot, DollarSign, Clock, ShieldAlert, Coins } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdminGetStats, useAdminListUsers, useAdminListPayments } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  paid: { label: "Pago", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  expired: { label: "Expirado", color: "bg-white/5 text-muted-foreground border-white/10" },
  error: { label: "Erro", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function AdminPage() {
  const { data: stats, isLoading: statsLoading } = useAdminGetStats();
  const { data: users, isLoading: usersLoading } = useAdminListUsers();
  const { data: payments, isLoading: paymentsLoading } = useAdminListPayments();

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
          <ShieldAlert className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-muted-foreground text-sm">Gerenciamento da plataforma</p>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl bg-card" />)}
        </div>
      ) : stats && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total de Usuarios", value: stats.totalUsers, icon: Users },
            { label: "Total de Bots", value: stats.totalBots, icon: Bot },
            { label: "Bots Ativos", value: stats.activeBots, icon: Bot },
            { label: "Receita Total", value: `R$ ${stats.totalRevenue.toFixed(2)}`, icon: DollarSign },
            { label: "Pagamentos Pendentes", value: stats.pendingPayments, icon: Clock },
            { label: "Planos Disponiveis", value: stats.totalPlans, icon: Coins },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              className="bg-card border border-white/5 rounded-xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">{item.label}</p>
              </div>
              <p className="text-2xl font-bold text-white">{item.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Tabs defaultValue="users">
        <TabsList className="bg-background border border-white/10 mb-6">
          <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
            {usersLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg bg-background" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Nome</th>
                      <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Telefone</th>
                      <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Moedas</th>
                      <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Tipo</th>
                      <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                        <td className="p-4 text-white text-sm font-medium">{user.name}</td>
                        <td className="p-4 text-muted-foreground text-sm">{user.phone}</td>
                        <td className="p-4">
                          <span className="text-primary font-semibold text-sm">{user.coins}</span>
                        </td>
                        <td className="p-4">
                          <Badge className={user.isAdmin ? "bg-accent/10 text-accent border-accent/20" : "bg-white/5 text-muted-foreground border-white/10"}>
                            {user.isAdmin ? "Admin" : "Usuario"}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground text-sm">
                          {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <div className="bg-card border border-white/5 rounded-xl overflow-hidden">
            {paymentsLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg bg-background" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Usuario</th>
                      <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Valor</th>
                      <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Moedas</th>
                      <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 text-xs text-muted-foreground font-medium uppercase tracking-wider">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments?.map((payment) => {
                      const s = statusLabels[payment.status] || statusLabels.pending;
                      return (
                        <tr key={payment.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                          <td className="p-4 text-muted-foreground text-xs font-mono">{payment.userId.substring(0, 8)}...</td>
                          <td className="p-4 text-white text-sm font-semibold">R$ {payment.amount.toFixed(2)}</td>
                          <td className="p-4 text-primary text-sm font-semibold">{payment.coins}</td>
                          <td className="p-4">
                            <Badge className={`border text-xs ${s.color}`}>{s.label}</Badge>
                          </td>
                          <td className="p-4 text-muted-foreground text-sm">
                            {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </td>
                        </tr>
                      );
                    })}
                    {payments?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground text-sm">
                          Nenhum pagamento encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
