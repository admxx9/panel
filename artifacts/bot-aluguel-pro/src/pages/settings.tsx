import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListBots, useUpdateBotSettings } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Bot, Hash, Phone, Settings, HelpCircle } from "lucide-react";

type BotSettings = {
  name: string;
  prefix: string;
  ownerPhone: string;
};

export default function SettingsPage() {
  const { data: bots, isLoading: botsLoading } = useListBots();
  const updateSettings = useUpdateBotSettings();
  const { toast } = useToast();
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const [settings, setSettings] = useState<BotSettings>({ name: "", prefix: ".", ownerPhone: "" });

  useEffect(() => {
    if (!selectedBotId || !bots) return;
    const bot = bots.find((b) => b.id === selectedBotId);
    if (bot) {
      setSettings({
        name: bot.name ?? "",
        prefix: (bot as any).prefix ?? ".",
        ownerPhone: (bot as any).ownerPhone ?? "",
      });
    }
  }, [selectedBotId, bots]);

  const handleSave = async () => {
    if (!selectedBotId) {
      toast({ title: "Selecione um bot", variant: "destructive" });
      return;
    }
    updateSettings.mutate(
      { botId: selectedBotId, data: settings },
      {
        onSuccess: () => {
          toast({ title: "Configurações salvas!", description: "As configurações do bot foram atualizadas." });
        },
        onError: (err) => {
          toast({ title: "Erro", description: (err as Error).message ?? "Não foi possível salvar.", variant: "destructive" });
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-[#1a1b28]">
        <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Bot</p>
        <h1 className="text-[20px] font-bold text-white mt-0.5">Configurações</h1>
      </div>

      <div className="max-w-xl space-y-4">
        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5">
          <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-3">Selecionar Bot</p>
          <div className="relative">
            <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
            <select
              value={selectedBotId}
              onChange={(e) => setSelectedBotId(e.target.value)}
              className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-3 py-2.5 text-[14px] text-white outline-none focus:border-[#7C3AED] transition-colors appearance-none"
            >
              <option value="">Escolha um bot para configurar</option>
              {botsLoading && <option disabled>Carregando...</option>}
              {bots?.map((bot) => (
                <option key={bot.id} value={bot.id}>{bot.name}</option>
              ))}
              {!botsLoading && (!bots || bots.length === 0) && (
                <option disabled>Crie um bot primeiro</option>
              )}
            </select>
          </div>
        </div>

        {selectedBotId && (
          <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1a1b28]">
              <Settings className="h-3.5 w-3.5 text-[#7C3AED]" />
              <p className="text-[13px] font-semibold text-[#c9cadb]">Configurações Gerais</p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Nome do Bot</label>
              <div className="relative">
                <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))}
                  placeholder="Ex: MeuBot"
                  className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#4b4c6b] mt-1">Nome de exibição do bot na plataforma</p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Prefixo dos Comandos</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
                <input
                  type="text"
                  value={settings.prefix}
                  onChange={(e) => setSettings((s) => ({ ...s, prefix: e.target.value }))}
                  placeholder=". ou ! ou /"
                  maxLength={3}
                  className="w-full max-w-28 bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#4b4c6b] mt-1">
                Caractere que precede os comandos. Ex: <span className="text-[#8b8ea0] font-mono">.sticker</span>, <span className="text-[#8b8ea0] font-mono">!ban</span>
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Número do Dono (com DDI)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
                <input
                  type="text"
                  value={settings.ownerPhone}
                  onChange={(e) => setSettings((s) => ({ ...s, ownerPhone: e.target.value.replace(/\D/g, "") }))}
                  placeholder="5511999990000"
                  maxLength={15}
                  className="w-full max-w-xs bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#4b4c6b] mt-1">Número com DDI (55 para Brasil) — usado para comandos de admin</p>
            </div>

            <div className="pt-1">
              <button
                onClick={handleSave}
                disabled={updateSettings.isPending}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white text-[13px] font-bold px-5 py-2.5 rounded-md transition-colors flex items-center gap-2"
              >
                {updateSettings.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Salvar Configurações
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1b28]">
            <HelpCircle className="h-3.5 w-3.5 text-[#4b4c6b]" />
            <p className="text-[13px] font-semibold text-[#c9cadb]">Como os Comandos Funcionam</p>
          </div>
          <div className="space-y-3">
            {[
              {
                tag: ".sticker",
                color: "#7C3AED",
                desc: <>Com o prefixo <span className="text-[#8b8ea0]">.</span> e gatilho <span className="text-[#8b8ea0]">sticker</span>, o bot responde ao comando <span className="text-[#8b8ea0] font-mono">.sticker</span> enviado em grupos.</>,
              },
              {
                tag: "Builder",
                color: "#7C3AED",
                desc: <>Use o <span className="text-[#8b8ea0]">Construtor Visual</span> para montar o fluxo: Comando → Ação → Resposta.</>,
              },
              {
                tag: "Live",
                color: "#22C55E",
                desc: <>O bot precisa estar <span className="text-[#8b8ea0]">conectado</span> ao WhatsApp para processar comandos em tempo real.</>,
              },
            ].map((item) => (
              <div key={item.tag} className="flex items-start gap-3 text-[12px] text-[#4b4c6b]">
                <span
                  className="font-mono font-bold text-[11px] px-2 py-0.5 rounded shrink-0 mt-0.5"
                  style={{ color: item.color, backgroundColor: item.color + "15", border: `1px solid ${item.color}30` }}
                >
                  {item.tag}
                </span>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
