import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Bot, QrCode, Hash, Wifi, WifiOff, Loader2, ArrowLeft, RefreshCw, Phone } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetBot, useConnectBot, useDisconnectBot, getGetBotQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  connected:    { label: "Online",      color: "#22C55E" },
  connecting:   { label: "Conectando", color: "#F59E0B" },
  disconnected: { label: "Offline",     color: "#4b4c6b" },
  error:        { label: "Erro",        color: "#EF4444" },
};

export default function BotDetailPage() {
  const params = useParams<{ botId: string }>();
  const botId = params.botId;
  const [, setLocation] = useLocation();
  const { data: bot, isLoading, refetch } = useGetBot(botId, { query: { enabled: !!botId } });
  const connectBot = useConnectBot();
  const disconnectBot = useDisconnectBot();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [phoneInput, setPhoneInput] = useState("");
  const [liveQr, setLiveQr] = useState<string | null>(null);
  const [livePairCode, setLivePairCode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connType, setConnType] = useState<"code" | "qrcode">("code");
  const sseRef = useRef<EventSource | null>(null);

  const closeSse = () => { if (sseRef.current) { sseRef.current.close(); sseRef.current = null; } };

  const openSse = (id: string) => {
    closeSse();
    const token = localStorage.getItem("bot_token") ?? "";
    const es = new EventSource(`/api/bots/${id}/stream?token=${encodeURIComponent(token)}`);
    sseRef.current = es;
    es.addEventListener("qr", (e) => { const d = JSON.parse((e as MessageEvent).data); setLiveQr(d.qrCode); setLivePairCode(null); refetch(); });
    es.addEventListener("paircode", (e) => { const d = JSON.parse((e as MessageEvent).data); setLivePairCode(d.code); setLiveQr(null); refetch(); });
    es.addEventListener("status", (e) => {
      const d = JSON.parse((e as MessageEvent).data);
      if (d.status === "connected") {
        setConnecting(false); setLiveQr(null); setLivePairCode(null); closeSse();
        toast({ title: "WhatsApp conectado!", description: `Número: +${d.phone}` });
      } else if (d.status === "disconnected") { setConnecting(false); closeSse(); }
      refetch(); queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
    });
    es.addEventListener("error", (e) => {
      try { const d = JSON.parse((e as MessageEvent).data ?? "{}"); toast({ title: "Erro", description: d.message ?? "Tente novamente.", variant: "destructive" }); } catch {}
      setConnecting(false);
    });
    es.onerror = () => {};
  };

  useEffect(() => () => closeSse(), []);

  const handleConnect = async () => {
    if (connType === "code" && !phoneInput.trim()) {
      toast({ title: "Informe o número", description: "Digite o número do WhatsApp do bot.", variant: "destructive" });
      return;
    }
    try {
      setConnecting(true); setLiveQr(null); setLivePairCode(null);
      await connectBot.mutateAsync({ botId, data: { type: connType, phone: phoneInput || undefined } });
      queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
      openSse(botId);
      toast({ title: "Aguardando...", description: connType === "qrcode" ? "QR Code sendo gerado..." : "Código sendo gerado..." });
    } catch { setConnecting(false); toast({ title: "Erro", description: "Não foi possível iniciar a conexão.", variant: "destructive" }); }
  };

  const handleDisconnect = async () => {
    try {
      closeSse(); setLiveQr(null); setLivePairCode(null); setConnecting(false);
      await disconnectBot.mutateAsync({ botId });
      queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
      toast({ title: "Bot desconectado" });
    } catch { toast({ title: "Erro", description: "Não foi possível desconectar.", variant: "destructive" }); }
  };

  const isConnecting = connecting || bot?.status === "connecting";
  const displayQr = liveQr;
  const displayCode = livePairCode ?? (bot?.status === "connecting" && bot.connectionType === "code" ? bot.pairCode : null);
  const cfg = STATUS_CFG[bot?.status ?? "disconnected"] ?? STATUS_CFG.disconnected;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-24 bg-[#0d0e16] border border-[#1a1b28] rounded-lg animate-pulse" />
          <div className="h-64 bg-[#0d0e16] border border-[#1a1b28] rounded-lg animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (!bot) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center py-20 gap-2">
          <Bot className="h-8 w-8 text-[#2a2b3e]" />
          <p className="text-[13px] text-[#4b4c6b]">Bot não encontrado</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <button
        onClick={() => setLocation("/dashboard/bots")}
        className="flex items-center gap-1.5 text-[#4b4c6b] hover:text-white text-[12px] mb-6 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar para Meus Bots
      </button>

      <div className="space-y-4">
        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5 border-l-[3px]" style={{ borderLeftColor: cfg.color }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-[#7C3AED]/15 flex items-center justify-center">
                <Bot className="h-5 w-5 text-[#7C3AED]" />
              </div>
              <div>
                <h1 className="text-[18px] font-bold text-white">{bot.name}</h1>
                <p className="text-[12px] text-[#4b4c6b]">
                  {bot.phone ? `+${bot.phone}` : "Sem número"} &bull; {bot.totalGroups} grupos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded text-[11px] font-bold border flex items-center gap-1.5" style={{ color: cfg.color, backgroundColor: cfg.color + "15", borderColor: cfg.color + "30" }}>
                {isConnecting && <Loader2 className="h-3 w-3 animate-spin" />}
                {cfg.label}
              </div>
              {bot.status === "connected" && (
                <button onClick={handleDisconnect} className="h-7 px-3 flex items-center gap-1.5 rounded-md bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[11px] font-semibold hover:bg-[#EF4444]/20 transition-colors">
                  <WifiOff className="h-3 w-3" />
                  Desconectar
                </button>
              )}
            </div>
          </div>
        </div>

        {!isConnecting && (bot.status === "disconnected" || bot.status === "error") && (
          <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5">
            <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-4">Conectar ao WhatsApp</p>

            <div className="mb-4">
              <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Número do bot (com DDI)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
                <input
                  type="tel"
                  placeholder="5511999990000"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                  maxLength={15}
                  className="w-full max-w-xs bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
              <p className="text-[11px] text-[#4b4c6b] mt-1">Somente números, com DDI (55 para Brasil)</p>
            </div>

            <div className="flex gap-1 mb-5 bg-[#131420] border border-[#1a1b28] rounded-md p-1 w-fit">
              {([["code", "Código 8 Dígitos", Hash], ["qrcode", "QR Code", QrCode]] as const).map(([t, label, Icon]) => (
                <button
                  key={t}
                  onClick={() => setConnType(t)}
                  className={`px-4 py-1.5 rounded text-[12px] font-semibold flex items-center gap-1.5 transition-colors ${connType === t ? "bg-[#7C3AED] text-white" : "text-[#4b4c6b] hover:text-[#8b8ea0]"}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {connType === "code" && (
              <p className="text-[12px] text-[#4b4c6b] mb-4">
                Gere um código. No WhatsApp vá em <span className="text-[#8b8ea0]">Dispositivos Vinculados → Vincular com número</span> e insira o código.
              </p>
            )}
            {connType === "qrcode" && (
              <p className="text-[12px] text-[#4b4c6b] mb-4">
                Clique em Gerar QR Code e escaneie em <span className="text-[#8b8ea0]">Dispositivos Vinculados → Vincular dispositivo</span>.
              </p>
            )}

            <button
              onClick={handleConnect}
              disabled={connectBot.isPending}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white text-[13px] font-bold px-5 py-2.5 rounded-md transition-colors flex items-center gap-2"
            >
              {connectBot.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : connType === "code" ? <Hash className="h-3.5 w-3.5" /> : <QrCode className="h-3.5 w-3.5" />}
              {connType === "code" ? "Gerar Código de Pareamento" : "Gerar QR Code"}
            </button>
          </div>
        )}

        {isConnecting && (
          <div className="bg-[#0d0e16] border border-[#F59E0B]/30 border-l-[3px] border-l-[#F59E0B] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-5">
              <Loader2 className="h-4 w-4 text-[#F59E0B] animate-spin" />
              <p className="text-[13px] font-semibold text-[#F59E0B]">Aguardando Conexão</p>
            </div>

            {displayCode ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-[12px] text-[#4b4c6b]">Insira este código no WhatsApp</p>
                <div className="text-5xl font-mono font-black tracking-widest text-[#7C3AED] bg-[#7C3AED]/10 px-8 py-5 rounded-lg border border-[#7C3AED]/20">
                  {displayCode}
                </div>
                <p className="text-[11px] text-[#4b4c6b] text-center">WhatsApp → Configurações → Dispositivos Vinculados → Vincular com número</p>
                <p className="text-[11px] text-[#F59E0B] text-center">O código expira em ~60 segundos. Insira rapidamente!</p>
              </div>
            ) : displayQr ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-[12px] text-[#4b4c6b]">Escaneie com seu WhatsApp</p>
                <div className="p-3 bg-white rounded-lg">
                  <img src={displayQr} alt="QR Code" className="w-56 h-56" />
                </div>
                <p className="text-[11px] text-[#4b4c6b] text-center">WhatsApp → Dispositivos Vinculados → Vincular dispositivo</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-10 w-10 text-[#7C3AED] animate-spin" />
                <p className="text-[13px] text-[#4b4c6b]">Iniciando sessão WhatsApp...</p>
              </div>
            )}

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => { refetch(); queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) }); }}
                className="flex items-center gap-1.5 text-[12px] text-[#4b4c6b] hover:text-[#8b8ea0] transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Atualizar
              </button>
              <button onClick={handleDisconnect} className="text-[12px] text-[#EF4444]/70 hover:text-[#EF4444] transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        )}

        {bot.status === "connected" && !isConnecting && (
          <div className="bg-[#0d0e16] border border-[#22C55E]/20 border-l-[3px] border-l-[#22C55E] rounded-lg p-5">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-[#22C55E]" />
              <p className="text-[14px] font-semibold text-[#22C55E]">Bot conectado e ativo!</p>
            </div>
            <p className="text-[12px] text-[#4b4c6b] mt-2">
              Seu bot está em execução. Acesse o Builder para configurar os comandos.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
