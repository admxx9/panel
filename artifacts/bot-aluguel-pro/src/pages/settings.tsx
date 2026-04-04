import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListBots } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Settings, Bot, Hash, Phone } from "lucide-react";

type BotSettings = {
  name: string;
  prefix: string;
  ownerPhone: string;
};

export default function SettingsPage() {
  const { data: bots, isLoading: botsLoading } = useListBots();
  const { toast } = useToast();
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const [settings, setSettings] = useState<BotSettings>({ name: "", prefix: ".", ownerPhone: "" });
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      const token = localStorage.getItem("bot_token") ?? "";
      const res = await fetch(`/api/bots/${selectedBotId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Erro ao salvar");
      }
      toast({ title: "Configurações salvas!", description: "As configurações do bot foram atualizadas." });
    } catch (err) {
      toast({
        title: "Erro",
        description: (err as Error).message ?? "Não foi possível salvar.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Configurações do Bot</h1>
        <p className="text-muted-foreground text-sm mt-1">Personalize o prefixo, nome e número do dono</p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="bg-card border border-white/5 rounded-xl p-6 space-y-5">
          <div>
            <Label className="text-white/80 text-sm mb-2 block">
              <Bot className="inline h-3.5 w-3.5 mr-1" />
              Selecionar Bot
            </Label>
            <Select onValueChange={setSelectedBotId} value={selectedBotId}>
              <SelectTrigger className="bg-background border-white/10 text-white">
                <SelectValue placeholder="Escolha um bot para configurar" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {botsLoading && (
                  <SelectItem value="loading" disabled className="text-muted-foreground">
                    Carregando...
                  </SelectItem>
                )}
                {bots?.map((bot) => (
                  <SelectItem key={bot.id} value={bot.id} className="text-white hover:bg-white/5">
                    {bot.name}
                  </SelectItem>
                ))}
                {!botsLoading && (!bots || bots.length === 0) && (
                  <SelectItem value="none" disabled className="text-muted-foreground">
                    Crie um bot primeiro
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedBotId && (
          <div className="bg-card border border-white/5 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <Settings className="h-4 w-4 text-primary" />
              <h2 className="text-white font-semibold">Configurações Gerais</h2>
            </div>

            <div>
              <Label className="text-white/80 text-sm mb-2 block">Nome do Bot</Label>
              <Input
                value={settings.name}
                onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))}
                placeholder="Ex: MeuBot"
                className="bg-background border-white/10 text-white"
              />
              <p className="text-xs text-muted-foreground mt-1">Nome de exibição do bot na plataforma</p>
            </div>

            <div>
              <Label className="text-white/80 text-sm mb-2 block">
                <Hash className="inline h-3.5 w-3.5 mr-1" />
                Prefixo dos Comandos
              </Label>
              <Input
                value={settings.prefix}
                onChange={(e) => setSettings((s) => ({ ...s, prefix: e.target.value }))}
                placeholder="Ex: . ou ! ou /"
                maxLength={3}
                className="bg-background border-white/10 text-white max-w-24"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Caractere que precede os comandos. Ex: <span className="text-white/60">.</span>sticker, <span className="text-white/60">!</span>ban
              </p>
            </div>

            <div>
              <Label className="text-white/80 text-sm mb-2 block">
                <Phone className="inline h-3.5 w-3.5 mr-1" />
                Número do Dono (com DDI)
              </Label>
              <Input
                value={settings.ownerPhone}
                onChange={(e) => setSettings((s) => ({ ...s, ownerPhone: e.target.value.replace(/\D/g, "") }))}
                placeholder="Ex: 5511999990000"
                maxLength={15}
                className="bg-background border-white/10 text-white max-w-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Número com DDI (55 para Brasil) — usado para comandos de admin
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Configurações
              </Button>
            </div>
          </div>
        )}

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-3">Como os Comandos Funcionam</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <span className="bg-primary/10 text-primary border border-primary/20 rounded px-2 py-0.5 text-xs font-mono font-bold mt-0.5 flex-shrink-0">.sticker</span>
              <p>Com o prefixo <span className="text-white/70">.</span> e gatilho <span className="text-white/70">sticker</span>, o bot responde ao comando <span className="text-white/70">.sticker</span> enviado em grupos.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded px-2 py-0.5 text-xs font-mono font-bold mt-0.5 flex-shrink-0">Builder</span>
              <p>Use o <span className="text-white/70">Construtor Visual</span> para montar o fluxo: Comando → Ação → Resposta.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="bg-green-500/10 text-green-400 border border-green-500/20 rounded px-2 py-0.5 text-xs font-mono font-bold mt-0.5 flex-shrink-0">Live</span>
              <p>O bot precisa estar <span className="text-white/70">conectado</span> ao WhatsApp para processar comandos em tempo real.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
