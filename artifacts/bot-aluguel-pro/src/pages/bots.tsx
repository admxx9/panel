import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Bot, Plus, Wifi, WifiOff, Loader2, Trash2, ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useListBots, useCreateBot, useDeleteBot } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListBotsQueryKey } from "@workspace/api-client-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  connected: { label: "Conectado", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: Wifi },
  connecting: { label: "Conectando...", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: Loader2 },
  disconnected: { label: "Desconectado", color: "bg-white/5 text-muted-foreground border-white/10", icon: WifiOff },
  error: { label: "Erro", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: WifiOff },
};

export default function BotsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const { data: bots, isLoading } = useListBots();
  const createBot = useCreateBot();
  const deleteBot = useDeleteBot();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!newBotName.trim()) return;
    try {
      await createBot.mutateAsync({ data: { name: newBotName } });
      queryClient.invalidateQueries({ queryKey: getListBotsQueryKey() });
      toast({ title: "Bot criado!", description: `"${newBotName}" foi criado com sucesso.` });
      setNewBotName("");
      setShowCreate(false);
    } catch {
      toast({ title: "Erro", description: "Nao foi possivel criar o bot.", variant: "destructive" });
    }
  };

  const handleDelete = async (botId: string, botName: string) => {
    if (!confirm(`Deseja remover o bot "${botName}"?`)) return;
    try {
      await deleteBot.mutateAsync({ botId });
      queryClient.invalidateQueries({ queryKey: getListBotsQueryKey() });
      toast({ title: "Bot removido", description: `"${botName}" foi removido.` });
    } catch {
      toast({ title: "Erro", description: "Nao foi possivel remover o bot.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Meus Bots</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie suas conexoes de WhatsApp</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Novo Bot
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl bg-card" />
          ))}
        </div>
      ) : bots && bots.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot, i) => {
            const status = statusConfig[bot.status] || statusConfig.disconnected;
            const StatusIcon = status.icon;
            return (
              <motion.div
                key={bot.id}
                className="bg-card border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <Badge className={`border text-xs ${status.color}`}>
                    <StatusIcon className={`h-3 w-3 mr-1 ${bot.status === "connecting" ? "animate-spin" : ""}`} />
                    {status.label}
                  </Badge>
                </div>
                <h3 className="text-white font-semibold mb-1">{bot.name}</h3>
                <p className="text-muted-foreground text-xs mb-4">
                  {bot.phone ? `+${bot.phone}` : "Sem telefone vinculado"} &bull; {bot.totalGroups} grupos
                </p>
                <div className="flex gap-2">
                  <Link href={`/dashboard/bots/${bot.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Gerenciar
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => handleDelete(bot.id, bot.name)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-xl">
          <Bot className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">Nenhum bot criado</h3>
          <p className="text-muted-foreground text-sm mb-6">Crie seu primeiro bot e conecte ao WhatsApp</p>
          <Button onClick={() => setShowCreate(true)} className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Criar primeiro bot
          </Button>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Criar novo bot</DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-white/80 text-sm mb-2 block">Nome do bot</Label>
            <Input
              placeholder="Ex: Bot Principal, Bot Vendas..."
              value={newBotName}
              onChange={(e) => setNewBotName(e.target.value)}
              className="bg-background border-white/10 text-white"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)} className="text-muted-foreground">
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={createBot.isPending} className="bg-primary text-white">
              {createBot.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Bot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
