import { useState } from "react";
import { Link } from "wouter";
import { Bot, Plus, Wifi, WifiOff, Loader2, Trash2, Settings, Wrench } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useListBots, useCreateBot, useDeleteBot } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListBotsQueryKey } from "@workspace/api-client-react";

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  connected:    { label: "Online",      color: "#22C55E" },
  connecting:   { label: "Conectando",  color: "#F59E0B" },
  disconnected: { label: "Offline",     color: "#4b4c6b" },
  error:        { label: "Erro",        color: "#EF4444" },
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
      toast({ title: "Erro", description: "Não foi possível criar o bot.", variant: "destructive" });
    }
  };

  const handleDelete = async (botId: string, botName: string) => {
    if (!confirm(`Deseja remover o bot "${botName}"?`)) return;
    try {
      await deleteBot.mutateAsync({ botId });
      queryClient.invalidateQueries({ queryKey: getListBotsQueryKey() });
      toast({ title: "Bot removido", description: `"${botName}" foi removido.` });
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover o bot.", variant: "destructive" });
    }
  };

  const botList = bots ?? [];

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-[#1a1b28] flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Gerenciamento</p>
          <h1 className="text-[20px] font-bold text-white mt-0.5">Meus Bots</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-bold px-4 py-2 rounded-md transition-colors flex items-center gap-2"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo Bot
        </button>
      </div>

      <div className="flex gap-4 mb-5">
        {[
          { label: "Total", value: botList.length, color: "#7C3AED" },
          { label: "Online", value: botList.filter(b => b.status === "connected").length, color: "#22C55E" },
          { label: "Offline", value: botList.filter(b => b.status === "disconnected").length, color: "#4b4c6b" },
        ].map(stat => (
          <div key={stat.label} className="flex items-center gap-2 bg-[#0d0e16] border border-[#1a1b28] rounded-md px-3 py-2">
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stat.color }} />
            <span className="text-[12px] text-[#8b8ea0]">{stat.value} {stat.label}</span>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#0d0e16] border border-[#1a1b28] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : botList.length > 0 ? (
        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-2 border-b border-[#1a1b28]">
            <div className="w-3" />
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Bot</p>
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Grupos</p>
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase w-24">Status</p>
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Ações</p>
          </div>
          {botList.map((bot, i) => {
            const cfg = STATUS_CFG[bot.status] ?? STATUS_CFG.disconnected;
            return (
              <div
                key={bot.id}
                className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center hover:bg-[#090A0F] transition-colors ${i < botList.length - 1 ? "border-b border-[#1a1b28]" : ""}`}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
                <div>
                  <p className="text-[13px] font-semibold text-[#c9cadb]">{bot.name}</p>
                  <p className="text-[11px] text-[#4b4c6b]">{bot.phone ? `+${bot.phone}` : "Sem número"}</p>
                </div>
                <p className="text-[12px] text-[#8b8ea0] text-center">{bot.totalGroups}</p>
                <div
                  className="px-2 py-1 rounded text-[11px] font-semibold w-24 text-center"
                  style={{ backgroundColor: cfg.color + "15", color: cfg.color }}
                >
                  {cfg.label}
                </div>
                <div className="flex items-center gap-1.5">
                  <Link href={`/dashboard/bots/${bot.id}`}>
                    <button className="h-7 w-7 flex items-center justify-center rounded-md bg-[#131420] border border-[#1a1b28] text-[#8b8ea0] hover:text-white hover:border-[#7C3AED]/40 transition-colors" title="Gerenciar">
                      <Settings className="h-3 w-3" />
                    </button>
                  </Link>
                  <Link href={`/dashboard/builder?botId=${bot.id}`}>
                    <button className="h-7 w-7 flex items-center justify-center rounded-md bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#7C3AED]/25 transition-colors" title="Construtor">
                      <Wrench className="h-3 w-3" />
                    </button>
                  </Link>
                  <button
                    className="h-7 w-7 flex items-center justify-center rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors"
                    onClick={() => handleDelete(bot.id, bot.name)}
                    title="Remover"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#0d0e16] border border-[#1a1b28] rounded-lg gap-3">
          <div className="h-14 w-14 rounded-xl bg-[#131420] border border-[#1a1b28] flex items-center justify-center">
            <Bot className="h-6 w-6 text-[#2a2b3e]" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-[#4b4c6b]">Nenhum bot criado</p>
            <p className="text-[12px] text-[#2a2b3e] mt-1">Crie seu primeiro bot e conecte ao WhatsApp</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="border border-[#7C3AED] text-[#7C3AED] text-[12px] font-semibold px-4 py-2 rounded-md hover:bg-[#7C3AED]/10 transition-colors flex items-center gap-2 mt-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Criar primeiro bot
          </button>
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-[15px] font-bold text-[#f1f2f6] mb-5">Criar novo bot</h3>
            <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Nome do Bot</label>
            <input
              type="text"
              placeholder="Ex: Bot Vendas"
              value={newBotName}
              onChange={(e) => setNewBotName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
              className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md px-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 border border-[#1a1b28] text-[#4b4c6b] text-[13px] font-semibold py-2.5 rounded-md hover:text-[#8b8ea0] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={createBot.isPending}
                className="flex-1 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-bold py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {createBot.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Criar Bot
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
